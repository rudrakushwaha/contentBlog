// import express from "express";
// import bodyParser from "body-parser";
// import axios from "axios";

const bodyParser = require("body-parser")
const express = require("express")
const axios = require("axios")
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const util = require('util'); // Add this line




const app = express();

//cors policy
const cors = require('cors');
const corsOptions ={
  origin: '*', 
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// const port = 3000;
const PORT = process.env.PORT || 3000;
const API_URL =  "https://blogapi-g41r.onrender.com" || "http://localhost:4000";

// const API_URL = "http://localhost:4000";

// app.use(express.static("public"));
//SERVING STATIC FILES
app.use( express.static(path.join(__dirname, 'public')));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      if (file.fieldname === 'image') {
        cb(null, 'public/images');
      } else if (file.fieldname === 'media') {
        cb(null, 'public/videos');
      }
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
});


// Route to render the main page
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts`);
    // console.log(response);
    res.render("index.ejs", { posts: response.data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Route to render the edit page
app.get("/new", (req, res) => {
  res.render("modify.ejs", { heading: "New Post", submit: "Create Post" });
});

app.get("/edit/:id", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${req.params.id}`);
    console.log(response.data);
    res.render("modify.ejs", {
      heading: "Edit Post",
      submit: "Update Post",
      post: response.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
});

// Route to handle post creation
app.post("/api/posts", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'media', maxCount: 1 }]), async (req, res) => {
  try {
    const imageFilename = req.files['image'] ? req.files['image'][0].filename : null;
    const videoFilename = req.files['media'] ? req.files['media'][0].filename : null;


    
    // Create the data object to be sent to the solution.js API
    const postData = {
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      image: imageFilename,
      video: videoFilename
    };

    const response = await axios.post(`${API_URL}/posts`, postData);

    console.log(response.data);
    // Redirect or send a response as needed
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating post' });
  }
});     
// Partially update a post
app.post("/api/posts/:id", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'media', maxCount: 1 }]), async (req, res) => {
  console.log("called");
  try {
    const imageFilename = req.files['image'] ? req.files['image'][0].filename : null;
    const videoFilename = req.files['media'] ? req.files['media'][0].filename : null;


    // Include the filename in the request body
    const postData = {
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      image: imageFilename,
      video: videoFilename
     
    };


    const response = await axios.patch(
      `${API_URL}/posts/${req.params.id}`,
      postData
    );

    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error updating post" });
  }
});

// Delete a post
app.get("/api/posts/delete/:id", async (req, res) => {
  try {
    await axios.delete(`${API_URL}/posts/${req.params.id}`);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
