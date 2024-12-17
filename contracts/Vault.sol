// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IAaveV2, IAaveV3, DataTypes} from "./IAave.sol";
import {ICompoundV2, ExponentialNoError} from "./ICompoundV2.sol";
import {ICompoundV3} from "./ICompoundV3.sol";
import {console} from "hardhat/console.sol";

contract Vault is Initializable, ERC20Upgradeable, ExponentialNoError {
    address public owner;
    address public admin;
    address public token;
    address[] public aaveV2Addresses;
    address[] public aaveV3Addresses;
    address[] public compoundV2Addresses;
    address[] public compoundV3Addresses;
    uint256 public constant MAX_UINT = 2**256 - 1;
    mapping(address => uint256) public distributeAmount;

    event Deposit(address indexed user, uint256 amount);
    event DistributeRequest(address indexed user, uint256 amountLp);
    event Distribute(address indexed to, uint256 amountLp, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    function checkSortedArray(address[] memory _array) internal pure returns (bool) {
        for (uint i = 1; i < _array.length; i++) {
            if (_array[i] <= _array[i - 1]) {
                return false;
            }
        }
        return true;
    }

    function checkAaveV2Addresses(address[] memory _array) internal view {
        require(checkSortedArray(_array), "Aave vaults not sorted");
        for (uint i = 0; i < _array.length; i++) {
            DataTypes.ReserveData memory reserve = IAaveV2(_array[i]).getReserveData(token);
            console.log(reserve.aTokenAddress);
            require(reserve.aTokenAddress != address(0), string(abi.encodePacked("Invalid Aave address: ", _array[i])));
        }
    }

    function checkAaveV3Addresses(address[] memory _array) internal view {
        require(checkSortedArray(_array), "Aave vaults not sorted");
        for (uint i = 0; i < _array.length; i++) {
            DataTypes.ReserveDataLegacy memory reserve = IAaveV3(_array[i]).getReserveData(token);
            console.log(reserve.aTokenAddress);
            require(reserve.aTokenAddress != address(0), string(abi.encodePacked("Invalid Aave address: ", _array[i])));
        }
    }

    function checkCompoundV2Addresses(address[] memory _array) internal view {
        require(checkSortedArray(_array), "Compound v2 vaults not sorted");
        for (uint i = 0; i < _array.length; i++) {
            require(ICompoundV2(_array[i]).underlying() == token, string(abi.encodePacked("Invalid Compound v2 address: ", _array[i])));
        }
    }

    function checkCompoundV3Addresses(address[] memory _array) internal view {
        require(checkSortedArray(_array), "Compound v3 vaults not sorted");
        for (uint i = 0; i < _array.length; i++) {
            require(ICompoundV3(_array[i]).baseToken() == token, string(abi.encodePacked("Invalid Compound v3 address: ", _array[i])));
        }
    }

    function initialize(
        string memory _name, 
        string memory _symbol, 
        address _admin,
        address _token,
        address[] memory _aaveV2Addresses,
        address[] memory _aaveV3Addresses,
        address[] memory _compoundV2Addresses,
        address[] memory _compoundV3Addresses
    ) public initializer {
        __ERC20_init(_name, _symbol);
        console.log("Vault initializing");
        owner = msg.sender;
        admin = _admin;
        token = _token;
        checkAaveV2Addresses(_aaveV2Addresses);
        checkAaveV3Addresses(_aaveV3Addresses);
        checkCompoundV2Addresses(_compoundV2Addresses);
        checkCompoundV3Addresses(_compoundV3Addresses);
        aaveV2Addresses = _aaveV2Addresses;
        aaveV3Addresses = _aaveV3Addresses;
        compoundV2Addresses = _compoundV2Addresses;
        compoundV3Addresses = _compoundV3Addresses;
        console.log("Vault initialized");
    }

    function setAdmin(address _newAdmin) external onlyOwner {
        admin = _newAdmin;
    }

    function setAaveV2Addresses(address[] memory _aaveV2Addresses) external onlyAdmin {
        checkAaveV2Addresses(_aaveV2Addresses);
        aaveV2Addresses = _aaveV2Addresses;
    }

    function setAaveV3Addresses(address[] memory _aaveV3Addresses) external onlyAdmin {
        checkAaveV3Addresses(_aaveV3Addresses);
        aaveV3Addresses = _aaveV3Addresses;
    }

    function setCompoundV2Addresses(address[] memory _compoundV2Addresses) external onlyAdmin {
        checkCompoundV2Addresses(_compoundV2Addresses);
        compoundV2Addresses = _compoundV2Addresses;
    }

    function setCompoundV3Addresses(address[] memory _compoundV3Addresses) external onlyAdmin {
        checkCompoundV3Addresses(_compoundV3Addresses);
        compoundV3Addresses = _compoundV3Addresses;
    }

    function balanceAaveV2(address _aaveAddress) public view returns (uint256) {
        DataTypes.ReserveData memory reserve = IAaveV2(_aaveAddress).getReserveData(token);
        return IERC20(reserve.aTokenAddress).balanceOf(address(this));
    }

    function balanceAaveV3(address _aaveAddress) public view returns (uint256) {
        DataTypes.ReserveDataLegacy memory reserve = IAaveV3(_aaveAddress).getReserveData(token);
        return IERC20(reserve.aTokenAddress).balanceOf(address(this));
    }

    function balanceCompoundV2(address _compoundAddress) public view returns (uint256) {
        Exp memory exchangeRate = Exp({mantissa: ICompoundV2(_compoundAddress).exchangeRateCurrent()});
        return mul_ScalarTruncate(exchangeRate, ICompoundV2(_compoundAddress).balanceOf(address(this)));
    }

    function balanceCompoundV3(address _compoundAddress) public view returns (uint256) {
        return ICompoundV3(_compoundAddress).balanceOf(address(this));
    }

    function balanceToken() public view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function totalTokenSupply() public view returns (uint256) {
        uint256 totalSupply = balanceToken();
        for (uint i = 0; i < aaveV2Addresses.length; i++) {
            totalSupply += balanceAaveV2(aaveV2Addresses[i]);
        }
        for (uint i = 0; i < aaveV3Addresses.length; i++) {
            totalSupply += balanceAaveV3(aaveV3Addresses[i]);
        }
        for (uint i = 0; i < compoundV2Addresses.length; i++) {
            totalSupply += balanceCompoundV2(compoundV2Addresses[i]);
        }
        for (uint i = 0; i < compoundV3Addresses.length; i++) {
            totalSupply += balanceCompoundV3(compoundV3Addresses[i]);
        }
        return totalSupply;
    }

    function supplyAaveV2(uint aaveIndex, uint256 amount) external onlyAdmin {
        require(aaveIndex < aaveV2Addresses.length, "Invalid Aave index");
        if (amount == MAX_UINT) {
            amount = balanceToken();
        }
        else {
            require(amount <= balanceToken(), "Insufficient balance");
        }
        require(IERC20(token).approve(aaveV2Addresses[aaveIndex], amount), "Transfer failed");
        IAaveV2(aaveV2Addresses[aaveIndex]).supply(token, amount, address(this), 0);
    }

    function withdrawAaveV2(uint aaveIndex, uint256 amount) external onlyAdmin {
        require(aaveIndex < aaveV2Addresses.length, "Invalid Aave index");
        if (amount == MAX_UINT) {
            amount = balanceAaveV2(aaveV2Addresses[aaveIndex]);
        }
        else {
            require(amount <= balanceAaveV2(aaveV2Addresses[aaveIndex]), "Insufficient balance");
        }
        IAaveV2(aaveV2Addresses[aaveIndex]).withdraw(token, amount, address(this));
    }

    function supplyAaveV3(uint aaveIndex, uint256 amount) external onlyAdmin {
        require(aaveIndex < aaveV3Addresses.length, "Invalid Aave index");
        if (amount == MAX_UINT) {
            amount = balanceToken();
        }
        else {
            require(amount <= balanceToken(), "Insufficient balance");
        }
        require(IERC20(token).approve(aaveV3Addresses[aaveIndex], amount), "Transfer failed");
        IAaveV3(aaveV3Addresses[aaveIndex]).supply(token, amount, address(this), 0);
    }

    function withdrawAaveV3(uint aaveIndex, uint256 amount) external onlyAdmin {
        require(aaveIndex < aaveV3Addresses.length, "Invalid Aave index");
        if (amount == MAX_UINT) {
            amount = balanceAaveV3(aaveV3Addresses[aaveIndex]);
        }
        else {
            require(amount <= balanceAaveV3(aaveV3Addresses[aaveIndex]), "Insufficient balance");
        }
        IAaveV3(aaveV3Addresses[aaveIndex]).withdraw(token, amount, address(this));
    }

    function supplyCompoundV2(uint compoundIndex, uint256 amount) external onlyAdmin {
        require(compoundIndex < compoundV2Addresses.length, "Invalid Compound v2 index"); 
        if (amount == MAX_UINT) {
            amount = balanceToken();
        }
        else {
            require(amount <= balanceToken(), "Insufficient balance");
        }
        require(IERC20(token).approve(compoundV2Addresses[compoundIndex], amount), "Transfer failed");
        ICompoundV2(compoundV2Addresses[compoundIndex]).mint(amount);
    }

    function withdrawCompoundV2(uint compoundIndex, uint256 amount) external onlyAdmin {
        require(compoundIndex < compoundV2Addresses.length, "Invalid Compound v2 index");
        if (amount == MAX_UINT) {
            amount = balanceCompoundV2(compoundV2Addresses[compoundIndex]);
        }
        else {
            require(amount <= balanceCompoundV2(compoundV2Addresses[compoundIndex]), "Insufficient balance");
        }
        ICompoundV2(compoundV2Addresses[compoundIndex]).redeemUnderlying(amount);
    }

    function supplyCompoundV3(uint compoundIndex, uint256 amount) external onlyAdmin {
        require(compoundIndex < compoundV3Addresses.length, "Invalid Compound v3 index");
        if (amount == MAX_UINT) {
            amount = balanceToken();
        }
        else {
            require(amount <= balanceToken(), "Insufficient balance");
        }
        require(IERC20(token).approve(compoundV3Addresses[compoundIndex], amount), "Transfer failed");
        ICompoundV3(compoundV3Addresses[compoundIndex]).supply(token, amount);
    }

    function withdrawCompoundV3(uint compoundIndex, uint256 amount) external onlyAdmin {
        require(compoundIndex < compoundV3Addresses.length, "Invalid Compound v3 index");
        if (amount == MAX_UINT) {
            amount = balanceCompoundV3(compoundV3Addresses[compoundIndex]);
        }
        else {
            require(amount <= balanceCompoundV3(compoundV3Addresses[compoundIndex]), "Insufficient balance");
        }
        ICompoundV3(compoundV3Addresses[compoundIndex]).withdraw(token, amount);
    }

    function deposit(uint256 amount) external {
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        if (totalSupply() == 0) {
            _mint(msg.sender, amount);
        }
        else {
            uint256 shares = (amount * totalSupply()) / totalTokenSupply();
            _mint(msg.sender, shares);
        }
        emit Deposit(msg.sender, amount);
    }

    function requestDistribute(uint256 amountLp) external {
        require(distributeAmount[msg.sender] + amountLp <= balanceOf(msg.sender), "Insufficient balance");
        distributeAmount[msg.sender] += amountLp;
        emit DistributeRequest(msg.sender, amountLp);
    }

    function distribute(address to, uint256 amountLp) external onlyAdmin {
        if (amountLp == MAX_UINT) {
            amountLp = distributeAmount[to];
        }
        else {
            require(amountLp <= distributeAmount[to], "Insufficient balance");
        }
        distributeAmount[to] -= amountLp;
        uint256 amount = (amountLp * totalTokenSupply()) / totalSupply();
        require(IERC20(token).transfer(to, amount), "Transfer failed");
        _burn(msg.sender, amountLp);
    }


}

