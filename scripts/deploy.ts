import { ethers, upgrades } from "hardhat";
import { IUniswapV2Router02__factory, IERC20__factory, WETH__factory, ERC20__factory, Vault__factory, ProxyAdmin__factory } from "../typechain";

async function test() {
    const signers = await ethers.getSigners();
    const wallet = signers[0];
    const token = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const router = IUniswapV2Router02__factory.connect("0x7a250d5630b4cf539739df2c5dacb4c659f2488d", wallet);
    await router.swapExactETHForTokens(
        0,
        ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", token],
        wallet.address,
        "1000000000000000000",
        { value: ethers.utils.parseEther("1"), maxFeePerGas: "20564098716" });
    const usdc = ERC20__factory.connect(token, wallet);
    const balance = await usdc.balanceOf(wallet.address);
    console.log(balance.toString());

    const vaultFatory = await ethers.getContractFactory("Vault");
    const name = "MAZIG Vault";
    const symbol = "MAZIG";
    const admin = wallet.address;
    const aaveV3Addresses: any = ["0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"];
    const compoundV3Addresses: any = ["0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840"];
    const compoundV2Addresses: any = [];

    const vaultImp = await vaultFatory.deploy();

    // const proxyAdminFactory = await ethers.getContractFactory("ProxyAdmin");
    // let proxyAdmin = await proxyAdminFactory.deploy();

    // const proxyFactory = await ethers.getContractFactory("TransparentUpgradeableProxy");
    // const initializerData = vaultImp.interface.encodeFunctionData("initialize", [
    //     name,
    //     symbol,
    //     admin,
    //     admin,
    //     token,
    //     aaveV3Addresses,
    //     compoundV2Addresses,
    //     compoundV3Addresses,
    //     10,
    // ]);
    // const proxy = await proxyFactory.deploy(vaultImp.address, proxyAdmin.address, initializerData);
    // const vault = Vault__factory.connect(proxy.address, wallet);

    const proxyAdmin = ProxyAdmin__factory.connect("0xEd394d79e7d7eAA8B68b5fd8bC1BBeD0f4Faf712", wallet);
    await proxyAdmin.upgrade("0x754F25e6E1afcD58A12682286229A865781B9fff", vaultImp.address);
    const vault = Vault__factory.connect("0x754F25e6E1afcD58A12682286229A865781B9fff", wallet);
    console.log("Proxy Admin address:", proxyAdmin.address);
    console.log("Vault address:", vault.address);
    console.log("Vault limitDeadlineBlock:", await vault.limitDeadlineTimestamp());
    // await upgrades.deployProxy(vaultFatory, [name, symbol, admin, admin, token, aaveV3Addresses, compoundV2Addresses, compoundV3Addresses, 10], { initializer: "initialize" });
}

test().catch((error) => {
    console.error(error);
    process.exit(1);
});
