// index.js

// Import modules
const web3 = require('web3');
// const addy = web3.eth.accounts.recover('Test message to sign\nNonce:123', '0x34e13908eae48c25380ffdf9048741785e73116825cfac97aa8e7987586fc5101f239ca3cc1c7fb8dad36d1636758393c323a4a52519eb99db0d4329391949901b');
const jwt = require('jsonwebtoken');

// Initialize Express
const express = require('express');
const cors = require('cors');
const app = express(); 
app.use(cors());
app.use(express.json({limit: '50mb'}));
// expApp.use(express.urlencoded({limit: '50mb', extended: true})); // use if needed for GET requests

// Initialize MongoDB
const { MongoClient } = require("mongodb");
const mongodbURI = "mongodb://127.0.0.1:27017";
const client = new MongoClient(mongodbURI);

// Constants
const port = 8000;
const DEFAULT_DB_NAME = "primarydb";
const APP_MESSAGE_TO_SIGN = "Blockchain based chain of custody sigmsg\nNonce:";
const JWT_SECRET = 'myjwtsecret';


async function readFromDB(dbName, collection, query) {
  try {
    await client.connect();
    const mongoDB = client.db(dbName);
    const dbCollection = mongoDB.collection(collection);

    // const query = { title: "The New Room" };

    const options = {
      // sort matched documents in descending order by rating
      // sort: { "imdb.rating": -1 },
      // Include only the `title` and `imdb` fields in the returned document
      // projection: { _id: 0, title: 1, imdb: 1 },
    };

    const result = await dbCollection.find(query, options);
    // await result.forEach(console.dir);
    return result;

  } finally {
    await client.close();
  }
}


async function pingDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to server");

  } finally {
    await client.close();
  }
}


async function fillDB() {
    const mongoDB = client.db(DEFAULT_DB_NAME);
    const dbCollection = mongoDB.collection("movies");

    try {
       const docs = [
          { "_id": 1111, "title": "The New Room"},
          { "_id": 1112, "title": "purple"},
          { "_id": 1113, "title": "blue"}
       ];

       const insertManyresult = await dbCollection.insertMany(docs);
       let ids = insertManyresult.insertedIds;

       console.log(`${insertManyresult.insertedCount} documents were inserted.`);
       for (let id of Object.values(ids)) {
          console.log(`Inserted a document with id ${id}`);
       }
    } catch(e) {
       console.log(`A MongoBulkWriteException occurred, but there are successfully processed documents.`);
       let ids = e.result.result.insertedIds;
       for (let id of Object.values(ids)) {
          console.log(`Processed a document with id ${id._id}`);
       }
       console.log(`Number of documents inserted: ${e.result.result.nInserted}`);
    }
}


async function writeToDB(dbName, collection, dataToWrite) {
    await client.connect();
    const mongoDB = client.db(dbName);
    const dbCollection = mongoDB.collection(collection);

    try {
       const insertResult = await dbCollection.insertOne(dataToWrite);
       console.log(`Document was inserted with the _id: ${insertResult.insertedId}`);

    } catch(e) {
       console.log(`An Exception occurred during write: ${e}`);
    }
}


app.post('/myapi', (req, res) => { 
    console.log(`myapi username = ${req.body.username}`);
    const currentTimestamp = new Date().getTime();
    // writeToDB(DEFAULT_DB_NAME, "api-calls", { time: currentTimestamp });
    // readFromDB(DEFAULT_DB_NAME, "api-calls", {});
    readFromDB(DEFAULT_DB_NAME, "api-calls", { time: 1704928252377 });
    res.json({ message: 'Hello from Express!' });
}); 


async function handleAuth(address, res) {
    try {
        await client.connect();
        const mongoDB = client.db(DEFAULT_DB_NAME);
        const dbCollection = mongoDB.collection("users");
        const user = await dbCollection.findOne({ address: address });

        if (user) {
            console.log(`user found: ${user}`);
        }
        else {
            console.log(`Creating user with address: ${address}`);
            writeToDB(DEFAULT_DB_NAME, "users", { address: address, tier: 'basic' });
        }

        const token = jwt.sign({ address: address }, JWT_SECRET, { expiresIn: "1h" });

        // @TODO: move to verify api helper function
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        const tokenAddress = decoded.address;
        console.log(`tokenAddress = ${tokenAddress}`);

        res.json({ jwt: token });

    } finally {
        await client.close();
    }
}

// Authenticate user, generate and return JWT
app.post('/auth', (req, res) => { 
    const signature = req.body.signature;
    const address = web3.eth.accounts.recover(APP_MESSAGE_TO_SIGN, signature);
    console.log(`auth useraddress = ${address}`);

    handleAuth(address, res);
}); 


// Retrieve users assets from db
app.post('/assets', (req, res) => { 
    console.log(`assets useraddress = ${req.body.useraddress}`);
    res.json([
        { id: 1, name: 'First' },
        { id: 2, name: 'Second' },
        { id: 3, name: 'Third' }
    ]);
}); 


async function printUsers() {
    await client.connect();
    const mongoDB = client.db(DEFAULT_DB_NAME);
    const dbCollection = mongoDB.collection("users");
    const users = await dbCollection.find();
    await users.forEach(console.dir);
}

app.listen(port, () => { 
    console.log(`Server is running on port ${port}`); 

    printUsers();
});


// pingDB();
// writeToDB();
// run().catch(console.dir);

