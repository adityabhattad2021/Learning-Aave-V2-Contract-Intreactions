const { getNamedAccounts, ethers,network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");


const AMOUNT = ethers.utils.parseEther("0.01");


// wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
// lendingPoolAddressesProvider: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
// daiEthPriceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
// daiToken: "0x6b175474e89094c44da98b954eedeac495271d0f"

async function getWETH() {
	const { deployer } = await getNamedAccounts();
	const chainId = network.config.chainId

	// Address of WETH on mainnet is  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

 
	const iWeth = await ethers.getContractAt(
		"IWeth",
		networkConfig[chainId]["wethToken"],
		deployer
	);

    const transectionResponse = await iWeth.deposit({ value: AMOUNT });
    await transectionResponse.wait(1)
    const wETHBalance = await iWeth.balanceOf(deployer)
    console.log(`The balance is ${wETHBalance} wETH.`);
}


module.exports = {getWETH,AMOUNT}