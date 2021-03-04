const { MongoClient, ObjectId } = require("mongodb");

function MyDB() {
  const myDB = {};

  const url =
    "mongodb+srv://seantan:web5610dev@cluster0.u90qt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
  // process.env.MONGO_URL || "mongodb://localhost:27017";
  const DB_NAME = "5610Project2";

  myDB.getFiles = async (query = {}) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      console.log("Connecting to the db");
      await client.connect();
      console.log("Connected!");
      const db = client.db(DB_NAME);
      const filesCol = db.collection("testingdata");
      console.log("Collection ready, querying with ", query);
      const files = await filesCol.find(query).toArray();
      console.log("Got files", files);

      return files;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.deleteFile = async (file) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      console.log("Connecting to the db");
      await client.connect();
      console.log("Connected!");
      const db = client.db(DB_NAME);
      const filesCol = db.collection("files");
      console.log("Collection ready, deleting ", file);
      const files = await filesCol.deleteOne({ _id: ObjectId(file._id) });
      console.log("Got files", files);

      return files;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.createFile = async (file) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      console.log("Connecting to the db");
      await client.connect();
      console.log("Connected!");
      const db = client.db(DB_NAME);
      const filesCol = db.collection("files");
      console.log("Collection ready, insert ", file);
      const res = await filesCol.insertOne(file);
      console.log("Inserted", res);

      return res;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  return myDB;
}

module.exports = MyDB();
