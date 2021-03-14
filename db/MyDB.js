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
          {
            $project: {
              leaderBoard: 1,
              length: { $size: "$usersPlayed" },
              code: 1,
            },
          },
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
      const files = await filesCol.find({ code: query }).toArray();
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
        const file = await filesCol
          .aggregate([{ $match: { size: sizes[i] } }, { $sample: { size: 1 } }])
          .toArray();
        files[i] = file;
      }

      console.log("Got files", files);

      return files;
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

  myDB.saveToLeaderBoard = async (query = {}) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      console.log("Connecting to the db");
      await client.connect();
      console.log("Connected!");
      const db = client.db(DB_NAME);
      const puzzleCol = db.collection("puzzles");
      let puzId = new ObjectId(query._id);
      console.log("Collection ready, querying with ", { _id: puzId });
      const data = await puzzleCol.find({ _id: puzId }).toArray();
      console.log("Got user", data);

      let res = null;
      let dbLb = data[0].leaderBoard;

      if (
        query.index == 11 ||
        query.index == dbLb.length ||
        dbLb.length == undefined
      ) {
        res = await db.collection("puzzles").updateOne(
          { _id: data[0]._id },
          {
            $push: { leaderBoard: { 0: query.username, 1: query.time } },
          }
        );
      } else {
        if (query.trim == true) {
          let pos = query.index - (dbLb.length - 1);
          res = await db.collection("puzzles").updateOne(
            { _id: data[0]._id },
            {
              $push: {
                leaderBoard: {
                  $each: [{ 0: query.username, 1: query.time }],
                  $position: pos,
                },
              },
            }
          );
          res = await db.collection("puzzles").updateOne(
            { _id: data[0]._id },
            {
              $pop: {
                leaderBoard: 1,
              },
            }
          );
        } else {
          let pos = query.index - (dbLb.length - 1);
          res = await db.collection("puzzles").updateOne(
            { _id: data[0]._id },
            {
              $push: {
                leaderBoard: {
                  $each: [{ 0: query.username, 1: query.time }],
                  $position: pos,
                },
              },
            }
          );
        }
      }
      console.log("result saved as " + query._id + " " + query.time);
      return res;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.saveTimeToUser = async (query = {}) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      console.log("Connecting to the db");
      await client.connect();
      console.log("Connected!");
      const db = client.db(DB_NAME);
      const userCol = db.collection("Users");
      let findUserQuery = { username: query.username };
      console.log("Collection ready, querying with ", findUserQuery);
      const data = await userCol.find(findUserQuery).toArray();
      console.log("Got user", data);

      let res = { result: "No need to update" };
      let games = data[0].played;

      //if time is better then current or there is no time yet
      if (games.length == 0) {
        //add puzzleId with time to array
        res = await db.collection("Users").updateOne(
          { _id: data[0]._id },
          {
            $push: { played: { gameId: query.puzzleCode, time: query.time } },
          }
        );
        console.log("result saved as " + query.puzzleCode + " " + query.time);
      } else {
        let index = null;
        for (let i = 0; i < games.length; i++) {
          if (games[i].gameId == query.puzzleCode) {
            index = i;
            break;
          }
        }
        console.log(
          "index checking " + index + " " + games[index].time + " " + query.time
        );
        console.log(query.time < games[index].time);
        console.log(index != null);
        if (index != null) {
          console.log("herrrrrrr");
          if (query.time < games[index].time) {
            //replace existing puzzleId's time
            let updateQuery = {
              _id: data[0]._id,
              "played.gameId": query.puzzleCode,
            };
            let updateDoc = {
              $set: { "played.$.time": query.time },
            };
            res = await db
              .collection("Users")
              .updateOne(updateQuery, updateDoc);
            console.log(
              "result saved as " + query.puzzleCode + " " + query.time
            );
          }
        } else if (index == null) {
          //first time play game, add puzzleId with time to array
          res = await db.collection("Users").updateOne(
            { _id: data[0]._id },
            {
              $push: { played: { gameId: query.puzzleCode, time: query.time } },
            }
          );
          console.log("result saved as " + query.puzzleCode + " " + query.time);
        } else if (games.length == undefined) {
          res = await db.collection("Users").updateOne(
            { _id: data[0]._id },
            {
              $push: { played: { gameId: query.puzzleCode, time: query.time } },
            }
          );
          console.log("result saved as " + query.puzzleCode + " " + query.time);
        }
      }
      return res;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  return myDB;
}

module.exports = MyDB();
