var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var db = require("./db/MyDB");
var ObjectId = require("mongodb").ObjectId;

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

passport.use(
  new LocalStrategy(function (username, password, done) {
    db.findUserByUserName({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (user.password != password) {
        return done(null, false);
      }
      return done(null, user);
    });
  })
);

//check those two
passport.serializeUser(function (user, cb) {
  cb(null, user._id);
});

passport.deserializeUser(function (id, cb) {
  let o_id = new ObjectId(id);
  db.findUserById({ _id: o_id }, function (err, user) {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

app.use(
  require("express-session")({
    secret: "yongliangandxinyi",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);

module.exports = app;
