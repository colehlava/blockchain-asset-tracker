# blockchain-asset-tracker
Decentralized application to track the chain of custody of an asset on the Ethereum blockchain.

## Local Configuration:
1. Host local blockchain: "ganache --verbose"
2. Compile smart contracts: from /contract "truffle build"
3. Migrate primary smart contract to blockchain: from /contract "truffle migrate"
4. Copy contract ABI's to src directory of frontend: from /contract "cp build/contracts/* ../client/src/abi/"
5. Set address of deployed smart contract in frontend: change value on line 12 of /client/src/components/Console.js
6. Start React development server: from /client "npm start"
7. Navigate to localhost:3000 in web browser

