// Console.js

import React, { useState } from 'react';
import Web3 from "web3";
import { useSDK } from '@metamask/sdk-react';
import { Buffer } from 'buffer';
// import Assets from './Assets.js';

const DAPP_SMART_CONTRACT_ABI = require('../abi/ChainOfCustody.json');
const DAPP_SMART_CONTRACT_ADDRESS = '0xB59c8E901e3c39C9E3A1C1D8300FB42e97BF6bf8'; // @TODO: update contract address
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

    const [formData, setFormData] = useState({
        name: '',
        // email: '',
    });


    const handleSubmitForm = async (event) => {
        event.preventDefault();
        console.log(formData['name']);

        // Call registerAsset RPC
        // const contract = new web3.eth.Contract(DAPP_SMART_CONTRACT_ABI.abi, DAPP_SMART_CONTRACT_ADDRESS);
        const contract = new window.web3.eth.Contract(DAPP_SMART_CONTRACT_ABI.abi, DAPP_SMART_CONTRACT_ADDRESS);
        const result = await contract.methods.registerAsset(account, formData['name']).send({ from: account, value: 10 * 10**18 });
        setRegisterAssetRPCResult(result);

        // Clear form
        setFormData({ ...formData, name: '' });
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


    function initiateRegisterAsset() {
        setRegisterAssetInitiated(true);
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
                                <form onSubmit={handleSubmitForm}>
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

