require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		compilers: [
			{
				version: "0.8.8",
			},
			{
				version: "0.6.12",
			},
			{
				version: "0.4.19",
			},
		],
	},
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {
			chainId: 1337,
			forking: {
				url: process.env.MAINNET_RPC_URL,
			},
		},
		localhost: {
			chainId: 1337,
			forking: {
				url: process.env.MAINNET_RPC_URL,
			},
		},
	},
	namedAccounts: {
		deployer: {
			default: 0,
		},
		player: {
			default: 1,
		},
	},
};
