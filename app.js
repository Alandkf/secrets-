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
const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');//making session private

const app = express();

app
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(express.static(path.join(__dirname, 'public')))
  .set('view engine', 'ejs')
  .set('views', path.join(__dirname, 'views'));



mongoose.connect("mongodb://localhost:27017/userDB")
.then(()=>{console.log("mongoose connected")})
.catch((err)=>{console.log("could not connect to mongoose"+err)});

const userSchema = mongoose.Schema({
    username: String,
    password: String
});

// encrypt level 1:
// const secret = process.env.SECRETS
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = mongoose.model("user", userSchema);

app.route('/')
.get((req,res)=>{
    res.render('home');
})

app.route('/login')
.get((req,res)=>{
    res.render('login');
})
.post((req,res)=>{

})

app.route('/register')

.get((req,res)=>{
    res.render('register');
})
.post((req,res)=>{

    })

app.listen(3000,(req,res)=>{
    console.log("server is running on port 3000");
})