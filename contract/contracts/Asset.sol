// ChainOfCustody.sol

pragma solidity ^0.8.13;

contract Asset {

    address private owner;
    string private assetName;

    event Transfer(address indexed _from, address indexed _to, address _assetAddress);

    constructor(address _initialOwner, string memory _assetName) {
        owner = _initialOwner;
        assetName = _assetName;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    function transferAsset(address newOwner, address assetAddress) public isOwner {
        emit Transfer(owner, newOwner, assetAddress);
    }
}

