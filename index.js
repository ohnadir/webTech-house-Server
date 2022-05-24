const express = require('express')
const cors = require('cors')
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
  const usersCollection = client.db('webTech-House').collection('users');
  const purchaseCollection = client.db('webTech-House').collection('purchase');
  const userInfoCollection = client.db('webTech-House').collection('userInfo');
  const paymentsCollection = client.db('webTech-House').collection('payments');
  

  // function for user access
  function verifyToken(req, res, next){
    const authHeader = req.headers.authorization;
    if (!authHeader){
      return res.status(401).send({message: 'UnAuthorized access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
      if(err) {
        return res.status(403).send({ message: 'Forbidden access' })
      }
      req.decoded(decoded);
      next();
    })
  }

  // post all login or singup user 
  app.put('/users/:email', async (req, res) => {
    const email = req.params.email;
    const user = req.body;
    const filter = { email: email };
    const options = { upsert: true };
    const updatedDoc = {
      $set: user,
    };
    const result = await usersCollection.updateOne(filter, updatedDoc, options);
    const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    res.send({result, token})
  })



  // get all parts
  app.get('/parts', async (req, res) => {
    const query = {};
    const result = await partsCollection.find(query).toArray();
    res.send(result);
  })

  // get a single parts from mongodb 
  app.get('/parts/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await partsCollection.findOne(query);
    res.send(result);
  })

  // get a single parts from mongodb 
  app.put('/parts/:id', async (req, res) => {
    const id = req.params.id;
    const updatedQuantity = req.body;
    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updatedDoc = {
      $set: {
        quantity : updatedQuantity.newQuantity
      }
    }
    const result = await partsCollection.updateOne(filter, updatedDoc, options);
    res.send(result);
  })

  // purchase item store on mongodb
  app.post('/purchase', async (req, res) => {
    const newItem = req.body;
    const result = await purchaseCollection.insertOne(newItem);
    res.send(result);
  })
  // get purchase item from mongodb
  app.get('/purchase', async (req, res) => {
    const email = req.query.email;
    const query = { buyerEmail: email };
    const result = await purchaseCollection.find(query).toArray();
    res.send(result);
  })
  // get a single purchase from mongodb 
  app.get('/purchase/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await purchaseCollection.findOne(query);
    res.send(result);
  })

  // post review 
  app.post('/reviews', verifyToken, async (req, res) => {
    const newReview = req.body;
    const result = await reviewsCollection.insertOne(newReview);
    res.send(result);
  })

   // get all reviews
   app.get('/reviews', async (req, res) => {
    const query = {};
    const result = await reviewsCollection.find(query).toArray();
    res.send(result);
  })
  
  // post users information
  app.post('/userInfo', async (req, res) => {
    const information = req.body;
    const result = await userInfoCollection.insertOne(information);
    res.send(result);
    
  })
   // get users information
  app.get('/userInfo', async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const result = await userInfoCollection.find(query).toArray();
    res.send(result);
  })

  // get a single userInfo from mongodb 
  app.get('/userInfo/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await userInfoCollection.findOne(query);
    res.send(result);
  })
  
  // get a single userInfo from mongodb
  app.put('/userInfo/:id', async (req, res) => {
    const id = req.params._id;
    const updatedInfo = req.body;
    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updatedDoc = {
      $set: {
        education : updatedInfo.education,
        location : updatedInfo.location,
        number : updatedInfo.number,
        linkedin : updatedInfo.linkedin,
      }
    }
    const result = await userInfoCollection.updateOne(filter, updatedDoc, options);
    res.send(result);
  })

  app.post('/create-payment-intent', async (req, res) => {
    const purchase = req.body;
    const price = purchase.totalPrice;
    const amount = price * 100;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ['card']
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  });

 /*  app.patch('/purchase/:id', async (res, req) => {
    const id = req.params.id;
    const payment = req.body;
    const filter = { _id: ObjectId(id) };
    const updatedDoc = {
      $set: {
        paid: true,
        transactionId :  payment.transactionId
      }
    }
    const updatedPayment = await purchaseCollection.updateOne(filter, updatedDoc);
    const result = await paymentsCollection.insertOne(payment);
    res.send(updatedPayment);
  }) */

  app.patch('/purchase/:id', async (req, res) => {
    const id = req.params.id;
    const payment = req.body;
    const filter = { _id: ObjectId(id) };
    const updatedDoc = {
      $set: {
        paid: true,
        transactionId :  payment.transactionId
      }
    }
    const updatedPayment = await purchaseCollection.updateOne(filter, updatedDoc);
    const result = await paymentsCollection.insertOne(payment);
    res.send(updatedPayment);
  })
 
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Testing connection')
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})