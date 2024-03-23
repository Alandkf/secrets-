
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findOrCreate");

const app = express();


app
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(express.static(path.join(__dirname, "public")))
  .set("view engine", "ejs")
  .set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: process.env.CLIENT_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true }
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect("mongodb://localhost:27017/userDB")
  .then(() => {
    console.log("mongoose connected");
  })
  .catch((err) => {
    console.log("could not connect to mongoose" + err);
  });

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  secret: String,
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


userSchema.plugin(encrypt, { secret: process.env.SECRETS, encryptedFields: ['password'] });


const User = mongoose.model("user", userSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
    },
    function (accessToken, refreshToken, profile, cb) {
      try {
        console.log(profile);
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
          if (err) {
            console.error("Error finding or creating user:", err);
            return cb(err, null);
          }
          return cb(null, user);
        });
      } catch (error) {
        console.error("Unexpected error:", error);
        return cb(error, null);
      }
    }
  )
);

app.route("/").get((req, res) => {
  res.render("home");
});

app.route("/login").get((req, res) => {
  res.render("login");
}).post((req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("secrets");
      });
    }
  });
});

app.route("/register").get((req, res) => {
  res.render("register");
}).post((req, res) => {
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

app.get("/secrets", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const usersWithSecrets = await User.find({ secret: { $ne: null } }).exec();
      res.render("secrets", { usersWithSecrets: usersWithSecrets });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error finding users with secrets:", error);
    res.status(500).send("Internal Server Error");
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

app.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/secrets");
  }
);

app.get("/submit", (req, res) => {
  res.render("submit");
});

app.post("/submit", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  const submittedSecret = req.body.secret;
  
  User.findById(req.user.id)
    .then(foundUser => {
      if (!foundUser) {
        return res.status(404).send("User not found");
      }

      foundUser.secret = submittedSecret;
      return foundUser.save();
    })
    .then(() => {
      console.log("Secret saved successfully");
      res.redirect("/secrets");
    })
    .catch(err => {
      console.error("Error finding or saving user:", err);
      res.status(500).send("Internal Server Error");
    });
});

app.listen(3000, (req, res) => {
  console.log("server is running on port 3000");
});