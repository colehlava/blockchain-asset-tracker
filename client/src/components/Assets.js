// Assets.js

import React, { useState, useEffect } from "react";
import Web3 from "web3"; // @TODO: remove this import and instead inherit from parent component

// const web3 = new Web3(Web3.givenProvider);
// const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
const web3 = new Web3(new Web3.providers.HttpProvider("https://eth-mainnet.g.alchemy.com/v2/xHaks7r4ZQXMNe6GTQEtCDAvv4n9YGh0")); // eth mainnet

// <h1>Assets for {props.useraddress}</h1>

function Assets(props) {

  const [data, setData] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
      // @TODO: replace address with JWT (note: address is lower case)
      const requestBody = JSON.stringify({ useraddress: props.useraddress });

      web3.eth.getAccounts().then((accounts) => {
          setAccounts(accounts);
          console.log("Accounts:", accounts);
      });

      /*
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>

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

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>My Data</h1>
    </div>
  );
}

export default Assets;

