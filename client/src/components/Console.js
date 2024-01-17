// Console.js

import React, { useState } from 'react';
import { Buffer } from 'buffer';
import { useSDK } from '@metamask/sdk-react';
import Assets from './Assets.js';

const APP_MESSAGE_TO_SIGN = "Blockchain based chain of custody sigmsg\nNonce:";

function Console() {

    const { sdk, connected, connecting, provider, chainId } = useSDK();

    const [account, setAccount] = useState('');
    const [signResult, setSignResult] = useState('');
    const [signedMessage, setSignedMessage] = useState("");


    const connectToMetaMask = async () => {
        try {
            const accounts = await sdk?.connect();
            setAccount(accounts?.[0]);

        } catch(err) {
            console.warn(`failed to connect..`, err);
        }
    };


    const handleSIWEclick = async () => {
        try {
            const from = account;
            const msg = `0x${Buffer.from(APP_MESSAGE_TO_SIGN, 'utf8').toString('hex')}`;

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


    return (
        <>
            {connected && (
                <div>
                  <>
                    {!account && (
                        <>
                            <h3>Connect to MetaMask to view or transfer assets</h3>
                            <button style={{ padding: 10, margin: 10 }} onClick={connectToMetaMask}>Connect to MetaMask</button>
                        </>
                    )}

                    {account && (
                        <>
                            <h3>Connected account: ${account}</h3>
                            <Assets useraddress={account} />
                            <button style={{ padding: 10, margin: 10 }} onClick={handleSIWEclick}>Sign In With Ethereum</button>
                            <p></p>
                            {signResult && `Sign result: ${signResult}`}
                        </>
                    )}
                  </>
                </div>
            )}
        </>
    );

}

export default Console;

