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
  const partsCollection = client.db('webTech-House').collection('parts');
  const reviewsCollection = client.db('webTech-House').collection('reviews');
  

  // get all parts
  app.get('/parts', async (req, res) => {
    const query = {};
    const result = await partsCollection.find(query).toArray();
    res.send(result);
  })

  // get all reviews
  app.get('/reviews', async (req, res) => {
    const query = {};
    const result = await reviewsCollection.find(query).toArray();
    res.send(result);
  })
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Testing connection')
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})