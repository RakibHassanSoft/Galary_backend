const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()

//middleware
app.use(cors())
app.use(express.json())
const user = process.env.USER
const password = process.env.PASS
console.log(user, password)
//art
//art123
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${user}:${password}@cluster0.drqortc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
        await client.connect();

        //creatinng a data in database
        const artDatabase = client.db('arts').collection('item')
        const userDatabase = client.db('user').collection('user')
        const categoryDatabase = client.db('category').collection('category')

        // //user part
        //create user **
        app.post('/createUser', async (req, res) => {
            const newData = req.body;
            console.log(newData)

            // Check for duplicate email
            const duplicateEmail = await userDatabase.findOne({ User_email: newData.User_email });
            if (duplicateEmail) {
                return res.status(400).json({ error: "Email already exists" });
            }

            try {
                // Insert new data into the database
                const result = await userDatabase.insertOne(newData);
                res.json(newData);
            } catch (error) {
                return res.status(500).json({ error: "Internal Server Error" });
            }
        });

        //get one user data *
        app.get('/user/:id', async (req, res) => {
            const id = req.params.id;

            try {
                // Retrieve all data from the database
                const cursor = await userDatabase.find({ _id: new ObjectId(id) });

                // Convert the cursor to an array of documents
                const hasUser = await cursor.toArray();

                // Send the retrieved data as the response
                res.json(hasUser);
            } catch (error) {
                // Handle errors
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
        // get user by email *
        app.get('/userByEmail/:email', async (req, res) => {
            const userEmail = req.params.email;

            try {
                // Retrieve user data from the database based on email
                const userData = await userDatabase.findOne({ User_email: userEmail });

                if (!userData) {
                    // If user data is not found, send a 404 response
                    return res.status(404).json({ error: "User not found" });
                }

                // Send the retrieved user data as the response
                res.json(userData);
            } catch (error) {
                // Handle errors
                res.status(500).json({ error: "Internal Server Error" });
            }
        });

        //get users card data
        app.get('/userCart/:userId', async (req, res) => {
            const userId = req.params.userId;

            try {
                // Retrieve user data from the database
                const user = await userDatabase.findOne({ _id: new ObjectId(userId) });

                // If user not found, return empty array
                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }

                // Find user's carts based on userId
                const datas = await artDatabase.find({ userId: userId }).toArray();

                // Send the retrieved data as the response
                res.json(datas);
            } catch (error) {
                // Handle errors
                res.status(500).json({ error: "Internal Server Error" });
            }
        });






        //all categories
        app.get('/categories', async (req, res) => {
            try {
                // Retrieve all categories from the database
                const categories = await categoryDatabase.find({}).toArray();
                res.json(categories);
            } catch (error) {
                return res.status(500).json({ error: "Internal Server Error" });
            }
        });
        // Create a new category
        app.post('/createCategory', async (req, res) => {
            const newData = req.body;
            try {

                const result = await categoryDatabase.insertOne(newData);
                res.send(newData)
            } catch (error) {
                return res.status(500).json({ "Massage": "Error data" })
            }
        })











        // Arts data part
        // creater data *
        app.post('/create', async (req, res) => {
            const newData = req.body;
            try {

                const result = await artDatabase.insertOne(newData);
                res.send(newData)
            } catch (error) {
                return res.status(500).json({ "Massage": "Error data" })
            }
        })
        //get all data of a user
        app.get('/arts/:email', async (req, res) => {
            const headerEmail = req.params.email; // Use req.params.email to get the email parameter

            try {
                // Retrieve all data from the database where email matches
                const cursor = await artDatabase.find({ email: headerEmail }); // Use { email: headerEmail } as the query object

                // Convert the cursor to an array of documents
                const artsItems = await cursor.toArray();

                // Send the retrieved data as the response
                res.json(artsItems);
            } catch (error) {
                // Handle errors
                res.status(500).json({ error: "Internal Server Error" });
            }
        });

        // })
        //get all data
        app.get('/arts', async (req, res) => {
            try {
                // Retrieve all data from the database
                const cursor = await artDatabase.find();

                // Convert the cursor to an array of documents
                const artsItems = await cursor.toArray();

                // Send the retrieved data as the response
                res.json(artsItems);
            } catch (error) {
                // Handle errors
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
        //get one data
        app.get('/arts/:id', async (req, res) => {
            const id = req.params.id;

            try {
                // Retrieve all data from the database
                const cursor = await artDatabase.find({ _id: new ObjectId(id) });

                // Convert the cursor to an array of documents
                const artsItems = await cursor.toArray();

                // Send the retrieved data as the response
                res.json(artsItems);
            } catch (error) {
                // Handle errors
                res.status(500).json({ error: "Internal Server Error" });
            }
        });

        // delete a item  //user will do this
        app.delete('/arts/:userEmail/:itemId', async (req, res) => {
            const userEmail = req.params.userEmail;
            const itemId = req.params.itemId;
            console.log(itemId, userEmail)
            try {
                const result = await artDatabase.deleteOne({ _id: new ObjectId(itemId), email: userEmail });

                if (result.deletedCount === 1) {
                    // Document successfully deleted
                    res.json({ message: "Document deleted successfully" });
                } else {
                    // No document found with the specified IDs
                    res.status(404).json({ error: "Document not found" });
                }
            } catch (error) {
                // Handle errors
                res.status(500).json({ error: "Internal Server Error" });
            }
        });

        //update data only user will do this
        app.put('/arts/:userEmail/:itemId', async (req, res) => {
            const userEmail = req.params.userEmail;
            const itemId = req.params.itemId;

            // Assuming req.body contains the updated data for the item
            const updatedData = req.body;

            try {
                const result = await artDatabase.updateOne({ _id: new ObjectId(itemId), email: userEmail }, { $set: updatedData });

                if (result.modifiedCount === 1) {
                    // Document successfully updated
                    res.json({ message: "Document updated successfully" });
                } else {
                    // No document found with the specified IDs
                    res.status(404).json({ error: "Document not found" });
                }
            } catch (error) {
                // Handle errors
                res.status(500).json({ error: "Internal Server Error" });
            }
        });






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("hello world")
})



app.listen(5000, () => {
    console.log(`Server is running on ${500}`)
})
