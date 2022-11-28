const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("xen matrix server is running");
});

//mongodb connect

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kdwgcoc.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    //code goes here
    //create users collection
    const usersCollection = client.db("xenMatrix").collection("users");
    //products collection
    const productsCollection = client.db("xenMatrix").collection("products");
    //categories collection
    const categoriesCollection = client
      .db("xenMatrix")
      .collection("productCategories");
    //booking collection
    const bookingCollection = client.db("xenMatrix").collection("bookings");

    //token**********------********************//

    // verify JWT
    // const verifyJWT = (req, res, next) => {
    //   // console.log("token inside verifyJWT", req.headers.authorization);
    //   const authHeader = req.headers.authorization;
    //   if (!authHeader) {
    //     return res.status(401).send("unauthorized access");
    //   }
    //   const token = authHeader.split(" ")[1];
    //   jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    //     if (err) {
    //       return res.status(403).send({ message: "forbidden access" });
    //     }
    //     req.decoded = decoded;
    //     next();
    //   });
    // };
    //generate token =>okay
    // app.get("/jwt", async (req, res) => {
    //   const email = req.query.email;
    //   const query = { email: email };
    //   const user = await usersCollection.findOne(query);
    //   // console.log(user);
    //   if (user) {
    //     const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
    //       expiresIn: "96h",
    //     });
    //     return res.send({ accessToken: token });
    //   }
    //   // console.log(result);
    //   // res.send(result);
    //   return res.status(403).send({ accessToken: "" });
    // });

    //get user by email
    // app.get("/booked", verifyJWT, async (req, res) => {
    //   const buyerEmail = req.query.email;
    //   const decodedEmail = req.decoded.email;
    //   if (buyerEmail !== decodedEmail) {
    //     return res.status(403).send({ message: "forbidden access" });
    //   }
    //   const query = { email: buyerEmail };
    //   const result = await bookingCollection.find(query).toArray();
    //   return res.send(result);
    // });

    //token**********------********************//

    //token verification
    // app.get("/jwt", async (req, res) => {
    //   const email = req.query.email;
    //   const query = { email: email };
    //   const user = await usersCollection.findOne(query);
    //   if (user) {
    //     const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
    //       expiresIn: "96h",
    //     });
    //     res.send({ accessToken: token });
    //   }
    //   // console.log(result);
    //   // res.send(result);
    //   res.status(403).send({ accessToken: "" });
    // });

    //set user in database

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.send(result);
    });

    // get all the users
    app.get("/users", async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    //get user by email
    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    //get products by advertise value

    app.get("/advertise", async (req, res) => {
      const query = { advertised: { $eq: true } };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    //get all the categories
    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    });
    //get specific product by id
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    //delete specific product by id
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    //update advertise
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          advertised: true,
        },
      };
      const result = await productsCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    //get all the products under a category
    app.get("/categories/:name", async (req, res) => {
      const categoryName = req.params.name;
      const query = { catName: categoryName };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    //set bookings to the database
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    //get bookings data from database
    app.get("/bookings", async (req, res) => {
      const query = {};
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    //get the specific seller's products
    app.get("/products", async (req, res) => {
      const sellerEmail = req.query.email;
      const query = { seller: sellerEmail };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    //add new product to the database by seller
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    //get all the sellers
    app.get("/sellers", async (req, res) => {
      const query = { role: "Seller" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    //get all the buyers
    app.get("/buyers", async (req, res) => {
      const query = { role: "Buyer" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    //delete a user
    app.delete("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
      console.log(result);
    });

    //end of try block
  } finally {
  }
}
run().catch((err) => console.error(err));

app.listen(port, () => {
  console.log("app is running on port number :", port);
});
