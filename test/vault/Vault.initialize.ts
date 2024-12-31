import { ethers, upgrades } from "hardhat";
import { Contract, ContractFactory, Signer } from "ethers";
import { NETWORK_CONFIG } from "../shared/address";
import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { setupBlockchainSnapshot, deployVaultFixture } from "../shared/setup";
use(solidity);
describe("Vault initialize in Ethereum", function () {
    setupBlockchainSnapshot();
    
    it("should correctly initialize the vault contract", async function () {
        const {
            admin,
            owner,
            usdcVault,
            usdtVault,
            name,
            symbol,
            usdcContract,
            usdtContract,
            AAVE,
            COMPOUND
        } = await deployVaultFixture()

        expect(await usdtVault.name()).to.equal(name);
        expect(await usdtVault.symbol()).to.equal(symbol);
        expect(await usdtVault.token()).to.equal(await usdtContract.address);
        expect(await usdtVault.aaveV3Addresses(0)).to.deep.equal(AAVE.pool);
        expect(await usdtVault.compoundV3Addresses(0)).to.deep.equal(COMPOUND.cUSDT);
        expect(await usdtVault.admin()).to.equal(admin.address);
        expect(await usdtVault.owner()).to.equal(owner.address);

        expect(await usdcVault.name()).to.equal(name);
        expect(await usdcVault.symbol()).to.equal(symbol);
        expect(await usdcVault.token()).to.equal(await usdcContract.address);
        expect(await usdcVault.aaveV3Addresses(0)).to.deep.equal(AAVE.pool);
        expect(await usdcVault.compoundV3Addresses(0)).to.deep.equal(COMPOUND.cUSDC);
        expect(await usdcVault.admin()).to.equal(admin.address);
        expect(await usdcVault.owner()).to.equal(owner.address);
    });

    it("should revert if any Compound V3 address is invalid", async function () {
        const { vaultFactory, name, symbol, admin, USDC, USDT } = await deployVaultFixture();

        // Wrong Compound V3 address with Weth pool
        const invalidCompoundAddresses = ["0xA17581A9E3356d9A858b789D68B4d866e593aE94"];
        await expect(
            upgrades.deployProxy(
                vaultFactory,
                [name, symbol, admin.address, admin.address, USDC.address, [], invalidCompoundAddresses],
                { initializer: "initialize" }
            )
        ).to.be.revertedWith(`Invalid Compound v3 address: ${invalidCompoundAddresses[0].toLowerCase()}`);
        // Wrong Compound V3 address not a IAaveV3 contract
        const invalidCompoundContractAddresses = ["0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"]
        await expect(
            upgrades.deployProxy(
                vaultFactory,
                [name, symbol, admin.address, admin.address, USDC.address, [], invalidCompoundContractAddresses],
                { initializer: "initialize" }
            )
        ).to.be.revertedWith("Address: low-level delegate call failed");
    });

    it("should revert if any Aave V3 address is invalid", async function () {
        const { vaultFactory, name, symbol, admin, aaveV3Pool, USDC, USDT , AAVE} = await deployVaultFixture()
        // Invalid Aave V3 address (not a contract)
        const invalidAaveAddresses = ["0x000000000000000000000000000000000000dead"];
        await expect(
            upgrades.deployProxy(
                vaultFactory,
                [name, symbol, admin.address, admin.address, USDC.address, invalidAaveAddresses, []],
                { initializer: "initialize" }
            )
        ).to.be.revertedWith("Address: low-level delegate call failed");
    
        // Wrong token address
        const tokenAddress = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"; 
        await expect(
            upgrades.deployProxy(
                vaultFactory,
                [name, symbol, admin.address, admin.address, tokenAddress, [AAVE.pool], []],
                { initializer: "initialize" }
            )
        ).to.be.revertedWith(`Address: low-level delegate call failed`);
    });
    
    it("should revert if addresses are not sorted", async function () {
        const { vaultFactory, name, symbol, admin, USDC, USDT } = await await deployVaultFixture();
    
        const unsortedAddresses = [
            "0x1111111111111111111111111111111111111111",
            "0x0000000000000000000000000000000000000000"
        ];

        await expect(
            upgrades.deployProxy(
                vaultFactory,
                [name, symbol, admin.address, admin.address, USDC.address, unsortedAddresses, []],
                { initializer: "initialize" }
            )
        ).to.be.revertedWith("Aave vaults not sorted");

        await expect(
            upgrades.deployProxy(
                vaultFactory,
                [name, symbol, admin.address, admin.address, USDC.address, [], unsortedAddresses],
                { initializer: "initialize" }
            )
        ).to.be.revertedWith("Compound v3 vaults not sorted");

    });
});
