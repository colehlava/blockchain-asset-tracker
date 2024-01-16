// index.js

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


async function readFromDB(dbName, collection, query) {
  try {
    await client.connect();
    console.log("DB client connected");

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
    await result.forEach(console.dir);

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
    const mongoDB = client.db(dbName);
    const dbCollection = mongoDB.collection(collection);

    try {
       const insertResult = await dbCollection.insertOne(dataToWrite);
       console.log(`Document was inserted with the _id: ${insertResult.insertedId}`);

    } catch(e) {
       console.log(`An Exception occurred during write.`);
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


// Retrieve users assets from db
app.post('/assets', (req, res) => { 
    console.log(`assets useraddress = ${req.body.useraddress}`);
    res.json([
        { id: 1, name: 'First' },
        { id: 2, name: 'Second' },
        { id: 3, name: 'Third' }
    ]);
}); 



app.listen(port, () => { 
    console.log(`Server is running on port ${port}`); 
});


// pingDB();
// writeToDB();
// run().catch(console.dir);

