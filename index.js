const express = require('express');
require('dotenv').config()
const cors=require('cors')
const jwt = require("jsonwebtoken");
const app= express();
const port= process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nu3ic.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

app.use(cors())
app.use(express.json());
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const userCollection = client.db("TaskFlow").collection("users");
    const tasksCollection = client.db("TaskFlow").collection("tasks");
   
    app.get('/',(req,res)=>{
        res.send('Server is running')
    })
    // backend code

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1hr",
      });
      res.send({ token });
    });
    // verify Token
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send("Forbidden Access");
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send("Forbidden Access");
        }
        req.decoded = decoded;
        next();
      });
    };

    // user store

    app.post("/users", async (req, res) => {
      const user = req.body;
      // insert email if user doesnt exists:
      // you can do this many ways (1. email unique, 2. upsert 3. simple checking)
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      console.log(user);
      res.send(result);
    });

    app.get('/user/email', verifyToken, async (req, res) => {
      try {
          // Extract email from query
          const email = req.query.email;
          if (!email) {
              return res.status(400).send({ message: "Email query parameter is required" });
          }
  
          // Query user by email
          const userData = await userCollection.findOne({ email });
  
          // If user not found, return 404
          if (!userData) {
              return res.status(404).send({ message: "User not found" });
          }
  
          // Send user data
          res.send(userData);
      } catch (error) {
          console.error("Error fetching User Information:", error);
          res.status(500).send({ message: "Internal Server Error" });
      }
  });
  

    // add task

    app.post('/add-task',verifyToken, async(req,res)=>{
      const taskData=req.body;
      const timestamp=  new Date().toISOString().split('T')[0];
      const newtaskData= {...taskData,timestamp}
      const result= await tasksCollection.insertOne(newtaskData);
      res.send(result)
    })
    
// find task

app.get('/tasks', verifyToken, async (req, res) => {
  try {
    const query = req.query;  // ✅ Get query params properly
    console.log("Query received:", query);

    const tasks = await tasksCollection.find(query).toArray();  
    res.send(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

//find a task by id

app.get('/task/:id',verifyToken,async(req,res)=>{
  const {id}= req.params;
  const query = { _id: new ObjectId(id) };
  const result= await tasksCollection.findOne(query);
  res.send(result)
})
//delete
app.delete('/task/:id',verifyToken,async(req,res)=>{
  const {id}= req.params;
  const query = { _id: new ObjectId(id) };
  const result= await tasksCollection.deleteOne(query);
  res.send(result)
})
app.patch('/task/:id',verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate } = req.body; // Ensure the body contains the fields you're updating
  
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      title,
      description,
      dueDate,
    },
  };

  try {
    const result = await tasksCollection.updateOne(query, updateDoc);
    if (result.matchedCount === 0) {
      return res.status(404).send({ message: 'Task not found' });
    }
    res.send({ message: 'Task updated successfully', result });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to update task' });
  }
});

app.patch('/task/updateCat/:id', async (req, res) => {
  const { id } = req.params;
  const { category } = req.body; // Ensure the body contains the 'category' you're updating
  
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      category,  // Update the category field in the task
    },
  };

  try {
    const result = await tasksCollection.updateOne(query, updateDoc);
    if (result.matchedCount === 0) {
      return res.status(404).send({ message: 'Task not found' });
    }
    res.send({ message: 'Task category updated successfully', result });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to update task category' });
  }
});


    console.log("Successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log(`Server is running: http://localhost:${port}`)
})

console.log()