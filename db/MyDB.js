const { MongoClient, ObjectId } = require("mongodb");

function MyDB() {
  const myDB = {};

  const url = process.env.MONGODB_URI;
  const DB_NAME = "5610Project2";

  // Get popular puzzles for displaying leader boards.
  myDB.getPuzzles = async () => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      await client.connect();
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
      return files;
    } finally {
      client.close();
    }
  };

  // get the puzzle searched by puzzle id
  myDB.getPuzzleById = async (query) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      await client.connect();
      const db = client.db(DB_NAME);
      const filesCol = db.collection("puzzles");
      const files = await filesCol.find({ code: query }).toArray();
      return files[0];
    } finally {
      client.close();
    }
  };

  // get three puzzles for each size for playing
  myDB.getPuzzleBySize = async () => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      await client.connect();
      const db = client.db(DB_NAME);
      const filesCol = db.collection("puzzles");
      const files = new Array(3);
      var sizes = new Array(5, 10, 15);
      for (var i = 0; i < 3; i++) {
        const file = await filesCol
          .aggregate([{ $match: { size: sizes[i] } }, { $sample: { size: 1 } }])
          .toArray();
        files[i] = file;
      }

      return files;
    } finally {
      client.close();
    }
  };

  //user register
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
      client.close();
    }
  };

  //check if same username exist
  myDB.findSameUserName = async (query = {}) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      await client.connect();
      const db = client.db(DB_NAME);
      const userCol = db.collection("Users");
      const data = await userCol.find(query).toArray();

      if (data != null && data.length == 1) {
        if (data[0].username === query.username) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } finally {
      client.close();
    }
  };

  myDB.findUserByUserName = async (query = {}, done) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      await client.connect();
      const db = client.db(DB_NAME);
      const userCol = db.collection("Users");
      const data = await userCol.find(query).toArray();

      if (data != null && data.length == 1) {
        return done(null, data[0]);
      } else {
        return done(null, null);
      }
    } finally {
      client.close();
    }
  };

  myDB.findUserById = async (query = {}, done) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      await client.connect();
      const db = client.db(DB_NAME);
      const userCol = db.collection("Users");
      const data = await userCol.find(query).toArray();

      if (data != null && data.length == 1) {
        return done(null, data[0]);
      } else {
        return done(null, null);
      }
    } finally {
      client.close();
    }
  };

  //save time to leaderboard if the time is in top 10.
  //leaderboard only maintain top 10(shortest) time with its user
  myDB.saveToLeaderBoard = async (query = {}) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      await client.connect();
      const db = client.db(DB_NAME);
      const puzzleCol = db.collection("puzzles");
      let o_id = new ObjectId(query.puzzleId);
      const data = await puzzleCol.find({ _id: o_id }).toArray();

      let res = null;
      let dbLb = data[0].leaderBoard;

      if (query.index == 11 || dbLb.length == undefined) {
        res = await db.collection("puzzles").updateOne(
          { _id: data[0]._id },
          {
            $push: { leaderBoard: { 0: query.username, 1: query.time } },
          }
        );
      } else {
        if (query.trim == true) {
          let pos = query.index;
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
          let pos = query.index;
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
      return res;
    } finally {
      client.close();
    }
  };

  //save played puzzle time to user only if the time is better then previous time
  myDB.saveTimeToUser = async (query = {}) => {
    let client;
    try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      await client.connect();
      const db = client.db(DB_NAME);
      const userCol = db.collection("Users");
      let findUserQuery = { username: query.username };
      const data = await userCol.find(findUserQuery).toArray();

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
      } else {
        let index = null;
        for (let i = 0; i < games.length; i++) {
          if (games[i].gameId == query.puzzleCode) {
            index = i;
            break;
          }
        }
        if (games.length == undefined) {
          res = await db.collection("Users").updateOne(
            { _id: data[0]._id },
            {
              $push: { played: { gameId: query.puzzleCode, time: query.time } },
            }
          );
        } else if (index != null) {
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
          }
        } else if (index == null) {
          //first time play game, add puzzleId with time to array
          res = await db.collection("Users").updateOne(
            { _id: data[0]._id },
            {
              $push: { played: { gameId: query.puzzleCode, time: query.time } },
            }
          );
        }
      }
      return res;
    } finally {
      client.close();
    }
  };

  return myDB;
}

module.exports = MyDB();
