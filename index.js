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
        const noti = client.db("tast1Project").collection("notification");
        const permission = client.db("tast1Project").collection("permission");
        app.post('/contact', async (req, res) => {
            const contact = req.body;
            const result = await users.insertOne(contact);
            res.send(result);
        });
        app.get('/contact', async (req, res) => {
            const result = await users.find({ accessType: 'Public' }).toArray();
            res.send(result);
        });
        app.post('/notification', async (req, res) => {
            const contact = req.body;
            const result = await noti.insertOne(contact);
            res.send(result);
        });
        app.get('/notification/:email', async (req, res) => {
            const email = req.params.email;
            const result = await noti.find({ email: email }).sort({ created_at: -1 }).toArray();
            res.send(result);
        });
        app.patch('/notification', async (req, res) => {
            const id = req.body.id;
            const objetid = await id.map(i => new ObjectId(i));
            const result = await noti.updateMany({ _id: { $in: objetid } }, { $set: { read: true } });
            res.send(result);
        });
        app.get('/my-contact/:email', async (req, res) => {
            const email = req.params.email;
            const result = await users.find({ ownerEmail: email }).toArray();
            res.send(result);
        });
        app.patch('/contact/:id', async (req, res) => {
            const id = { _id: new ObjectId(req.params.id) }
            const updatedContact = req.body;
            const result = await users.updateOne(id, { $set: updatedContact });
            res.send(result);
        });
        app.get('/contacts/:id', async (req, res) => {
            const id = { _id: new ObjectId(req.params.id) }
            const email = req?.query?.email;
            const contact = await users.findOne(id);
            if (contact?.ownerEmail == email) {
                res.send(contact);
            }
            else if (contact?.permission.find(p => p == email)) {
                if (contact?.accessType == 'Public') {
                    res.send(contact);
                }
                else {
                    res.send({ error: 'You are not authorized to access this contact' })
                }
            }

            else {
                res.send({ error: 'You are not authorized to access this contact' })
            }
            //    console.log(result);
        });
        app.get('/contact-details/:id', async (req, res) => {
            const id = { _id: new ObjectId(req.params.id) }
            const result = await users.findOne(id);
            res.send(result);
        });
        app.get('/all-permission', async (req, res) => {
            const result = await permission.find({}).toArray();
            res.send(result);
        });
        app.post('/permission', async (req, res) => {
            const contact = req.body;
            const result = await permission.insertOne(contact);
            res.send(result);
        });
        app.get('/permission/:email', async (req, res) => {
            const email = req.params.email;
            const result = await permission.find({ contactOwner: email, status: false }).toArray();
            res.send(result);
        });
        app.patch('/permission/:id', async (req, res) => {
            const details = req.body
            const id = { _id: new ObjectId(req.params.id) }
            const contactId = await { _id: new ObjectId(details?.contactId) }
            const contact = await users.findOne(contactId);
            const contactUpdate = await users.updateOne(contactId, { $set: { permission: [...contact?.permission, details?.reqUser] } });
            const result = await permission.updateOne(id, { $set: { status: true } });


            res.send(result);
        });
        app.delete('/permission/:id', async (req, res) => {
            const id = { _id: new ObjectId(req.params.id) }
            const result = await permission.deleteOne(id);
            res.send(result);
        });




        // todo
        app.get('/contact/:text', async (req, res) => {
            const text = req.params.text;
            const result = await users.find({ name: { $regex: text, $options: "i" }, accessType: 'Public' });
            const data = await result.toArray();
            res.send(data);
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
            const result = await users.find({ categories: text, accessType: 'Public' });
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