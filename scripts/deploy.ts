import { ethers, upgrades } from "hardhat";
import { IUniswapV2Router02__factory, IERC20__factory, WETH__factory, ERC20__factory, Vault__factory } from "../typechain";
import fs from "fs";

async function test() {
    const signers = await ethers.getSigners();
    const wallet = signers[0];
    const token = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const router = IUniswapV2Router02__factory.connect("0x7a250d5630b4cf539739df2c5dacb4c659f2488d", wallet);
    await router.swapExactETHForTokens(0, ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", token], wallet.address, "1000000000000000000", { value: ethers.utils.parseEther("1"), maxFeePerGas: "20564098716" });
    const usdc = ERC20__factory.connect(token, wallet);
    const balance = await usdc.balanceOf(wallet.address);
    console.log(balance.toString());

    const vaultFatory = await ethers.getContractFactory("Vault");
    const name = "MAZIG Vault";
    const symbol = "MAZIG";
    const admin = wallet.address;
    const aaveV3Addresses = ["0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"];
    const compoundV3Addresses = ["0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840"];
    const vaultDeploy = await upgrades.deployProxy(vaultFatory, [name, symbol, admin, token, aaveV3Addresses, compoundV3Addresses], { initializer: "initialize" });
    const vault = await vaultDeploy.deployed();

    const data = {
        vault: vault.address,
        token: token
    }
    fs.writeFileSync("./config/deployed.json", JSON.stringify(data));
}

test().catch((error) => {
    console.error(error);
    process.exit(1);
});
