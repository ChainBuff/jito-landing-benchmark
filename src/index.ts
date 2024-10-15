import dotenv from 'dotenv';
import fs from 'fs';
import {
    Keypair,
    Connection,
    SystemProgram,
    PublicKey,
    TransactionMessage,
    VersionedTransaction
} from '@solana/web3.js';
import bs58 from 'bs58';
import axios from "axios";
import { mean } from "mathjs";

dotenv.config();

const JITO_BLOCK_ENGINE_URL = `${process.env.JITO_BLOCK_ENGINE_URL}/api/v1/bundles`;
const JITO_TIP_ACCOUNTS = [
    '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
    'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
    'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
    'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
    'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
    'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
    'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
    '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
];

const ROUNDS = parseInt(process.env.ROUNDS || "1", 10);
const WAITING_TIME = parseInt(process.env.WAITING_TIME || "1", 10) * 1000;

const rpcUrl = process.env.RPC_URL;
const keyPath = process.env.KEY_PATH;
if (!rpcUrl) {
    throw new Error('Missing RPC_URL in .env file');
}
if (!keyPath) {
    throw new Error('Missing KEY_PATH in .env file');
}
const connection = new Connection(rpcUrl, 'confirmed');
const payer = Keypair.fromSecretKey(Uint8Array.from(
    JSON.parse(fs.readFileSync(keyPath, 'utf-8'))
));
console.log(`payer: ${payer.publicKey.toBase58()}`);

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function buildTransaction(jitoTipAccount: string, tip: number, BUFF_TIP: boolean) {
    let ixs = [];

    ixs.push(
        SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: new PublicKey(jitoTipAccount),
            lamports: tip,
        })
    );

    if (BUFF_TIP) {
        ixs.push(
            SystemProgram.transfer({
                fromPubkey: payer.publicKey,
                toPubkey: new PublicKey('buffaAJKmNLao65TDTUGq8oB9HgxkfPLGqPMFQapotJ'),
                lamports: tip * 0.1,
            })
        );
    }

    const { blockhash } = await connection.getLatestBlockhash();
    const messageV0 = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: blockhash,
        instructions: ixs,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([payer]);

    return bs58.encode(transaction.serialize());
}

async function main() {
    const slotsBehind: number[] = [];
    let successCount = 0;

    for (let i = 1; i <= ROUNDS; i++) {
        const balance = await connection.getBalance(payer.publicKey);
        console.log(`balance: ${balance} lamports`);

        const currentSlot = await connection.getSlot();
        console.log("Current Slot:", currentSlot);

        const randomIndex = Math.floor(Math.random() * JITO_TIP_ACCOUNTS.length);
        const jitoTipAccount = JITO_TIP_ACCOUNTS[randomIndex];

        const tip = parseFloat(process.env.JITO_TIP || "0");
        const buffTip = process.env.BUFF_TIP === 'True';

        const base58Transaction = await buildTransaction(jitoTipAccount, tip, buffTip);

        const bundleData = {
            jsonrpc: "2.0",
            id: 1,
            method: "sendBundle",
            params: [[base58Transaction]]
        };

        try {
            const bundleResp = await axios.post(JITO_BLOCK_ENGINE_URL, bundleData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const bundleId = bundleResp.data.result;
            console.log(`Bundle sent, id: ${bundleId}`);

            await wait(WAITING_TIME);

            const bundleStatusData = {
                jsonrpc: "2.0",
                id: 1,
                method: "getBundleStatuses",
                params: [[bundleId]]
            };

            const bundleStatusResp = await axios.post(JITO_BLOCK_ENGINE_URL, bundleStatusData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (bundleStatusResp.data.result.value && bundleStatusResp.data.result.value.length > 0) {
                const landingSlot = bundleStatusResp.data.result.value[0].slot;
                console.log(`Slot behind: ${landingSlot - currentSlot}`);
                slotsBehind.push(landingSlot - currentSlot);
                successCount++;
            } else {
                console.log('Landing failed');
            }

        } catch (error) {
            console.error("Error sending bundle or fetching status:", error);
        }
    }

    console.log("\n---");

    if (slotsBehind.length > 0) {
        console.log(`Average slots behind: ${mean(slotsBehind)}`);
    } else {
        console.log("No valid slots behind data collected.");
    }

    const successRate = (successCount / ROUNDS) * 100;
    console.log(`Success Rate: ${successRate.toFixed(2)}%`);
}

main().catch(console.error);
