require('dotenv').config()
// // To connect with your mongoDB database
// const mongoose = require('mongoose');
const MongoURI = process.env.MONGO_URI

const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false)
        mongoose.connect(MongoURI,{
            useNewUrlParser: true,
            useUnifiedTopology: true            
        })
        console.log('Mongo connected')
    } catch(error) {
        console.log(error)
        process.exit()
    }
}

connectDB();

// Schema for users of app
const DistanceSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true,
    },
    distance: {
        type: Number, // Assuming distance is stored as a float (number)
        required: true,
    },
});
const Distance = mongoose.model('Distancias', DistanceSchema, 'Distancias');
Distance.createIndexes();


// For backend and express
const express = require('express');
const app = express();
const cors = require("cors");
const { Timestamp } = require('mongodb')
console.log("App listen at port 5000");
app.use(express.json());
app.use(cors());
app.get("/", (req, resp) => {

	resp.send("App is Working");
	// You can check backend is working or not by 
	// entering http://loacalhost:5000
	
	// If you see App is working means
	// backend working properly
});

app.post("/insert", async (req, resp) => {
    try {
      // Generate a random distance
      const randomDistance = Math.random() * 100; // Adjust the range as needed

        // Create an object with the timestamp and random distance
        const newDistanceData = {
            timestamp: new Date(),
            distance: randomDistance,
        };

        const result = await Distance.create(newDistanceData);
  
      if (result) {
        delete result.password;
        resp.send(result);
        console.log(result);
      } else {
        console.log("Distance already registered");
      }
    } catch (e) {
      resp.status(500).send("Something Went Wrong");
    }
  });
  

// Define the route for fetching and printing documents
app.get("/getDistances", async (req, res) => {
    try {
      const distances = await Distance.find({});
      if (distances.length > 0) {
        console.log("All documents in the 'Distance' collection:");
        distances.forEach(distance => {
          const unixTimestamp = distance.timestamp; // Example Unix timestamp from MongoDB
          const timestampMilliseconds = unixTimestamp * 1000; // Convert to milliseconds
          const date = new Date(timestampMilliseconds); // Create a new Date object
          distance.timestamp = date;
          // console.log(distance.toObject());
        });
        res.json({distances: distances, message: "Data found"});
      } else {
        console.log("No documents found in the collection.");
        res.json({ message: "No documents found" });
      }
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Something went wrong" });
    }
  });

app.delete("/delete/:id", async (req, res) => {
    try {
        const itemId = req.params.id; // Get the ID of the item to delete from the request parameters

        // Use the 'deleteOne' method to remove a document by its ID
        const result = await Distance.deleteOne({ _id: itemId });

        if (result.deletedCount > 0) {
            console.log("Document deleted successfully");
            res.json({ message: "Document deleted successfully" });
        } else {
            console.log("Document not found or could not be deleted");
            res.status(404).json({ error: "Document not found or could not be deleted" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.post("/update/:id", async (req, res) => {
    try {
      const itemId = req.params.id; // Get the ID of the item to update from the request parameters
      const updatedData = req.body;

      // Use the 'updateOne' or 'updateMany' method to update the document(s)
      const result = await Distance.updateOne({ _id: itemId }, updatedData);

      if (result.modifiedCount > 0) {
        console.log("Document updated successfully");
        // res.json({ message: "Document updated successfully" });
        res.json({ message: 'Data updated' });
      } else {
        console.log("Document not found or could not be updated");
        res.status(404).json({ error: "Document not found or could not be updated" });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  });
  
app.delete("/deleteAll", async (req, res) => {
    try {
      // Use the 'deleteMany' method to remove all documents from the collection
      const result = await Distance.deleteMany({});
  
      if (result.deletedCount > 0) {
        console.log("All documents deleted successfully");
        res.json({ message: "All documents deleted successfully" });
      } else {
        console.log("No documents found or could not be deleted");
        res.status(404).json({ error: "No documents found or could not be deleted" });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
});


app.listen(5000);
