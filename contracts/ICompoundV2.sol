// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface ICompoundV2 {
    function mint(uint256 mintAmount) external returns (uint);
    function redeem(uint256 redeemTokens) external returns (uint);
    function redeemUnderlying(uint256 redeemAmount) external returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function balanceOfUnderlying(address owner) external returns (uint);
    function underlying() external view returns (address);
}
