// import express from "express";
// import bodyParser from "body-parser";
const bodyParser = require("body-parser")
const express = require("express")

const mongoose = require('mongoose')

const app = express();

//cors policy
const cors = require('cors');
const corsOptions ={
  origin: '*', 
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
const port = 4000;

const dotenv = require("dotenv")   //requiring dotenv
dotenv.config({ path: "./config.env" })

require("./db/connection")
// require('../db/connection')
const Note = require('./model/NoteSchema')

app.use(bodyParser.json()); //  line to parse JSON data



// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const column1 = [
];

// GET all posts
app.get("/posts", (req, res) => {

  column1.length = 0;

  Note.find()
    .then(notes => {
      notes.forEach(async (note, index) => {
        // console.log(note)
        await column1.push(note);
      });
      // console.log('column1')
      // console.log(column1);
      res.json(column1);
    })

  // console.log(posts);rs
  // res.json(posts);
});

// GET a specific post by id
app.get("/posts/:id", (req, res) => {
  // const post = posts.find((p) => p.id === parseInt(req.params.id));

  Note.findOne({ _id: mongoose.Types.ObjectId.createFromHexString(req.params.id) })
    .then(foundNote => {
      if (foundNote) {
        res.json(foundNote);
      } else {
        res.status(404).json({ message: "Post not found" });
      }
    })
    .catch(error => {
      console.log(error)
    });

});

// POST a new post
app.post("/posts", async (req, res) => {
  // const newId = lastId += 1;

  // Extract filename from the request body
  const imageFilename = req.body.image;
  const videoFilename = req.body.video;
  const note = new Note(
    {
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      image: imageFilename,
      video: videoFilename
    }
  );
  await note.save()
  console.log(note)


  res.status(201).json(note);
});

// PATCH a post when you just want to update one parameter
app.patch("/posts/:id", async (req, res) => {
  try {
    const foundNote = await Note.findOne({ _id: mongoose.Types.ObjectId.createFromHexString(req.params.id) });

    //  const imageFilename = req.body.image;
    const imageFilename = req.body.image;
    const videoFilename = req.body.video;

    const updatedNote = await Note.updateOne({ _id: mongoose.Types.ObjectId.createFromHexString(req.params.id) }, {
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      image: imageFilename,
      video: videoFilename
    });

    column1.push(updatedNote);
    // const updatedNote = await foundNote.save();

    res.json(updatedNote);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating post" });
  }

});

// DELETE a specific post by providing the post id
app.delete("/posts/:id", (req, res) => {

  Note.deleteOne({ _id: mongoose.Types.ObjectId.createFromHexString(req.params.id) })
    .then(res.json("successfully deleted"))
    .catch(error => {
      // console.log(error)
      res.status(500).json({ message: "Error deleting post" });

    });

});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
