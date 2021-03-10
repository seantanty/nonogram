var express = require("express");
var router = express.Router();
var path = require("path");
var passport = require("passport");

const myDB = require("../db/MyDB.js");

//middle function to check login status
function loggedIn(req, res, next) {
  console.log("loggedIn");
  console.log(req.user);
  if (req.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

//index route, still subject to update
router.get("/", loggedIn, function (req, res) {
  let fileName = path.join(__dirname + "/../public/index.html");
  console.log("redirect should have user");
  console.log(req.user);
  var options = {
    headers: {
      name: req.user._id,
    },
  };
  res.sendFile(fileName, options);
});

router.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    const userObj = {
      username: req.body.username,
      password: req.body.password,
    };
    const dbRes = await myDB.createUser(userObj);
    if (dbRes == null) {
      res.status(400).send({ message: "Username existed." });
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    }
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  }
});

router.get("/login", function (req, res) {
  res.sendFile(path.join(__dirname + "/../public/login.html"));
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function (req, res) {
    console.log("successful login");
    res.redirect("/");
  }
);

router.get("/logout", loggedIn, function (req, res) {
  req.logout();
  res.redirect("/");
});

router.get("/getUser", (req, res) =>
  res.send({
    username: req.user ? req.user.username : null,
    played: req.user ? req.user.played : null,
  })
);

router.get("/profile", loggedIn, function (req, res) {
  // let generatePage = myDB.getUserProfilePage(req.user._id);
  // res.send(generatePage);
  // let message = "<h1>" + "Signed in as" + req.user.username + "</h1>";
  // res.send(message);
  let fileName = path.join(__dirname + "/../public/profile.html");
  console.log("redirect should have user");
  console.log(req.user);
  res.sendFile(fileName);
});

/*index routs*/
// get puzzle by size
router.get("/getPuzzlesPlay", async (req, res) => {
  try {
    console.log("Getting puzzles by size");
    const puzzles = await myDB.getPuzzleBySize();
    res.send({ puzzles: puzzles });
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  }
});

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
router.post("/searchBoard", async (req, res) => {
  console.log("Search a puzzle", req.body);
  try {
    const puzzleId = req.body.puzzleid;
    const puzzle = await myDB.getPuzzleById(puzzleId);
    const leaderBoard = {
      puzzle: puzzle._id,
      leaderboard: puzzle.leaderBoard,
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
    // res.send({ files: files, user: req.user.username });
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  }
});

module.exports = router;
