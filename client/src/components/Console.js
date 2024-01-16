// Console.js

import React, { useState } from 'react';
import { Buffer } from 'buffer';
import { useSDK } from '@metamask/sdk-react';
import Assets from './Assets.js';

function Console() {

    const [account, setAccount] = useState('');
    const [signResult, setSignResult] = useState('');
    const { sdk, connected, connecting, provider, chainId } = useSDK();

    const connectToMetaMask = async () => {
        try {
            const accounts = await sdk?.connect();
            setAccount(accounts?.[0]);

            // Send address to server
            // @TODO

        } catch(err) {
            console.warn(`failed to connect..`, err);
        }
    };


    const siweSign = async (siweMessage) => {
        try {
            const from = account;
            const msg = `0x${Buffer.from(siweMessage, 'utf8').toString('hex')}`;

            const sign = await window.ethereum.request({
                method: 'personal_sign',
                params: [msg, from],
            });

            setSignResult(sign);

        } catch (err) {
            setSignResult(`Error: ${err.message}`);
            console.error(err);
        }
    };


    const handleSIWEclick = async () => {
        const domain = window.location.host;
        const from = account;
        const siweMessage = `${domain} wants you to sign in with your Ethereum account:\n${from}\n\nI accept the MetaMask Terms of Service: https://community.metamask.io/tos\n\nURI: https://${domain}\nVersion: 1\nChain ID: 1\nNonce: 32891757\nIssued At: 2021-09-30T16:25:24.000Z`;
        siweSign(siweMessage);
    };



    return (
        <>
            <h1>Console</h1>

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

