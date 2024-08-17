const express = require("express");
const cors = require("cors");
require("dotenv").config();
// const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ehqhw1m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const productCollection = client.db("FindFast").collection("products");

app.get('/product', async(req, res) => {
    const result = await productCollection.find().toArray();
    res.send(result);
})


    app.get('/products', async (req, res) => {
      try {
        // Query parameters
        const page = Math.max(parseInt(req.query.page) - 1, 0) || 0;
        const limit = Math.max(parseInt(req.query.limit), 1) || 8;
        const search = req.query.search || "";
        const category = req.query.category || "";
        const brand = req.query.brand || "";
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
        let sort = req.query.sort || "rating";
        let sortOrder = req.query.order || "asc";
        
        // Sort options
        let sortBy = {};
        sortBy[sort] = sortOrder === "asc" ? 1 : -1;
        

        // Filters
        let filters = {
          price: { $gte: minPrice, $lte: maxPrice }
        };

        if (search) {
          filters.name = { $regex: search, $options: "i" };
        }
        
        if (category) {
          filters.category = category;
        }
        
        if (brand) {
          filters.brand = brand;
        }

        // Get total count for pagination
        const total = await productCollection.countDocuments(filters);

        // Fetch filtered and sorted products with pagination
        const products = await productCollection.find(filters)
          .sort(sortBy)
          .skip(page * limit)
          .limit(limit)
          .toArray();

        // Response object
        const response = {
          error: false,
          total,
          page: page + 1,
          limit,
          products,
        };

        res.status(200).send(response);
      } catch (err) {
        console.error("Error getting products:", err.message);
        res.status(500).send("Error getting data from database.");
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
    res.send("Hello from the Express server!");
  });

  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });