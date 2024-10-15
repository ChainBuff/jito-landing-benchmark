# Solana Jito Landing Benchmark

> Using this at your own risk.

This is a demo to test Jito landing rate and average slot gap for successful RPC calls to Jito landing.

## .env config

- `KEY_PATH`: Solana wallet private key file path.
- `RPC_URL`: Solana RPC endpoint.
- `JITO_BLOCK_ENGINE_URL`: Jito block engine mainnet address, refer to [Jito mainnet address](https://jito-labs.gitbook.io/mev/searcher-resources/block-engine/mainnet-addresses).
- `WAITING_TIME`: Waiting time between sending a bundle and getting the status of the bundle.
- `ROUNDS`: Total rounds of sending bundles.
- `JITO_TIP`: Tips sent to Jito Tip Accounts in lamports. The minimum is 1000.
- `BUFF_TIP`: `True` or `False`. Donate tips to the Buff community in lamports. The default amount is 10% of `JITO_TIP`.

Example .env

```
KEY_PATH=/home/sol/pump8rbGjRWKnfKe3RTwjEBuSHh3TR3h3ombvXUdgun.json
RPC_URL=http://127.0.0.1:8899
JITO_BLOCK_ENGINE_URL=https://frankfurt.mainnet.block-engine.jito.wtf
WAITING_TIME=5
ROUNDS=5
JITO_TIP=1000
BUFF_TIP=True
```

## Running

Before running, make sure that the `.env.example` file is renamed to `.env` and that the parameters are configured correctly.

```bash
npm install
npm run start
```

Example output:

```
payer: pump8rbGjRWKnfKe3RTwjEBuSHh3TR3h3ombvXUdgun
balance: 2969159 lamports
Current Slot: 295763238
Bundle sent, id: d57a85a3f47e6595a303a8a67e2024675bc905aa476a7fdd18a70939f33140a6
Slot behind: 4
balance: 2963059 lamports
Current Slot: 295763251
Bundle sent, id: 3c483e73c0615d6e03ce41920d41538bbc4b7b3f2246fadb3bc59eabdc24e3c3
Slot behind: 4
balance: 2956959 lamports
Current Slot: 295763262
Bundle sent, id: 66acc2a9fd1ec899e1f526dbef9150369fb00e53ad7dba2a3cd7474b6c597216
Slot behind: 5
balance: 2950859 lamports
Current Slot: 295763274
Bundle sent, id: 3fa700dc80a2faec6ce218d924b28083e249ff543419de702b5c622d54d39998
Slot behind: 6
balance: 2944759 lamports
Current Slot: 295763285
Bundle sent, id: 54b21d533266a7644997eac77b19e989fe7adcdd7f2b3f4cf0e951fb8d85f5c6
Slot behind: 4

---
Average slots behind: 4.6
Success Rate: 100.00%
```

Example transaction:

https://solscan.io/tx/4cty82ZXXNwrcfKy5kHytvN7R71umGUr2i6RPK6U25scrWDEKofVYzC1BKaYZvVzzCXDijDAMj4swj8EX8EioehW

## Feedback

Buff community: https://t.me/chainbuff
