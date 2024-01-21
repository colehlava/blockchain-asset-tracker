// ChainOfCustody.sol

pragma solidity ^0.8.13;

import "./Asset.sol";

contract ChainOfCustody {

    address private owner;
    address private lastContractDeployed;

    event Register(address indexed _owner, address _assetAddress);

    constructor() {
        owner = msg.sender; // 'msg.sender' is sender of current call, contract deployer for a constructor
    }

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    function getLastContractDeployed() external view returns (address) {
        return lastContractDeployed;
    }

    function registerAsset(address assetOwner, string memory assetName) public returns(bool successful) {
        // require(msg.value >= registrationFee, "Insufficient gas money");

        // Deploy Asset contract
        Asset newAsset = new Asset(assetOwner, assetName);
        lastContractDeployed = address(newAsset);
        emit Register(assetOwner, address(newAsset));
        return true;
    }


    /*
    function changeOwner(address newOwner) public isOwner {
        emit OwnerSet(owner, newOwner);
        owner = newOwner;
    }


    // =====================================================================================


    function getBalance(address addr) public view returns(uint) {
        return balances[addr];
    }

    function sendCoin(address receiver, uint amount) public returns(bool sufficient) {
        if (balances[msg.sender] < amount) return false;
        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        emit Transfer(msg.sender, receiver, amount);
        return true;
    }
     */
}

