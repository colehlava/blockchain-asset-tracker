// ChainOfCustody.sol

pragma solidity ^0.8.13;

contract Asset {

    bool public locked;
    bool public transferPending;
    address public assetTransferReceiver;

    address private owner;
    string private assetName;

    event TransferRequest(address indexed _from, address indexed _to, address indexed _assetAddress);
    event TransferComplete(address indexed _from, address indexed _to, address indexed _assetAddress);

    constructor(address _initialOwner, string memory _assetName) {
        owner = _initialOwner;
        assetName = _assetName;
        transferPending = false;
        assetTransferReceiver = address(0);
    }

    modifier isUnlocked() {
        require(locked == false, "Contract is currently being modified, please try again");

        locked = true;
        _;
        locked = false;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Must be owner to transfer asset");
        _;
    }

    modifier transferIsPending() {
        require(transferPending == true, "Cannot transfer asset until owner initiates transfer request");
        _;
    }

    modifier transferIsGoingToCaller() {
        require(msg.sender == assetTransferReceiver, "Cannot receive transfer unless owner initiates transfer to your address");
        _;
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    // @TODO: Add more details to Asset (timestamp, etc.)
    function getDetails() external view returns (string) {
        return assetName;
    }

    function initiateTransfer(address newOwner) external isOwner isUnlocked {
        assetTransferReceiver = newOwner;
        transferPending = true;
        emit TransferRequest(owner, newOwner, address(this));
    }

    function receiveTransfer() external transferIsPending transferIsGoingToCaller isUnlocked {
        transferPending = false;
        assetTransferReceiver = address(0);
        address constant previousOwner = owner;
        owner = msg.sender;
        emit TransferComplete(previousOwner, msg.sender, address(this));
    }
}

