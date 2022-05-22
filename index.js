const express = require('express')
const cors = require('cors')
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1ddfd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
  await client.connect();
  console.log("Connected From Db");
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Testing connection')
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})