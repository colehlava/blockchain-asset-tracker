// ChainOfCustody.sol

pragma solidity ^0.8.13;

import "./Asset.sol";

contract ChainOfCustody {

    uint public constant REGISTRATION_FEE = 1 ether;
    string public constant REGISTRATION_FEE_STRING = "1 ether";

    address private owner;
    address private lastContractDeployed; // @TODO: delete

    event Register(address indexed _owner, address indexed _assetAddress);

    // @TODO: test registerAsset without payable in constructor
    constructor() payable {
        owner = msg.sender; // 'msg.sender' is sender of current call, contract deployer for a constructor
    }

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    // @TODO: delete
    function getLastContractDeployed() external view returns (address) {
        return lastContractDeployed;
    }

    function registerAsset(address assetOwner, string memory assetName) external payable {
        require(msg.value >= REGISTRATION_FEE, "Insufficient payment value: 1 ether required");

        // Deploy Asset contract
        Asset newAsset = new Asset(assetOwner, assetName);
        lastContractDeployed = address(newAsset); // @TODO: delete
        emit Register(assetOwner, address(newAsset));
    }
}
