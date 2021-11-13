const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hhd82.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("miaziAutomobile");
        const carsCollection = database.collection("cars");
        const orderCollection = database.collection("orders");
        const usersCollection = database.collection("users");
        const usersReviewCollection = database.collection("reviews");
      
        // GET API
        app.get('/cars', async(req, res) => {
          const cursor = carsCollection.find({});
          const cars = await cursor.toArray();
          res.send(cars);
        });

        app.get('/cars/:id', async(req, res) => {
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const car = await carsCollection.findOne(query);
          res.json(car);
        });

        app.get('/orders', async(req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        app.get('/users/:email', async(req, res) => {
          const email = req.params.email;
          const query = {email : email};
          const user = await usersCollection.findOne(query);
          let isAdmin = false;
          if(user?.role === 'admin'){
             isAdmin = true;
          }
          res.json({admin : isAdmin});
        });

        app.get('/reviews', async(req, res) => {
          const cursor = usersReviewCollection.find({});
          const reviews = await cursor.toArray();
          res.send(reviews);
        });

        // POST API
        app.post('/cars', async(req, res) => {
          const car = req.body;
          const result = await carsCollection.insertOne(car);
          res.json(result);
        })

        app.post('/orders', async(req, res) => {
          const order = req.body;
          const result = await orderCollection.insertOne(order);
          res.json(result);
        })

        app.post('/users', async(req, res) => {
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          res.json(result);
        })

        app.post('/reviews', async(req, res) => {
          const review = req.body;
          const result = await usersReviewCollection.insertOne(review);
          res.json(result);
        })

        // UPDATE API
        app.put('/orders/:id', async(req, res) => {
          const id = req.params.id;
          const updatedStatus = req.body;
          const filter = {_id: ObjectId(id)};
          const options = {upsert: true};
          const updateDoc = {
              $set: {
                  status: "Shipped"
              },
          };
          const result = await orderCollection.updateOne(filter, updateDoc, options);
          res.json(result);
        })

        app.put('/users', async(req, res) => {
          const user = req.body;
          const filter = {email: user.email};
          const options = {upsert: true};
          const updateDoc = { $set: user };
          const result = await usersCollection.updateOne(filter, updateDoc, options);
          res.json(result);
        })

        app.put('/users/admin', async(req, res) => {
          const user = req.body;
          const filter = {email: user.email};
          const updateDoc = { $set: {role: 'admin'} };
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
        })

        // DELETE API
        app.delete('/cars/:id', async(req, res) => {
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await carsCollection.deleteOne(query);
          res.json(result);
        });

        app.delete('/orders/:id', async(req, res) => {
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await orderCollection.deleteOne(query);
          res.json(result);
        });
      
      } finally {
      //   await client.close();
      } 
    }
    run().catch(console.dir);

  app.get('/', (req, res) => {
    res.send('Running Miazi Automobile Server');
  })

  app.listen(port, () => {
    console.log(`Running Miazi Automobile Server on Port:${port}`);
  })