// Assets.js

import React, { useState, useEffect } from "react";
import Web3 from "web3"; // @TODO: remove this import and instead inherit from parent component

// const web3 = new Web3(Web3.givenProvider);
// const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
const web3 = new Web3(new Web3.providers.HttpProvider("https://eth-mainnet.g.alchemy.com/v2/xHaks7r4ZQXMNe6GTQEtCDAvv4n9YGh0")); // eth mainnet

// <h1>Assets for {props.useraddress}</h1>

// function Assets(props) {
function Assets({ assetAddresses }) {

  const [data, setData] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {

      /*
      const requestBody = JSON.stringify({ useraddress: props.useraddress });

      fetch('http://localhost:8000/assets', {
            method: 'POST',
            headers: {
             'Accept': 'application/json',
             'Content-Type': 'application/json',
            },
            body: requestBody
          })
          .then(response => response.json())
          .then(data => setData(data));
       */

  }, []);

  /*
  if (!data) {
    return <div>Loading...</div>;
  }
   */

  return (
    <div>
      <h1>My Assets</h1>

      <ol>
        {assetAddresses.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ol>

    </div>
  );
}

export default Assets;

