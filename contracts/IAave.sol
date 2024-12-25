// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.20;

interface IAaveV2 {
    function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external;
    function getReserveData(address asset) view external returns (DataTypes.ReserveData memory);
}

interface IAaveV3 {
    function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external;
    function getReserveData(address asset) view external returns (DataTypes.ReserveDataLegacy memory);
    function setUserUseReserveAsCollateral(address asset, bool useAsCollateral) external;
    function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external;
    function getUserAccountData(address user) view external returns (
      uint256 totalCollateralBase,
      uint256 totalDebtBase,
      uint256 availableBorrowsBase,
      uint256 currentLiquidationThreshold,
      uint256 ltv,
      uint256 healthFactor
    );
    function getReserveDataExtended(
        address asset
    ) external view returns (DataTypes.ReserveData memory);
}

interface InterestRateStrategy {
    struct InterestRateDataRay {
        uint256 optimalUsageRatio;
        uint256 baseVariableBorrowRate;
        uint256 variableRateSlope1;
        uint256 variableRateSlope2;
    }

    function calculateInterestRates(
        DataTypes.CalculateInterestRatesParams memory params
    ) external view returns (uint256, uint256);
    
    function getInterestRateData(address reserve) external view returns (InterestRateDataRay memory);
}

library DataTypes {
  /**
   * This exists specifically to maintain the `getReserveData()` interface, since the new, internal
   * `ReserveData` struct includes the reserve's `virtualUnderlyingBalance`.
   */
  struct ReserveDataLegacy {
    //stores the reserve configuration
    ReserveConfigurationMap configuration;
    //the liquidity index. Expressed in ray
    uint128 liquidityIndex;
    //the current supply rate. Expressed in ray
    uint128 currentLiquidityRate;
    //variable borrow index. Expressed in ray
    uint128 variableBorrowIndex;
    //the current variable borrow rate. Expressed in ray
    uint128 currentVariableBorrowRate;
    // DEPRECATED on v3.2.0
    uint128 currentStableBorrowRate;
    //timestamp of last update
    uint40 lastUpdateTimestamp;
    //the id of the reserve. Represents the position in the list of the active reserves
    uint16 id;
    //aToken address
    address aTokenAddress;
    // DEPRECATED on v3.2.0
    address stableDebtTokenAddress;
    //variableDebtToken address
    address variableDebtTokenAddress;
    //address of the interest rate strategy
    address interestRateStrategyAddress;
    //the current treasury balance, scaled
    uint128 accruedToTreasury;
    //the outstanding unbacked aTokens minted through the bridging feature
    uint128 unbacked;
    //the outstanding debt borrowed against this asset in isolation mode
    uint128 isolationModeTotalDebt;
  }

  struct ReserveData {
    //stores the reserve configuration
    ReserveConfigurationMap configuration;
    //the liquidity index. Expressed in ray
    uint128 liquidityIndex;
    //the current supply rate. Expressed in ray
    uint128 currentLiquidityRate;
    //variable borrow index. Expressed in ray
    uint128 variableBorrowIndex;
    //the current variable borrow rate. Expressed in ray
    uint128 currentVariableBorrowRate;
    // DEPRECATED on v3.2.0
    uint128 __deprecatedStableBorrowRate;
    //timestamp of last update
    uint40 lastUpdateTimestamp;
    //the id of the reserve. Represents the position in the list of the active reserves
    uint16 id;
    //timestamp until when liquidations are not allowed on the reserve, if set to past liquidations will be allowed
    uint40 liquidationGracePeriodUntil;
    //aToken address
    address aTokenAddress;
    // DEPRECATED on v3.2.0
    address __deprecatedStableDebtTokenAddress;
    //variableDebtToken address
    address variableDebtTokenAddress;
    //address of the interest rate strategy
    address interestRateStrategyAddress;
    //the current treasury balance, scaled
    uint128 accruedToTreasury;
    //the outstanding unbacked aTokens minted through the bridging feature
    uint128 unbacked;
    //the outstanding debt borrowed against this asset in isolation mode
    uint128 isolationModeTotalDebt;
    //the amount of underlying accounted for by the protocol
    uint128 virtualUnderlyingBalance;
  }

  struct ReserveConfigurationMap {
    //bit 0-15: LTV
    //bit 16-31: Liq. threshold
    //bit 32-47: Liq. bonus
    //bit 48-55: Decimals
    //bit 56: reserve is active
    //bit 57: reserve is frozen
    //bit 58: borrowing is enabled
    //bit 59: DEPRECATED: stable rate borrowing enabled
    //bit 60: asset is paused
    //bit 61: borrowing in isolation mode is enabled
    //bit 62: siloed borrowing enabled
    //bit 63: flashloaning enabled
    //bit 64-79: reserve factor
    //bit 80-115: borrow cap in whole tokens, borrowCap == 0 => no cap
    //bit 116-151: supply cap in whole tokens, supplyCap == 0 => no cap
    //bit 152-167: liquidation protocol fee
    //bit 168-175: DEPRECATED: eMode category
    //bit 176-211: unbacked mint cap in whole tokens, unbackedMintCap == 0 => minting disabled
    //bit 212-251: debt ceiling for isolation mode with (ReserveConfiguration::DEBT_CEILING_DECIMALS) decimals
    //bit 252: virtual accounting is enabled for the reserve
    //bit 253-255 unused

    uint256 data;
  }

  struct CalculateInterestRatesParams {
    uint256 unbacked;
    uint256 liquidityAdded;
    uint256 liquidityTaken;
    uint256 totalDebt;
    uint256 reserveFactor;
    address reserve;
    bool usingVirtualBalance;
    uint256 virtualUnderlyingBalance;
  }
}

interface AaveProtocolDataProvider {
    function getReserveCaps(address asset) external view returns (uint256 borrowCap, uint256 supplyCap);
    function getReserveData(address asset) external view returns (
            uint256 unbacked,
            uint256 accruedToTreasuryScaled,
            uint256 totalAToken,
            uint256 totalStableDebt,
            uint256 totalVariableDebt,
            uint256 liquidityRate,
            uint256 variableBorrowRate,
            uint256 stableBorrowRate,
            uint256 averageStableBorrowRate,
            uint256 liquidityIndex,
            uint256 variableBorrowIndex,
            uint40 lastUpdateTimestamp
        );
    function getReserveConfigurationData(address asset) external view returns (
            uint256 decimals,
            uint256 ltv,
            uint256 liquidationThreshold,
            uint256 liquidationBonus,
            uint256 reserveFactor,
            bool usageAsCollateralEnabled,
            bool borrowingEnabled,
            bool stableBorrowRateEnabled,
            bool isActive,
            bool isFrozen
        );
}