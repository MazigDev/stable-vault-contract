import { ethers, upgrades } from "hardhat";
import { TransparentUpgradeableProxy__factory, Vault__factory, TransparentUpgradeableProxy } from "../typechain";

async function test() {
    const signers = await ethers.getSigners();
    const wallet = signers[0];

    // const vaultFactory = await ethers.getContractFactory("Vault");
    // const vault = await vaultFactory.deploy();
    // let tx = await vault.deployed();
    // console.log("Vault address:", tx.address);

    const vaultImp = Vault__factory.connect("0xA1846E3897beC4cc50795e9039561F600605413A", wallet);
    const token = "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409";
    const owner = "0x86d84e719e87Ae7627297738eBE7Fb4128C274a6";
    // const owner = signers[1].address;
    console.log("Address:", wallet.address);
    console.log("Vault implementation address:", vaultImp.address);

    // const proxyAdminFactory = await ethers.getContractFactory("ProxyAdmin");
    // let proxyAdmin = await proxyAdminFactory.deploy();
    // proxyAdmin = await proxyAdmin.deployed();
    // const tx = await proxyAdmin.transferOwnership(owner);
    // await tx.wait();
    // console.log("ProxyAdmin address:", proxyAdmin.address);
    const proxyAdmin = "0x9ac11f57796C2C952217879926C369dBDfa09ee1";

    const proxyFactory = await ethers.getContractFactory("TransparentUpgradeableProxy");
    const name = "MAZIG Vault";
    const symbol = "MAZIG";
    const admin = wallet.address;

    const aaveV3Addresses = ["0x6807dc923806fE8Fd134338EABCA509979a7e0cB"];
    const compoundV2Addresses: any = ["0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba"];
    const initializerData = vaultImp.interface.encodeFunctionData("initialize", [
        name,
        symbol,
        owner,
        admin,
        token,
        aaveV3Addresses,
        compoundV2Addresses,
    ]);

    const proxyTx = await proxyFactory.deploy(vaultImp.address, proxyAdmin, initializerData);
    const proxy = await proxyTx.deployed();

    const vault = Vault__factory.connect(proxy.address, wallet);
    console.log("Vault address:", vault.address);
    console.log("Vault owner:", await vault.owner());
    console.log("Vault admin:", await vault.admin());
    console.log("Vault token:", await vault.token());

    // await vault.connect(signers[1]).setAdmin(signers[1].address);
    // console.log("Vault admin:", await vault.admin());

}

test().catch((error) => {
    console.error(error);
    process.exit(1);
});
