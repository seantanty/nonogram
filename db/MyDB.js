const { MongoClient, ObjectId } = require("mongodb");

function MyDB() {
  const myDB = {};

  const url =
    "mongodb+srv://seantan:web5610dev@cluster0.u90qt.mongodb.net/test";
  //<password>
  // process.env.MONGO_URL || "mongodb://localhost:27017";
  const DB_NAME = "5610Project2";

  // Get popular puzzles for displaying leader boards.
  myDB.getPuzzles = async () => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      console.log("Connecting to the db");
      await client.connect();
      console.log("Connected!");
      const db = client.db(DB_NAME);
      const filesCol = db.collection("puzzles");
      const files = await filesCol
        .aggregate([
          { $project: { leaderBoard: 1, length: { $size: "$usersPlayed" } } },
          { $sort: { length: -1 } },
          { $limit: 3 },
        ])
        .toArray();
      console.log("Got puzzles", files);
      return files;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };
 
  // get the puzzle searched by puzzle id
  myDB.getPuzzleById = async (query) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      console.log("Connecting to the db");
      await client.connect();
      console.log("Connected!");
      const db = client.db(DB_NAME);
      const filesCol = db.collection("puzzles");
      console.log("Collection ready, querying with id: ", query);
      const files = await filesCol.find({ _id: ObjectId(query) }).toArray();
      console.log("Got the puzzle", files);
      return files[0];
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };
  
  // get three puzzles for each size for playing
  myDB.getPuzzleBySize = async () => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      console.log("Connecting to the db");
      await client.connect();
      console.log("Connected!");
      const db = client.db(DB_NAME);
      const filesCol = db.collection("puzzles");
      //console.log("Collection ready, querying with id: ", query);
      const files = new Array(3);
      var sizes = new Array(5, 10, 15);
      for (var i = 0; i < 3; i++) {
        const file = await filesCol.aggregate(
          [{"$match": {"size": sizes[i]}}, {"$sample": {"size": 1}}]).toArray();
        files[i] = file;
      }
      
      console.log("Got files", files);

      return files;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

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

  myDB.createUser = async (user) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      await client.connect();
      const db = client.db(DB_NAME);
      const usersCol = db.collection("Users");
      const existed = await usersCol.findOne({ username: user.username });
      if (existed != null) {
        return null;
      } else {
        const res = await usersCol.insertOne(user);
        return res;
      }
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.findUserByUserName = async (query = {}, done) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      await client.connect();
      console.log("find user!");
      const db = client.db(DB_NAME);
      const userCol = db.collection("Users");
      console.log("Collection ready, querying with ", query);
      const data = await userCol.find(query).toArray();
      console.log("Got user", data);

      if (data != null && data.length == 1) {
        return done(null, data[0]);
      } else {
        return done(null, null);
      }
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.findUserById = async (query = {}, done) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      console.log("Connecting to the db");
      await client.connect();
      console.log("Connected!");
      const db = client.db(DB_NAME);
      const userCol = db.collection("Users");
      console.log("Collection ready, querying with ", query);
      const data = await userCol.find(query).toArray();
      console.log("Got user", data);

      if (data != null && data.length == 1) {
        return done(null, data[0]);
      } else {
        return done(null, null);
      }
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  //still working on this
  myDB.getUserProfilePage = async (query = {}) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      console.log("Connecting to the db");
      await client.connect();
      console.log("Connected!");
      const db = client.db(DB_NAME);
      const userCol = db.collection("Users");
      console.log("Collection ready, querying with ", query);
      const data = await userCol.find(query).toArray();
      console.log("Got user", data);

      //create page element
      let divOut = document.createElement("div");
      let title = document.createElement("h1");
      let titleText = document.createTextNode(
        "Signed in as" + data[0].user.username
      );
      title.appendChild(titleText);
      divOut.appendChild(title);

      return divOut;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  return myDB;
}

module.exports = MyDB();
