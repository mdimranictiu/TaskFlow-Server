const express = require('express');
require('dotenv').config()
const cors=require('cors')
const app= express();
const port= process.env.PORT || 3000;
const { MongoClient, ServerApiVersion } = require('mongodb');
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
   
    app.get('/',(req,res)=>{
        res.send('Server is running')
    })
    // backend code
    

    console.log("Successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log(`Server is running: http://localhost:${port}`)
})