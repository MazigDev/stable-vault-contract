import { ethers, upgrades } from "hardhat";
import { IUniswapV2Router02__factory, IERC20__factory, WETH__factory, ERC20__factory , Vault__factory} from "../typechain";
import fs from "fs";

async function test() {
    const signers = await ethers.getSigners();
    const wallet = signers[0];
    const token = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const router = IUniswapV2Router02__factory.connect("0x7a250d5630b4cf539739df2c5dacb4c659f2488d", wallet);
    await router.swapExactETHForTokens(0, ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", token], wallet.address, "1000000000000000000", { value: ethers.utils.parseEther("1") });
    const usdc = ERC20__factory.connect(token, wallet);
    const balance = await usdc.balanceOf(wallet.address);
    console.log(balance.toString());

    const vaultFatory = await ethers.getContractFactory("Vault");
    const name = "MAZIG Vault";
    const symbol = "MAZIG";
    const admin = wallet.address;
    const aaveV2Addresses = ["0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9"];
    const aaveV3Addresses = ["0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"];
    const compoundV2Addresses = ["0x39AA39c021dfbaE8faC545936693aC917d5E7563"]
    const compoundV3Addresses = ["0xc3d688B66703497DAA19211EEdff47f25384cdc3"]
    const vaultDeploy = await upgrades.deployProxy(vaultFatory, [name, symbol, admin, token, aaveV2Addresses, aaveV3Addresses, compoundV2Addresses, compoundV3Addresses], { initializer: "initialize"  });
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
