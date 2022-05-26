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
      req.decoded = decoded;
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
    const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN);
    res.send({result, token})
  })

  app.put('/users/admin/:email', async (req, res) => {
    const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: 'admin' },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

  app.get('/admin/:email', async (req, res) => {
    const email = req.params.email;
    const user = await usersCollection.findOne({ email: email });
    const isAdmin = user.role === 'admin';
    res.send({ admin: isAdmin })
  })


  // get All users from Database
  app.get('/users', verifyToken, async (req, res) => {
    const result = await usersCollection.find().toArray();
    res.send(result);
  })

  // get a single users from mongodb 
  app.get('/users/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await usersCollection.findOne(query);
    res.send(result);
  })

  // post parts 
  app.post('/parts', verifyToken, async (req, res) => {
    const newParts = req.body;
    const result = await partsCollection.insertOne(newParts);
    res.send(result);
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
  // delete a single parts 
  app.delete('/parts/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const result = await partsCollection.deleteOne(filter);
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
  app.get('/purchase', verifyToken, async (req, res) => {
    const email = req.query.email;
    const query = { buyerEmail: email };
    const result = await purchaseCollection.find(query).toArray();
    res.send(result);
  })

  // get purchase item from mongodb
  app.get('/allPurchase', verifyToken, async (req, res) => {
    const query = {};
    const result = await purchaseCollection.find(query).toArray();
    res.send(result);
  })

  // insert new criteria to  allPurchase 
  app.patch('/allPurchase/:id', async (req, res) => {
    const id = req.params.id;
    const shipped = req.body;
    const filter = { _id: ObjectId(id) };
    const updatedDoc = {
      $set: (shipped)
    }
    const updatedShipment = await purchaseCollection.updateOne(filter, updatedDoc);
    res.send(updatedShipment);
  })

  // delete a single purchase 
  app.delete('/allPurchase/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const result = await purchaseCollection.deleteOne(filter);
    res.send(result);
  })

  // get a single purchase from mongodb 
  app.get('/purchase/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await purchaseCollection.findOne(query);
    res.send(result);
  })

  // post review 
  app.post('/reviews',  async (req, res) => {
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
  app.get('/userInfo', verifyToken, async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const result = await userInfoCollection.find(query).toArray();
    res.send(result);
  })

  // get a single userInfo from mongodb 
  app.get('/userInfo/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await userInfoCollection.findOne(query);
    res.send(result);
  })
  
  // update a single userInfo from mongodb
  app.put('/userInfo/:email',  async (req, res) => {
    const email = req.params.email;
    const information = req.body;
    const filter = { email: email};
    const options = { upsert: true };
    const updatedDoc = {
      $set: {
        education : information.education,
        location : information.location,
        number : information.number,
        linkedin : information.linkedin,
      }
    }
    const result = await userInfoCollection.updateMany(filter, updatedDoc, options);
    res.send(result);
    console.log(information);
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