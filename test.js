User.find({"secret":{$ne:null}}((err,foundUsers)=>{
    if (err) {
      console.log(err);
    } else{
      if(foundUsers){
        res.render("secrets",{ userWithSecrets: foundUsers})
      } 
    }
  })) 





  app.post("/submit", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }
  
    const submittedSecret = req.body.secret;
    
    User.findById(req.user.id,(err,foundUser) => {
      if (err) {
        console.error("Error finding user:", err);
        return res.status(500).send("Internal Server Error");
      } else{
          if (foundUser) {
            foundUser.secret = submittedSecret;
            foundUser.save((err) => {
                console.log("Secret saved successfully");
                res.redirect("/secrets");
            });
          }
    }
  })
  });