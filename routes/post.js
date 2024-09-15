const mongoose = require('mongoose');

// const router = express.Router();

// const uri = 'mongodb://localhost:27017/inspire';

// mongoose.connect(uri)
//     .then(() => {
//         console.log('Connected to MongoDB');
//     })
//     .catch((err) => {
//         console.error('Error connecting to MongoDB:', err.message);
//     });

const postSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    title: String,
    description: String,
    image: String,
    password: String
});

module.exports = mongoose.model("post", postSchema);
