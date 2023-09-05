const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://taskProject:w2ER3QOfrqlZfrT4@cluster0.bitxn0d.mongodb.net/?retryWrites=true&w=majority";

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
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        const users = client.db("tast1Project").collection("contacts");
        app.post('/contact', async (req, res) => {
            const contact = req.body;
            const result = await users.insertOne(contact);
            res.send(result);
        });
        app.get('/contact', async (req, res) => {
            const result = await users.find({}).toArray();
            res.send(result);
        });
        app.get('/contact/:text', async (req, res) => {
            const text = req.params.text;
            const result = await users.find({ name: { $regex: text, $options: "i" } });
            const data = await result.toArray();
            res.send(data);
        });
        app.get('/contacts/:id', async (req, res) => {
            const id = { _id: new ObjectId(req.params.id) }
            const result = await users.findOne(id);
            //    console.log(result);
            res.send(result);
        });
        app.patch('/contact/:id', async (req, res) => {
            const id = { _id: new ObjectId(req.params.id) }
            const updatedContact = req.body;
            const result = await users.updateOne(id, { $set: updatedContact });
            res.send(result);
        });
        app.delete('/contact/:id', async (req, res) => {
            const id = { _id: new ObjectId(req.params.id) }
            const result = await users.deleteOne(id);
            res.send(result);
        });
        app.get('/contact-group/:text', async (req, res) => {
            const text = req.params.text;
            const result = await users.find({ categories: text });
            const data = await result.toArray();
            res.send(data);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port)