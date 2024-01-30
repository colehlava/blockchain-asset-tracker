// Console.js

import React, { useState } from 'react';
import Web3 from "web3";
import { useSDK } from '@metamask/sdk-react';
import { Buffer } from 'buffer';
import Asset from './Asset.js';

const ASSET_CONTRACT_ABI = require('../abi/Asset.json');
const DAPP_SMART_CONTRACT_ABI = require('../abi/ChainOfCustody.json');
// const DAPP_SMART_CONTRACT_ABI = require('../../../contract/build/contracts/ChainOfCustody.json'); // @NOTE: this avoids copying abi after recompile, but need to add symlink to use this path
const DAPP_SMART_CONTRACT_ADDRESS = '0x616ddbdd8F84b46c984671C6Ac1b47d0CB5B231A'; // @TODO: update contract address
const DAPP_MESSAGE_TO_SIGN = 'Blockchain based chain of custody sigmsg\nNonce:'; // @TODO: implement nonce

const DEBUG = true;

// const web3 = new Web3(Web3.givenProvider);
// const web3 = new Web3(new Web3.providers.HttpProvider("https://eth-mainnet.g.alchemy.com/v2/xHaks7r4ZQXMNe6GTQEtCDAvv4n9YGh0")); // eth mainnet
// const web3 = new Web3("http://localhost:8545"); // local blockchain
// const web3 = new Web3("http://127.0.0.1:8545"); // local blockchain

function Console() {

    const { sdk, connected, connecting, provider, chainId } = useSDK();

    const [account, setAccount] = useState('');
    const [signResult, setSignResult] = useState('');
    const [signedMessage, setSignedMessage] = useState('');
    const [registerAssetRPCResult, setRegisterAssetRPCResult] = useState('');
    const [registerAssetInitiated, setRegisterAssetInitiated] = useState(false);
    const [renderedAssets, setRenderedAssets] = useState([]);
    const [pendingTransfers, setPendingTransfers] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
    });


    function initiateRegisterAsset() {
        setRegisterAssetInitiated(true);
    }


    const handleSubmitRegisterAssetForm = async (event) => {
        event.preventDefault();

        /*
        console.log(`calling registerAsset(${account}, ${formData['name']})`);
        let balance = await window.web3.eth.getBalance(account);
        console.log(`Balance of ${account} before registerAsset: ${balance}`);
        balance = await window.web3.eth.getBalance(DAPP_SMART_CONTRACT_ADDRESS);
        console.log(`Balance of ${DAPP_SMART_CONTRACT_ADDRESS} before registerAsset: ${balance}`);
         */

        // Call registerAsset RPC
        const contract = new window.web3.eth.Contract(DAPP_SMART_CONTRACT_ABI.abi, DAPP_SMART_CONTRACT_ADDRESS);
        const gasEstimate = await contract.methods.registerAsset(account, formData['name']).estimateGas({ from: account, value: 10 * 10**18 });
        const result = await contract.methods.registerAsset(account, formData['name']).send({ from: account, gas: gasEstimate, value: 10 * 10**18 });
        // const result = await contract.methods.registerAsset(account, formData['name']).send({ from: account, gas: 4000000, value: 10 * 10**18 }); // working with hard coded gas amount
        // const result = await contract.methods.getOwner().call(); // working
        // const result = await contract.methods.getLastContractDeployed().call(); // working

        const receipt = await window.web3.eth.getTransactionReceipt(result['transactionHash']);

        if (receipt) {
            console.log(`registerAsset completed successfully ${result['transactionHash']}`);
            setRegisterAssetRPCResult(result['transactionHash']);
        }

        /*
        console.log(`Gas estimate: ${gasEstimate}`);
        balance = await window.web3.eth.getBalance(account);
        console.log(`Balance of ${account} after  registerAsset: ${balance}`);
        balance = await window.web3.eth.getBalance(DAPP_SMART_CONTRACT_ADDRESS);
        console.log(`Balance of ${DAPP_SMART_CONTRACT_ADDRESS} after  registerAsset: ${balance}`);
         */

        // Clear form
        setFormData({ ...formData, name: '' });
    };


    const listAssets = async () => {
        try {
            let userAssetsMap = new Map();

            // Get all assets originally registered in user's address
            const contract = new window.web3.eth.Contract(DAPP_SMART_CONTRACT_ABI.abi, DAPP_SMART_CONTRACT_ADDRESS);
            const pastEvents = await contract.getPastEvents('Register', { filter: { _owner: account }, fromBlock: 'earliest', toBlock: 'latest' }); // @TODO: change fromBlock to current block number at the time dapp is deployed
            const readableEvents = pastEvents.map(_ev => _ev.returnValues);

            for (let i = 0; i < readableEvents.length; i++) {
                const assetAddress = readableEvents[i]['_assetAddress'];
                // const owner = readableEvents[i]['_owner'];
                // console.log(`${owner} owns ${assetAddress}`);
                userAssetsMap.set(assetAddress, true);
            }

            // Get all assets transferred out of user's address and remove them from user assets map
            for (let [assetAddress] of userAssetsMap) {
                const assetContract = new window.web3.eth.Contract(ASSET_CONTRACT_ABI.abi, assetAddress);
                const transferEvents = await assetContract.getPastEvents('TransferComplete', { filter: { _from: account }, fromBlock: 'earliest', toBlock: 'latest' }); // @TODO: change fromBlock to current block number at the time dapp is deployed
                const readableTransferEvents = transferEvents.map(_ev => _ev.returnValues);
                const transferredAssetAddress = readableTransferEvents?.[0]?.['_assetAddress'];
                if (transferredAssetAddress) {
                    userAssetsMap.delete(transferredAssetAddress);
                }
            }

            let userAssetsList = [];
            for (let [assetAddress] of userAssetsMap) {
                userAssetsList.push(assetAddress);
            }

            renderAssets(userAssetsList);

        } catch (err) {
            setSignResult(`Error while retrieving assets: ${err.message}`);
            console.error(err);
        }
    };


    const listPendingTransfers = async () => {
        try {
            // Get all assets registered by dapp smart contract
            const contract = new window.web3.eth.Contract(DAPP_SMART_CONTRACT_ABI.abi, DAPP_SMART_CONTRACT_ADDRESS);
            const pastEvents = await contract.getPastEvents('Register', { fromBlock: 'earliest', toBlock: 'latest' }); // @TODO: change fromBlock to current block number at the time dapp is deployed
            const readableEvents = pastEvents.map(_ev => _ev.returnValues);

            // Get all assets with transfer request to user's address and add them to user asset map
            let userAssetsMap = new Map();
            for (let i = 0; i < readableEvents.length; i++) {
                const assetContract = new window.web3.eth.Contract(ASSET_CONTRACT_ABI.abi, readableEvents[i]['_assetAddress']);
                const transferEvents = await assetContract.getPastEvents('TransferRequest', { filter: { _to: account }, fromBlock: 'earliest', toBlock: 'latest' }); // @TODO: change fromBlock to current block number at the time dapp is deployed
                const readableTransferEvents = transferEvents.map(_ev => _ev.returnValues);
                const pendingTransferAssetAddress = readableTransferEvents?.[0]?.['_assetAddress'];
                if (pendingTransferAssetAddress) {
                    userAssetsMap.set(pendingTransferAssetAddress, true);
                }
            }

            // Remove assets with transfer complete to user's address
            for (let [assetAddress] of userAssetsMap) {
                const assetContract = new window.web3.eth.Contract(ASSET_CONTRACT_ABI.abi, assetAddress);
                const transferEvents = await assetContract.getPastEvents('TransferComplete', { filter: { _to: account }, fromBlock: 'earliest', toBlock: 'latest' }); // @TODO: change fromBlock to current block number at the time dapp is deployed
                const readableTransferEvents = transferEvents.map(_ev => _ev.returnValues);
                const pendingTransferAssetAddress = readableTransferEvents?.[0]?.['_assetAddress'];
                if (pendingTransferAssetAddress) {
                    userAssetsMap.delete(pendingTransferAssetAddress);
                }
            }

            let pendingTransfersList = [];
            for (let [assetAddress] of userAssetsMap) {
                pendingTransfersList.push(assetAddress);
            }

            setPendingTransfers(pendingTransfersList);

        } catch (err) {
            setSignResult(`Error while retrieving pending transfers: ${err.message}`);
            console.error(err);
        }
    };


    const connectToWallet = async () => {
        if (DEBUG) {
            window.web3 = new Web3("http://127.0.0.1:8545"); // local blockchain
        }
        else if (window.ethereum) {
            await window.ethereum.request({method: 'eth_requestAccounts'});
            window.web3 = new Web3(window.ethereum);
        }
        else {
            console.warn('Failed to connect to wallet');
        }

        const accounts = await window.web3.eth.getAccounts();
        setAccount(accounts?.[0]);
        window.defaultAccount = accounts?.[0];
        console.log('Connected to ethereum with accounts:', accounts);
        const balance = await window.web3.eth.getBalance(accounts[0]);
        console.log(`Balance of default acount ${account} = ${balance}`);

        /*
        try {
            const accounts = await sdk?.connect(); // connect using metamask sdk
            setAccount(accounts?.[0]);
        } catch (err) {
            console.warn(`failed to connect..`, err);
        }
         */
    };


    /*  <button style={{ padding: 10, margin: 10 }} onClick={handleSIWEclick}>Sign In With Ethereum</button>
        <p></p>
        {signResult && `Sign result: ${signResult}`}
     */
    const handleSIWEclick = async () => {
        try {
            const from = account;
            const msg = `0x${Buffer.from(DAPP_MESSAGE_TO_SIGN, 'utf8').toString('hex')}`;

            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [msg, from],
            });

            handleAuth(signature);
            setSignResult(signature);

        } catch (err) {
            setSignResult(`Error while signing ethereum request: ${err.message}`);
            console.error(err);
        }
    };


    const handleAuth = async (signature) => {
        const requestBody = JSON.stringify({ signature: signature });

        fetch('http://localhost:8000/auth', {
                method: 'POST',
                headers: {
                 'Accept': 'application/json',
                 'Content-Type': 'application/json',
                },
                body: requestBody
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error(error));
    };


    // @TODO: load all assets in parallel
    async function renderAssets(assetAddressList) {
        let renderedAssetsJSX = [];

        for (let address of assetAddressList) {
            renderedAssetsJSX.push( <Asset key={address} assetAddress={address} /> );
        }

        setRenderedAssets(renderedAssetsJSX);
    }


    return (
        <>
            { connected && (
                <div>
                  <>
                    { account ? (
                        <>
                            <h3>Connected account: {account}</h3>
                            
                            <button style={{ padding: 10, margin: 10 }} onClick={initiateRegisterAsset}>Register Asset</button>

                            { registerAssetInitiated && (
                                <form onSubmit={handleSubmitRegisterAssetForm}>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Asset Name"
                                        value={formData.name}
                                        onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                                    />
                                    <button type="submit">Submit</button>
                                </form>
                            )}

                            { registerAssetRPCResult && <h3>registerAsset() result {registerAssetRPCResult}</h3> }


                            <button style={{ padding: 10, margin: 10 }} onClick={ listPendingTransfers }>Pending Transfers</button>
                            <h2>Pending Transfers</h2>
                            { pendingTransfers && pendingTransfers }

                            <button style={{ padding: 10, margin: 10 }} onClick={ listAssets }>My Assets</button>
                            <h2>My Assets</h2>
                            { renderedAssets && renderedAssets }
                        </>
                    ) : (
                        <>
                            <h3>Connect to MetaMask wallet to view or transfer assets</h3>
                            <button style={{ padding: 10, margin: 10 }} onClick={connectToWallet}>Connect to MetaMask</button>
                        </>
                    )}
                  </>
                </div>
            )}
        </>
    );

}

export default Console;

