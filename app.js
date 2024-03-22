require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require('md5')
const bcrypt = require('bcrypt')
const saltRounds = 10;
// const session = require('express-session');
// const passport = require('passport');//making session private
// const LocalStrategy = require('passport-local').Strategy;
// const passportLocalMongoose = require('passport-local-mongoose');//making session private
// const { create } = require('domain');

const app = express();


app
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
//   .use(session({
//     secret: 'our little secret.',
//     resave: false,
//     saveUninitialized: false
//     // cookie: { secure: true }
//   }))
//   .use(passport.initialize())
//   .use(passport.session())

mongoose.connect("mongodb://localhost:27017/userDB")
.then(()=>{console.log("mongoose connected")})
.catch((err)=>{console.log("could not connect to mongoose"+err)});



const userSchema = mongoose.Schema({
    username: String,
    password: String
});

// userSchema.plugin(encrypt, { secret: process.env.SECRETS, encryptedFields: ['password'] });

// userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("user", userSchema);


// passport.use(User.createStrategy());


// use static serialize and deserialize of model for passport session support
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


app.get('/',(req,res)=>{
    res.render('home');
})

app.route('/login')
.get((req,res)=>{
    res.render('login');
})
.post((req, res) => {
//     const { username, password } = req.body;

//     const user = new User({ username, password });

//     user.save()
//         .then(() => {
//             return new Promise((resolve, reject) => {
//                 req.login(user, (err) => {
//                     if (err) reject(err);
//                     resolve();
//                 });
//             });
//         })
//         .then(() => {
//             return new Promise((resolve, reject) => {
//                 passport.authenticate('local')(req, res, () => {
//                     res.redirect('/secrets');
//                     resolve();
//                 });
//             });
//         })
//         .catch((error) => {
//             console.error("Error registering user:", error);
//             res.status(500).send("Error registering user");
        // });













    // User.findOne({ username: username })
    //     .then((user) => {
    //         if (!user) {
    //             // If user is not found
    //             return res.status(404).send("User not found");
    //         } else {
    //             bcrypt.compare(password, user.password, (err, result)=> {
    //                 if (err) {
    //                     console.log(err);
    //                     return res.status(500).send("Error comparing passwords");
    //                 }
    //                 if (result) {
    //                     // If passwords match
    //                     res.render('secrets');
    //                 } else {
    //                     // If passwords do not match
    //                     return res.status(401).send("Incorrect password");
    //                 }
    //             });
    //         }
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //         res.status(500).send("Error finding user");
    //     });
});


app.route('/register')
.get((req,res)=>{
    res.render('register');
})
.post((req, res) => {

    // User.register({username:req.body.username}, req.body.password,(err, user) => {
    //     if (err) {
    //         console.log(err);
    //         res.redirect('/register');
    //     }
    //     passport.authenticate('local')(req, res, () => {
    //         res.redirect('/secrets');
    //     });
    // });



    bcrypt.hash(req.body.password, saltRounds)
    .then((hash) => {
        // Store hash in your password DB.
        const newUser = new User({
            username: req.body.username,
            password: hash
        });
        // console.log("we got: \n"+newUser)
        newUser.save().then((x)=>{console.log("we got\n"+x);})
            // .then((user) => {
            //     console.log("so it was\n"+user);
            //     res.render('secrets');
            // })
            // .catch((error) => {
            //     console.log(error);
            //     res.status(500).send("Error saving user");
            // });
    })
    // .catch((error) => {
    //     console.log(error);
    //     res.status(500).send("Error hashing password");
    // });


});




// app.route('/secrets')
    // .get((req,res)=>{
        // if (req.isAuthenticated()){
            // res.render('secrets');
        // } else{
            // res.redirect('/login');
        // }
    // })


    app.get('/logout', (req, res) => {
        req.logout((err) => {
            if (err) {
                console.error("Error logging out:", err);
                res.status(500).send("Error logging out");
            } else {
                res.redirect('/');
            }
        });
    });
    

app.listen(3000,(req,res)=>{
    console.log("server is running on port 3000");
})