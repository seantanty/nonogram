var express = require("express");
var router = express.Router();

const myDB = require("../db/MyDB.js");

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
