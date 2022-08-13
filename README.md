# This is an implimentation to intract with AAVE Protocals V2 Contracts with this Project we are going to learn to:
1. Deposit Collateral: ETH / WETH
2. Borrow Another Asset: DAI 
3. Repay the DAI

# Usage

This repo requires a mainnet rpc provider, but don't worry! You won't need to spend any real money. We are going to be `forking` mainnet, and pretend as if we are interacting with mainnet contracts. 

All you'll need, is to set a `MAINNET_RPC_URL` environment variable in a `.env` file that you create.

Run:

```
yarn hardhat run scripts/aaveBorrow.js
```


Thank You!