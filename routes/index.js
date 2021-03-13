var express = require("express");
var router = express.Router();
var path = require("path");
var passport = require("passport");
var bcrypt = require("bcrypt");

const myDB = require("../db/MyDB.js");
const saltRounds = 10;

//middle function to check login status, pending modification
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
    const hashedPwd = await bcrypt.hash(req.body.password, saltRounds);
    const userObj = {
      username: req.body.username,
      password: hashedPwd,
      played: [],
    };
    console.log(userObj);
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

//need to change it to session
router.get("/getUser", (req, res) =>
  res.send({
    username: req.user ? req.user.username : null,
    played: req.user ? req.user.played : null,
    check: req.session.passport ? req.session.passport : null,
  })
);

router.get("/profile", loggedIn, function (req, res) {
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

//pending delete
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
