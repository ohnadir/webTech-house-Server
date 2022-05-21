const express = require('express')
const cors = require('cors')
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express()
const port = process.evn.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Testing connection')
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})