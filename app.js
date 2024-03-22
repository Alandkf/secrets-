require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require("mongoose");
// pachage we need for encrypt level 2:
const encrypt = require("mongoose-encryption");

// package we need for hash level 3
const md5 = require('md5');

// pachage we need for salting hash level 4
const bcrypt = require('bcrypt');
const saltRounds = 10;

// packages we need for cookies and session lvl 5
// npm i passport passport-local passport-local-mongoose express-session
const session = require('express-session');
const passport = require('passport');//making session private
// const LocalStrategy = require('passport-local').Strategy; // we don't need it
const passportLocalMongoose = require('passport-local-mongoose');//making session private

const app = express();

app
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(express.static(path.join(__dirname, 'public')))
  .set('view engine', 'ejs')
  .set('views', path.join(__dirname, 'views'));

  app.use(session({
      secret: process.env.SECRETS,
      resave: false,
      saveUninitialized: false
      // cookie: { secure: true }
    }));

    app.use(passport.initialize());
    app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB")
.then(()=>{console.log("mongoose connected")})
.catch((err)=>{console.log("could not connect to mongoose"+err)});
// mongoose.set("useCreateIndex",true) // we don't need this anymore lvl 5

const userSchema = mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose)

// encrypt level 1:
// const secret = process.env.SECRETS
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = mongoose.model("user", userSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(
    (id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err, null);
        });
});



app.route('/')
.get((req,res)=>{
    res.render('home');
})

app.route('/login')
.get((req,res)=>{
    res.render('login');
})
.post((req,res)=>{

    const user = new User({
        username : req.body.username,
        password : req.body.password
    });

    req.login(user, (err)=>{
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate('local')(req, res , 
            (req,ress)=>{
                res.redirect('secrets');
            });

        }
    })

})

app.route('/register')

.get((req,res)=>{
    res.render('register');
})


.post( (req, res) => {

      User.register({ username: req.body.username }, req.body.password)
        .then((user) => {
          passport.authenticate("local")(req, res, () => {
            res.redirect("secrets");
          });
        })
        .catch((err) => {
          console.log("Error: " + err);
          res.redirect("/register");
        });
  });
      app.get("/secrets", (req, res) => {
        if (req.isAuthenticated()) {
          res.render("secrets");
        } else {
          res.redirect("/login");
        }
      });


      app.get("/logout", (req, res) => {
        req.logout((err) => {
            if (err) {
                console.error("Error logging out:", err);
                return res.redirect("/"); // Redirect even if there's an error
            }
            res.redirect("/");
        });
    });
    

      


app.listen(3000,(req,res)=>{
    console.log("server is running on port 3000");
})