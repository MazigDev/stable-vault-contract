// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IAaveV3, DataTypes} from "./IAave.sol";
// import {ICompoundV2} from "./ICompoundV2.sol";
import {ICompoundV3} from "./ICompoundV3.sol";
import {ICompoundV2} from "./ICompoundV2.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import {console} from "hardhat/console.sol";

struct Path {
    uint256 vaultAmount;
    uint256[] aaveV3Amounts;
    uint256[] compoundV2Amounts;
    uint256[] compoundV3Amounts;
    uint256 lastBlock;
}

interface IVault {
    function supplyAaveV3(uint aaveIndex, uint256 amount) external;
    function withdrawAaveV3(uint aaveIndex, uint256 amount) external returns (uint256);
    function supplyCompoundV2(uint compoundIndex, uint256 amount) external;
    function withdrawCompoundV2(uint compoundIndex, uint256 amount) external returns (uint256);
    function supplyCompoundV3(uint compoundIndex, uint256 amount) external;
    function withdrawCompoundV3(uint compoundIndex, uint256 amount) external returns (uint256);
}

contract Vault is Initializable, ERC20Upgradeable {
    address public owner;
    address public whitelist;
    address public token;

    address[] public aaveV3Addresses;
    address[] public compoundV2Addresses;
    address[] public compoundV3Addresses;

    uint256 public lastUpdateBlock;
    uint256 public limitDeadlineBlock;

    uint256 public constant MAX_UINT = type(uint256).max;
    bytes32 public constant FINGERPRINT = keccak256("MAZIG_VAULT_0");

    event Deposit(address indexed user, uint256 amountLp, uint256 amount);
    event Withdraw(address indexed to, uint256 amountLp, uint256 amount);
    event SetAaveV3Addresses(address[] _aaveV3Addresses);
    event SetCompoundV2Addresses(address[] _compoundV2Addresses);
    event SetCompoundV3Addresses(address[] _compoundV3Addresses);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier onlyWhitelist() {
        require(msg.sender == whitelist, "Not the whitelist");
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

    function checkAaveV3Addresses(address[] memory _array) internal view {
        require(checkSortedArray(_array), "Aave vaults not sorted");
        for (uint i = 0; i < _array.length; i++) {
            DataTypes.ReserveDataLegacy memory reserve = IAaveV3(_array[i]).getReserveData(token);
            require(
                reserve.aTokenAddress != address(0),
                string(
                    abi.encodePacked(
                        "Invalid Aave v3 address: ",
                        Strings.toHexString(uint160(_array[i]), 20)
                    )  
                )
            );
        }
    }

    function checkCompoundV2Addresses(address[] memory _array) internal view {
        require(checkSortedArray(_array), "Compound v2 vaults not sorted");
        for (uint i = 0; i < _array.length; i++) {
            require(
                ICompoundV2(_array[i]).underlying() == token,
                string(
                    abi.encodePacked(
                        "Invalid Compound v2 address: ",
                        Strings.toHexString(uint160(_array[i]), 20)
                    )
                )
            );
        }
    }

    function checkCompoundV3Addresses(address[] memory _array) internal view {
        require(checkSortedArray(_array), "Compound v3 vaults not sorted");
        for (uint i = 0; i < _array.length; i++) {
            require(
                ICompoundV3(_array[i]).baseToken() == token,
                string(
                    abi.encodePacked(
                        "Invalid Compound v3 address: ",
                        Strings.toHexString(uint160(_array[i]), 20)
                    )
                )
            );
        }
    }

    function initialize(
        string memory _name, 
        string memory _symbol, 
        address _owner,
        address _whitelist,
        address _token,
        address[] memory _aaveV3Addresses,
        address[] memory _compoundV2Addresses,
        address[] memory _compoundV3Addresses,
        uint256 _limitDeadlineBlock
    ) public initializer {
        __ERC20_init(_name, _symbol);
        
        if (_owner == address(0)) {
            owner = msg.sender;
        }
        else {
            owner = _owner;
        }

        if (_whitelist == address(0)) {
            whitelist = owner;
        }
        else {
            whitelist = _whitelist;
        }
        require(IERC20(_token).totalSupply() > 0, "Invalid token address");
        token = _token;
        checkAaveV3Addresses(_aaveV3Addresses);
        checkCompoundV3Addresses(_compoundV3Addresses);
        checkCompoundV2Addresses(_compoundV2Addresses);
        aaveV3Addresses = _aaveV3Addresses;
        compoundV2Addresses = _compoundV2Addresses;
        compoundV3Addresses = _compoundV3Addresses;
        limitDeadlineBlock = _limitDeadlineBlock;
    }

    function setWhitelist(address _whitelist) public onlyOwner {
        require(_whitelist != address(0), "Invalid whitelist address");
        whitelist = _whitelist;
    }

    function setAaveV3Addresses(address[] memory _aaveV3Addresses) public onlyOwner {
        checkAaveV3Addresses(_aaveV3Addresses);
        aaveV3Addresses = _aaveV3Addresses;
        emit SetAaveV3Addresses(_aaveV3Addresses);
    }

    function setCompoundV2Addresses(address[] memory _compoundV2Addresses) public onlyOwner {
        checkCompoundV2Addresses(_compoundV2Addresses);
        compoundV2Addresses = _compoundV2Addresses;
        emit SetCompoundV2Addresses(_compoundV2Addresses);
    }

    function setCompoundV3Addresses(address[] memory _compoundV3Addresses) public onlyOwner {
        checkCompoundV3Addresses(_compoundV3Addresses);
        compoundV3Addresses = _compoundV3Addresses;
        emit SetCompoundV3Addresses(_compoundV3Addresses);
    }

    function balanceAaveV3(address _aaveAddress) public view returns (uint256) {
        DataTypes.ReserveDataLegacy memory reserve = IAaveV3(_aaveAddress).getReserveData(token);
        return IERC20(reserve.aTokenAddress).balanceOf(address(this));
    }

    function balanceCompoundV2(address _compoundAddress) public returns (uint256) {
        return ICompoundV2(_compoundAddress).balanceOfUnderlying(address(this));
    }

    function balanceCompoundV3(address _compoundAddress) public view returns (uint256) {
        return ICompoundV3(_compoundAddress).balanceOf(address(this));
    }

    function balanceToken() public view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function totalTokenSupply() public returns (uint256) {
        uint256 totalSupply = balanceToken();
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

    function _supplyAaveV3(uint aaveIndex, uint256 amount) internal {
        require(aaveIndex < aaveV3Addresses.length, "Invalid Aave index");
        if (amount == MAX_UINT) {
            amount = balanceToken();
        }
        else {
            require(amount <= balanceToken(), "Insufficient balance");
        }
        SafeERC20.forceApprove(IERC20(token),aaveV3Addresses[aaveIndex], amount);
        IAaveV3(aaveV3Addresses[aaveIndex]).deposit(token, amount, address(this), 0);
    }

    function _withdrawAaveV3(uint aaveIndex, uint256 amount) internal returns (uint256) {
        require(aaveIndex < aaveV3Addresses.length, "Invalid Aave index");
        if (amount == MAX_UINT) {
            amount = balanceAaveV3(aaveV3Addresses[aaveIndex]);
        }
        else {
            require(amount <= balanceAaveV3(aaveV3Addresses[aaveIndex]), "Insufficient balance");
        }
        IAaveV3(aaveV3Addresses[aaveIndex]).withdraw(token, amount, address(this));
        return amount;
    }

    function _supplyCompoundV2(uint compoundIndex, uint256 amount) internal {
        require(compoundIndex < compoundV2Addresses.length, "Invalid Compound v3 index");
        if (amount == MAX_UINT) {
            amount = balanceToken();
        }
        else {
            require(amount <= balanceToken(), "Insufficient balance");
        }
        SafeERC20.forceApprove(IERC20(token), compoundV2Addresses[compoundIndex], amount);
        ICompoundV2(compoundV2Addresses[compoundIndex]).mint(amount);
    }

    function _withdrawCompoundV2(uint compoundIndex, uint256 amount) internal returns (uint256) {
        require(compoundIndex < compoundV2Addresses.length, "Invalid Compound v3 index");
        if (amount == MAX_UINT) {
            amount = balanceCompoundV2(compoundV2Addresses[compoundIndex]);
            uint256 redeem = ICompoundV2(compoundV2Addresses[compoundIndex]).balanceOf(address(this));
            ICompoundV2(compoundV2Addresses[compoundIndex]).redeem(redeem);
        
        }
        else {
            require(amount <= balanceCompoundV2(compoundV2Addresses[compoundIndex]), "Insufficient balance");
            ICompoundV2(compoundV2Addresses[compoundIndex]).redeemUnderlying(amount);
        }
        return amount;
    }
    
    function _supplyCompoundV3(uint compoundIndex, uint256 amount) internal {
        require(compoundIndex < compoundV3Addresses.length, "Invalid Compound v3 index");
        if (amount == MAX_UINT) {
            amount = balanceToken();
        }
        else {
            require(amount <= balanceToken(), "Insufficient balance");
        }
        SafeERC20.forceApprove(IERC20(token), compoundV3Addresses[compoundIndex], amount);
        ICompoundV3(compoundV3Addresses[compoundIndex]).supply(token, amount);
    }

    function _withdrawCompoundV3(uint compoundIndex, uint256 amount) internal returns (uint256) {
        require(compoundIndex < compoundV3Addresses.length, "Invalid Compound v3 index");
        if (amount == MAX_UINT) {
            amount = balanceCompoundV3(compoundV3Addresses[compoundIndex]);
        }
        else {
            require(amount <= balanceCompoundV3(compoundV3Addresses[compoundIndex]), "Insufficient balance");
        }
        ICompoundV3(compoundV3Addresses[compoundIndex]).withdraw(token, amount);
        return amount;
    }

    function balanceTokenOf(address from) public returns (uint256) {
        if (totalSupply() == 0) {
            return 0;
        }
        return balanceOf(from) * totalTokenSupply() / totalSupply();
    }

    function deposit(uint256 amount) public {
        if (totalSupply() == 0) {
            _mint(msg.sender, amount * (10 ** 18));
        }
        else {
            uint256 shares = (amount * totalSupply()) / totalTokenSupply();
            _mint(msg.sender, shares);
        }
        SafeERC20.safeTransferFrom(IERC20(token), msg.sender, address(this), amount);
    }

    function withdraw(Path memory path, bytes memory signature) public {
        // check path
        require(path.lastBlock >= lastUpdateBlock && path.lastBlock <= block.number, "Invalid block");
        require(path.lastBlock >= block.number - limitDeadlineBlock, "Expired block");
        require(path.aaveV3Amounts.length == aaveV3Addresses.length, "Invalid Aave v3 amounts length");
        require(path.compoundV3Amounts.length == compoundV3Addresses.length, "Invalid Compound v3 amounts length");
        require(path.compoundV2Amounts.length == compoundV2Addresses.length, "Invalid Compound v2 amounts length");

        // check signature
        bytes32 pathHash = keccak256(abi.encodePacked(
            path.vaultAmount,
            path.aaveV3Amounts,
            path.compoundV2Amounts,
            path.compoundV3Amounts,
            path.lastBlock,
            msg.sender,
            FINGERPRINT
        ));
        require(signature.length == 65, "Invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        require(ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", pathHash)), v, r, s) == whitelist, "Invalid signature");
    
        // withdraw
        uint256 totalWithdrawAmount = 0;
        uint256 userBalance = balanceTokenOf(msg.sender);
        for (uint i = 0; i < aaveV3Addresses.length; i++) {
            if (path.aaveV3Amounts[i] > 0) {
                totalWithdrawAmount += _withdrawAaveV3(i, path.aaveV3Amounts[i]);
            }
        }
        for (uint i = 0; i < compoundV2Addresses.length; i++) {
            if (path.compoundV2Amounts[i] > 0) {
                totalWithdrawAmount += _withdrawCompoundV2(i, path.compoundV2Amounts[i]);
            }
        }
        for (uint i = 0; i < compoundV3Addresses.length; i++) {
            if (path.compoundV3Amounts[i] > 0) {
                totalWithdrawAmount += _withdrawCompoundV3(i, path.compoundV3Amounts[i]);
            }
        }

        require(path.vaultAmount <= MAX_UINT - totalWithdrawAmount, "Invalid vault amount");
        totalWithdrawAmount += path.vaultAmount;
        require(totalWithdrawAmount <= userBalance, "Insufficient balance");
        uint256 totalWithdrawAmountLp = (totalWithdrawAmount * totalSupply()) / totalTokenSupply();

        _burn(msg.sender, totalWithdrawAmountLp);
        SafeERC20.safeTransfer(IERC20(token), msg.sender, totalWithdrawAmount);
        lastUpdateBlock = block.number;
        emit Withdraw(msg.sender, totalWithdrawAmountLp, totalWithdrawAmount);
    }

    function executeTransaction(address target, uint value, bytes calldata data) public payable onlyOwner returns (bytes memory) {
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Transaction failed");
        return result;
    }

    function executeMultipleCalls(bytes[] calldata calls, uint256 lastBlock) public onlyWhitelist {
        require(lastBlock >= lastUpdateBlock && lastBlock <= block.number, "Invalid block");
        require(lastBlock >= block.number - limitDeadlineBlock, "Expired block");
        for (uint i = 0; i < calls.length; i++) {
            bytes calldata data = calls[i];
            bytes4 selector = bytes4(data[:4]);
            if (selector == IVault.supplyAaveV3.selector) {
                (uint aaveIndex, uint256 amount) = abi.decode(data[4:], (uint, uint256));
                _supplyAaveV3(aaveIndex, amount);
            }
            else if (selector == IVault.withdrawAaveV3.selector) {
                (uint aaveIndex, uint256 amount) = abi.decode(data[4:], (uint, uint256));
                _withdrawAaveV3(aaveIndex, amount);
            }
            else if (selector == IVault.supplyCompoundV2.selector) {
                (uint compoundIndex, uint256 amount) = abi.decode(data[4:], (uint, uint256));
                _supplyCompoundV2(compoundIndex, amount);
            }
            else if (selector == IVault.withdrawCompoundV2.selector) {
                (uint compoundIndex, uint256 amount) = abi.decode(data[4:], (uint, uint256));
                _withdrawCompoundV2(compoundIndex, amount);
            }
            else if (selector == IVault.supplyCompoundV3.selector) {
                (uint compoundIndex, uint256 amount) = abi.decode(data[4:], (uint, uint256));
                _supplyCompoundV3(compoundIndex, amount);
            }
            else if (selector == IVault.withdrawCompoundV3.selector) {
                (uint compoundIndex, uint256 amount) = abi.decode(data[4:], (uint, uint256));
                _withdrawCompoundV3(compoundIndex, amount);
            }
            else {
                revert("Invalid selector");
            }
        }
        lastUpdateBlock = block.number;
    }
}


