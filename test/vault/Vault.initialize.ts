import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { NETWORK_CONFIG} from "../../config/address";

describe("Vault.initialize", function () {
    const network = process.env.NETWORK || "ETHEREUM"; // Lấy mạng từ môi trường
    const CONFIG = NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG];
    const {USDT, USDC} = CONFIG.TOKENS;
    const 
    let vault: Contract;
    let mockToken: Contract;
    let deployer: Signer;
    let admin: Signer;
    let user: Signer;

  async function deployVaultFixture(
    tokenAddress: string,

  ) {
    // Get signers
    const [deployer, admin, user] = await ethers.getSigners();

    // Deploy a mock ERC20 token
    const MockERC20 = await ethers.getContractFactory("MockERC20", deployer);
    const mockToken = await MockERC20.deploy("Mock Token", "MTK", 18);
    await mockToken.deployed();

    // Deploy the Vault contract
    const Vault = await ethers.getContractFactory("Vault", deployer);
    const vault = await Vault.deploy();
    await vault.deployed();

    // Initialize the Vault contract
    await vault.initialize(
      await admin.getAddress(), // Admin address
      mockToken.address         // Mock token address
    );

    return { vault, mockToken, deployer, admin, user };
  }

//   it("should correctly initialize the vault contract", async function () {
//     const { vault, mockToken, admin } = await loadFixture(deployVaultFixture);

//     // Verify admin address
//     const adminAddress = await vault.admin();
//     expect(adminAddress).to.equal(await admin.getAddress());

//     // Verify token address
//     const tokenAddress = await vault.token();
//     expect(tokenAddress).to.equal(mockToken.address);

//     // Verify initial state variables
//     expect(await vault.totalAssets()).to.equal(0);
//     expect(await vault.apr()).to.equal(0);
//   });

//   it("should not allow reinitialization", async function () {
//     const { vault, admin, mockToken } = await loadFixture(deployVaultFixture);

//     // Attempt to reinitialize the contract
//     await expect(
//       vault.initialize(
//         await admin.getAddress(),
//         mockToken.address
//       )
//     ).to.be.revertedWith("Contract is already initialized");
//   });

//   it("should not initialize with zero admin address", async function () {
//     const Vault = await ethers.getContractFactory("Vault");
//     const vault = await Vault.deploy();
//     await vault.deployed();

//     // Attempt to initialize with zero address for admin
//     await expect(
//       vault.initialize(ethers.constants.AddressZero, mockToken.address)
//     ).to.be.revertedWith("Invalid admin address");
//   });

//   it("should not initialize with zero token address", async function () {
//     const Vault = await ethers.getContractFactory("Vault");
//     const vault = await Vault.deploy();
//     await vault.deployed();

//     // Attempt to initialize with zero address for token
//     await expect(
//       vault.initialize(await admin.getAddress(), ethers.constants.AddressZero)
//     ).to.be.revertedWith("Invalid token address");
//   });
});
