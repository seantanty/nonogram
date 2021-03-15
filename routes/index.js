var express = require("express");
var router = express.Router();
var path = require("path");
var passport = require("passport");
var bcrypt = require("bcrypt");

const myDB = require("../db/MyDB.js");
const saltRounds = 10;

//middle function to check login status before show profile page
function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

//index GET
router.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/../public/index.html"));
});

//register GET
router.get("/register", function (req, res) {
  res.sendFile(path.join(__dirname + "/../public/register.html"));
});

//check same user name before register
router.post("/checkSameUserName", async (req, res) => {
  try {
    const result = await myDB.findSameUserName(req.body);
    res.send({ same: result });
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  }
});

//register POST
router.post("/register", async (req, res) => {
  try {
    const hashedPwd = await bcrypt.hash(req.body.password, saltRounds);
    const userObj = {
      username: req.body.username,
      password: hashedPwd,
      played: [],
    };
    const dbRes = await myDB.createUser(userObj);
    if (dbRes == null) {
      res.redirect("/register");
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

//login GET
router.get("/login", function (req, res) {
  res.sendFile(path.join(__dirname + "/../public/login.html"));
});

//login POST
router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function (req, res) {
    console.log("successful login");
    res.redirect("/");
  }
);

//logout GET
router.get("/logout", loggedIn, function (req, res) {
  req.logout();
  res.redirect("/");
});

//route to get user info
router.get("/getUser", (req, res) =>
  res.send({
    username: req.user ? req.user.username : null,
    played: req.user ? req.user.played : null,
  })
);

//profile GET
router.get("/profile", loggedIn, function (req, res) {
  res.sendFile(path.join(__dirname + "/../public/profile.html"));
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

/*leader board routes*/
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
  try {
    const puzzleId = req.body.puzzleid;
    const puzzle = await myDB.getPuzzleById(puzzleId);
    let leaderBoard = {
      success: false,
    };
    if (puzzle == null) {
      console.log("No leaderboard found");
    } else {
      leaderBoard = {
        code: puzzle.code,
        leaderBoard: puzzle.leaderBoard,
        info: puzzle.info,
        success: true,
      };
    }
    res.send(leaderBoard);
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  }
});

//route to save solved puzzle to user collection
router.post("/saveTimeToUser", async (req, res) => {
  try {
    const saveTime = await myDB.saveTimeToUser(req.body);
    res.send(saveTime);
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  }
});

//route to save solved puzzle to puzzle collection
router.post("/saveToLeaderBoard", async (req, res) => {
  try {
    const saveLB = await myDB.saveToLeaderBoard(req.body);
    res.send(saveLB);
  } catch (e) {
    console.log("Error", e);
    res.status(400).send({ err: e });
  }
});

module.exports = router;
