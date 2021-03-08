var express = require("express");
var router = express.Router();

const myDB = require("../db/MyDB.js");

/*leader board routs*/
// get boards of popular puzzles
router.get("/getPuzzles", async (req, res) => {
  try {
    console.log("Getting polular puzzles");
    const puzzles = await myDB.getPuzzles();
    res.send({ puzzles: puzzles });
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  }
});

//get board by searching puzzle id
router.get("/searchBoard", async (req, res) => {
  console.log("Search a puzzle", req.query);
  try {
    const puzzleId = req.query.puzzleid;
    const puzzle = await myDB.getPuzzleById(puzzleId);
    const leaderBoard = { 
      puzzle: puzzle._id,
      leaderboard: puzzle.leaderBoard 
    };
    res.send(leaderBoard);
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  }
});

router.post("/deleteFile", async (req, res) => {
  console.log("Delete file", req.body);
  try {
    const file = req.body;
    const dbRes = await myDB.deleteFile(file);
    res.send({ done: dbRes });
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  }
});

router.post("/createFile", async (req, res) => {
  console.log("Create file", req.body);

  let file;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  file = req.files.file;
  uploadPath = __dirname + "/../public/images/" + file.name;

  // if (err) return res.status(500).send(err);

  try {
    // Use the mv() method to place the file somewhere on your server
    await file.mv(uploadPath);

    const fileObj = { name: req.body.name, url: "/images/" + file.name };
    const dbRes = await myDB.createFile(fileObj);
    // res.send({ done: dbRes });

    res.redirect("/");
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  }
});

// data endpoint for files
router.get("/getFiles", async (req, res) => {
  try {
    console.log("myDB", myDB);
    const files = await myDB.getFiles();
    res.send({ files: files });
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  }
});

module.exports = router;
