const express = require('express');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const postModel = require("./post")
const path = require('path');
const userModel = require("./users");
const upload = require('./multer');

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(express.static(path.join(__dirname, 'public')));
router.use(cookieParser());

function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, "shhhhhhhh");
            req.user = decoded;
            return next();
        } catch (err) {
            return res.redirect("/login");
        }
    } else {
        return res.redirect("/login");
    }
}

router.get('/', (req, res) => {
    res.render('index',{nav:false}); 
});

router.get('/register', (req, res) => {
    res.render('register', {nav:false});
});

router.get('/profile', isLoggedIn, async (req, res) => {
    const user = 
    await userModel
        .findOne({ email: req.user.email })
        .populate("posts");
    if (!user) return res.redirect('/login');
    res.render('profile', { user, nav:true}); 
});
router.get('/show/posts', isLoggedIn, async (req, res) => {
    const user = 
    await userModel
        .findOne({ email: req.user.email })
        .populate("posts");
    if (!user) return res.redirect('/login');
    res.render('show', { user, nav:true}); 
});
router.get('/feed', isLoggedIn, async (req, res) => {
    const user = 
    await userModel
        .findOne({ email: req.user.email })
    if (!user) return res.redirect('/login');
    const posts = await postModel.find().populate("user")
    res.render('feed', { user, posts, nav:true}); 
});

router.get('/add', isLoggedIn, async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.redirect('/login');
    res.render('add', { user, nav:true}); 
});

router.post('/createpost', isLoggedIn, upload.single("postimage"), async (req, res) => {
    console.log(req.body); 
    console.log(req.file); 
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.redirect('/login');
    const post = await postModel.create({
        user: user._id,
        title: req.body.title,
        description: req.body.description,
        image: req.file.filename
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile"); 
});


router.post('/fileupload', isLoggedIn, upload.single("image"), async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.redirect('/login');

    user.profileImage = req.file.filename;
    await user.save();

    res.redirect('/profile'); 
});

router.post('/profile', (req, res) => {
    let { username, fullname, email, password, contact } = req.body;
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            try {
                let createdUser = await userModel.create({
                    username,
                    fullname,
                    email,
                    password: hash,
                    contact
                });
                let token = jwt.sign({ email: createdUser.email }, "shhhhhhhh");
                res.cookie("token", token);
                res.render('profile', { user: createdUser, nav: true });  // Pass createdUser and nav here
            } catch (err) {
                // Handle error
            }
        });
    });
});

router.post('/register', (req, res) => {
    // Implement registration logic
    res.render('register', { nav: false });  
});

router.get("/login", (req, res) => {
    res.render('login', { nav: false });  
});

router.post("/login", async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) return res.send("Something went wrong!");

    bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (result) {
            let token = jwt.sign({ email: user.email }, "shhhhhhhh");
            res.cookie("token", token);
            res.redirect('/profile'); 
        } else {
            res.send("Oops! Something went wrong :(");
        }
    });
});

router.get("/logout", (req, res) => {
    res.cookie("token", "");
    res.redirect("/");
});

module.exports = router;
