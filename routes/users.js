const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const uri = 'mongodb://localhost:27017/inspire';

mongoose.connect(uri)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
    });

const userSchema = new mongoose.Schema({
    username: String,
    fullname: String,
    email: String,
    password: String,
    profileImage: String,
    contact: Number,
    boards: {
        type: Array,
        default: []
    },
    posts:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post"
        }
    ]
});


// Define your user-related routes here using router

module.exports = mongoose.model("user", userSchema);
