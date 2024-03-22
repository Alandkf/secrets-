require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require("mongoose");
// pachage we need
const encrypt = require("mongoose-encryption");

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


const secret = process.env.SECRETS

userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

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
    const username = req.body.username;
    const password = req.body.password;
    console.log(username+"\n"+password);
    User.findOne({username: username})
  .then((user)=>{
    if(!user){res.redirect('login')}
    else{
        if(password==user.password){res.render('secrets');}
        else{res.redirect('login')}
    }
})
  .catch((err)=>console.log(err+"not in"));
})

app.route('/register')
.get((req,res)=>{
    res.render('register');
})
.post((req,res)=>{
    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    });
    newUser.save()
    .then((user)=>{
        console.log(user)
        res.render('secrets')})
    .catch((error)=> {console.log(error);})
    })

app.route('/secrets')
    .get((req,res)=>{
        res.render('secrets');
    })

app.listen(3000,(req,res)=>{
    console.log("server is running on port 3000");
})