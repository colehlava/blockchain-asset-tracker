// Asset.js

import React, { useState, useEffect } from "react";

const ASSET_CONTRACT_ABI = require('../abi/Asset.json');

function Asset({ assetAddress }) {

    const [assetData, setAssetData] = useState([]);
    const [assetHistory, setAssetHistory] = useState([]);
    const [transferAssetRPCResult, setTransferAssetRPCResult] = useState([]);

    useEffect(() => {
        retrieveAssetDetails();
    }, []);


    async function retrieveAssetDetails() {
        try {
            const contract = new window.web3.eth.Contract(ASSET_CONTRACT_ABI.abi, assetAddress);
            const result = await contract.methods.getDetails().call();
            setAssetData( <h3>{ result }</h3> );
        } catch (err) {
            console.error(err);
        }
    }


    // @TODO: handle edge case where user is first owner of asset
    async function retrieveAssetHistory() {
        try {
            const contract = new window.web3.eth.Contract(ASSET_CONTRACT_ABI.abi, assetAddress);
            // const pastEvents = await contract.getPastEvents('TransferComplete', { filter: { _assetAddress: assetAddress }, fromBlock: 'earliest', toBlock: 'latest' }); // @TODO: change fromBlock to current block number at the time dapp is deployed
            const pastEvents = await contract.getPastEvents('TransferRequest', { filter: { _assetAddress: assetAddress }, fromBlock: 'earliest', toBlock: 'latest' }); // @TODO: change back to TransferComplete event
            const readableEvents = pastEvents.map(_ev => _ev.returnValues);

            let completedAssetTransfers = [];
            for (let i = 0; i < readableEvents.length; i++) {
                const from = readableEvents[i]['_from'];
                const to = readableEvents[i]['_to'];
                console.log(`Asset transfer from ${from} to ${to}`);
                completedAssetTransfers.push( <h4>Asset transfer from {from} to {to}</h4> );
            }

            setAssetHistory( completedAssetTransfers );

        } catch (err) {
            console.error(err);
        }
    }


    const handleTransferAsset = async () => {
        try {
            // @TODO: get new owner input from user
            const newAssetOwner = '0xDc20E06366292F040B3A0aBbfa46494a3a333e99';

            // Call initiateTransfer RPC
            const contract = new window.web3.eth.Contract(ASSET_CONTRACT_ABI.abi, assetAddress);
            const gasEstimate = await contract.methods.initiateTransfer(newAssetOwner).estimateGas({ from: window.defaultAccount });
            const result = await contract.methods.initiateTransfer(newAssetOwner).send({ from: window.defaultAccount, gas: gasEstimate });
            const receipt = await window.web3.eth.getTransactionReceipt(result['transactionHash']);

            if (receipt) {
                console.log(`Transfer asset initiated: ${result['transactionHash']}`);
                setTransferAssetRPCResult(result['transactionHash']);
            }

        } catch (err) {
            setTransferAssetRPCResult(`Error while initiating asset transfer: ${err.message}`);
            console.error(err);
        }
    };


    return (
        <div>
            <h1>My Asset</h1>

            { assetData ? assetData : <h2>Loading asset data...</h2> }

            <button style={{ padding: 10, margin: 10 }} onClick={ retrieveAssetHistory }>Show History</button>
            { assetHistory && assetHistory }

            <button style={{ padding: 10, margin: 10 }} onClick={ handleTransferAsset }>Transfer Asset</button>
            { transferAssetRPCResult && transferAssetRPCResult }

        </div>
    );
}

export default Asset;

