const { getWETH, AMOUNT } = require("../scripts/getWETH");
const { getNamedAccounts, ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

//      For Refrence.
//         wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
//         lendingPoolAddressesProvider: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
//         daiEthPriceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
//         daiTokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f"

async function main() {
	// 1. Deposit Collateral: ETH / WETH. (See README.md)
	await getWETH();
	const { deployer } = await getNamedAccounts();
	const chainId = network.config.chainId;

	const lendingPool = await getLendingPool(deployer, chainId);
	console.log(`Lending Pool is at address ${lendingPool.address}`);

	console.log("--------------------------------------------------------");
	console.log("Approving Deposit...");
	const wETHTokenAddress = networkConfig[chainId]["wethToken"];
	await approveERC20(wETHTokenAddress, lendingPool.address, AMOUNT, deployer);
	console.log("Approved Successfully!");
	console.log("--------------------------------------------------------");
	console.log(`Trying to Deposit...`);
	await lendingPool.deposit(wETHTokenAddress, AMOUNT, deployer, 0);
	console.log("Deposited Successfully!");
	console.log("--------------------------------------------------------");

	// 2. Borrow Another Asset: DAI (See README.md)
	// First we nned to know how much we have borrowed, how much we have in collateral and how much we have in colateral.
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
        lendingPool,deployer
    )
    // Now for this tutorial sake we will borrow DAI tokens for ETH
    // 1. We need to know what the conversion rate of DAI to ETH is.
    // 496855708757558 = 4968.55708757558 DAI per 1 ETH
    let daiPrice = await getDAIPrice(chainId)
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toString())
    console.log(`The current user can borrow ${amountDaiToBorrow} DAI Tokens.`);

    // As DAI token like ETH also has 18 decimal places. 
    const amountDaiToBorrowInWei = ethers.utils.parseEther(amountDaiToBorrow.toString())
	console.log("--------------------------------------------------------");
    console.log("Trying to Borrow DAI...")
    const  daiTokenAddress=networkConfig[chainId]["daiTokenAddress"]
    await borrowDAI(daiTokenAddress, lendingPool, amountDaiToBorrowInWei, deployer)
    console.log("Borrowed DAI tokens Successfully!");
    console.log("--------------------------------------------------------");
    // Deposited ETH price will be higher as we will be gaining intrest on deposited ETH with passing time.
    await getBorrowUserData(
        lendingPool,deployer
    )


	// 3. Repay the DAI (See README.md)
	console.log("--------------------------------------------------------");
	console.log("Trying to repay the amount of DAI borrowed.");
	await repay(amountDaiToBorrowInWei, daiTokenAddress, lendingPool, deployer);
	console.log("Successfully Repaid!");
	console.log("--------------------------------------------------------");
	await getBorrowUserData(
        lendingPool,deployer
	)
	// The reason it still shows little amount of ETH borrowed is that because when we borrow DAI (any token in that case) we still have to pay some intrest even after returning the entire amount of DAI borrowed.

}

async function getLendingPool(account, chainId) {
	const lendingPoolAddressesProvider = await ethers.getContractAt(
		"ILendingPoolAddressesProvider",
		networkConfig[chainId]["lendingPoolAddressesProvider"],
		account
	);

	const lendingPoolAddress =
		await lendingPoolAddressesProvider.getLendingPool();

	const lendingPool = await ethers.getContractAt(
		"ILendingPool",
		lendingPoolAddress,
		account
	);

	return lendingPool;
}

async function approveERC20(
	erc20Address,
	spenderAddress,
	amountToSpend,
	account
) {
	const erc20Token = await ethers.getContractAt(
		"IERC20",
		erc20Address,
		account
	);
	const transectionResponse = await erc20Token.approve(
		spenderAddress,
		amountToSpend
	);
	await transectionResponse.wait(1);

	console.log(`Approved from "approveERC20" function.`);
}

async function getBorrowUserData(lendingPool, account) {
	const {
		totalCollateralETH,
		totalDebtETH,
		availableBorrowsETH,
		healthFactor,
	} = await lendingPool.getUserAccountData(account);
	console.log(
		`The current user has ${totalCollateralETH} worth of ETH deposited.`
	);
	console.log(`The current user has ${totalDebtETH} worth of ETH borrwed.`);
	console.log(
		`The current user can borrow ${availableBorrowsETH} worth of ETH.`
	);
	console.log(`The current user has health factor of ${healthFactor}.`);

    return { availableBorrowsETH, totalDebtETH };
}


async function getDAIPrice(chainId) {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        networkConfig[chainId]["daiEthPriceFeed"]
    )
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString()}.`);
    return price
}


async function borrowDAI(
    daiAddress,
    lendingPool,
    amountDaiToBorrowInWei,
    account
) {
    const borrowTransection=await lendingPool.borrow(
        daiAddress,
        amountDaiToBorrowInWei,
        1,
        0,
        account
    )
    await borrowTransection.wait(1)
    console.log(`Borrowed ${amountDaiToBorrowInWei} DAI.`);
}


async function repay(amount, daiAddress, lendingPool, account) {
	await approveERC20(daiAddress, lendingPool.address, amount, account)
	const repayTransection = await lendingPool.repay(daiAddress, amount, 1, account)
	await repayTransection.wait(1)
}


main()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
