var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var User = mongoose.model('User');
var bcrypt = require('bcryptjs');
var session = require('express-session');

var usersOnline = {};

module.exports = {

// ----------------------
//          PAGES
// ----------------------

// FRONT pagee
  fpage: function(req, res){
    console.log("index route");

    // if user is logged in redirect him to dashboard
    if(req.session.isLoggedIn){
      res.redirect("/dashboard");
    } else {
      res.render('login');
    }

  },

  dashboard: function(req, res){
    // DELETE ALL USERS
    // User.remove({},function(err, data){
    //   if(err){ console.log("can't DELETE") }
    // })
    // DELETE ALL USERS
    if(!req.session.isLoggedIn){
      res.redirect("/");
    } else {

      User.find({}, function(err, data){
        if(err){

        }

        res.render('dashboard',{
          user: req.session.user,
          allUsers: data,
          usersOnline: usersOnline
        })
      })

    }
  },

// ACTUALLY GAME
  shooter: function(req, res){

    if(!req.session.isLoggedIn){
      res.redirect("/");
    } else {

        res.render('game',{
          user: req.session.user
        })
      }

  },



// ----------------------=------
/// LOGIN AND REGISTRATION /////
// -----------------------------



  register: function(req, res){
    if(req.body.password != req.body.confirm_password) {
      res.render('login',{context:"",message:"Password field doesn't match", style: "error"})
    } else {
      // password and re password match
          var user = new User({
            email: req.body.email,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            password: req.body.password
            // birthday: req.body.birthday
          })
          console.log(req.body);
          user.save(function(err){
            if(err){
              console.log("***** *************************");
              console.log("Registration has error: " + err);
              console.log("***** *************************");
                if(err.code == 11000) {
                  var titleMsg = "Your email is already registered"
                } else {
                  var titleMsg = "Error occured!"
                }
                res.render('login', {title: titleMsg, errors: user.errors, context: "", style: "error"})
            } else {
              // here is cookie recording
              req.session.isLoggedIn = true;
              User.findOne({email:req.body.email}).exec(function(err,data){
                if(err){
                  console.log("--->" + "error on after register findone")
                }else {
                  req.session.user = {
                    email: data.email,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    id: data._id.toString(),
                    won: data.won,
                    lost: data.lost,
                    draw: data.draw
                  }

                  // usersOnline[data._id] = {
                  //   email: data.email,
                  //   first_name: data.first_name,
                  //   last_name: data.last_name,
                  //   id: data._id.toString(),
                  //   won: data.won,
                  //   lost: data.lost,
                  //   draw: data.draw
                  // }

                  res.redirect('/');
                }
              })
              //

            }

          })
          // password and re password match
    }
  },

  // -----------------------
  //      LOGIN
  // -----------------------
  login: function(req, res){
    User.findOne({email: req.body.email}).exec(function(err, data){
      if(err){
          console.log("error occured while querying login");
      } else {
          if(data == null) {
            var message = "NOPE, you are not in our database";
            if(!req.body.email){ message = ''; }
            // show

                res.render('login',{ style:"error",message:message})

            // show
            //res.render('login',{context:"",style:"error",message:message})
          } else {
            if( this.passwordCheck(req.body.password, data.password) ) {
              // SUCCESSFULL LOGIN
                  req.session.isLoggedIn = true;
                  req.session.user = {
                    email: req.body.email,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    id: data._id.toString(),
                    won: data.won,
                    lost: data.lost,
                    draw: data.draw
                  }

                  // usersOnline[data._id] = {
                  //   email: data.email,
                  //   first_name: data.first_name,
                  //   last_name: data.last_name,
                  //   id: data._id.toString(),
                  //   won: data.won,
                  //   lost: data.lost,
                  //   draw: data.draw
                  // }
                  console.log("/".repeat(40));
                  console.dir(usersOnline);
                  console.log("/".repeat(40));
                  res.redirect('/');
            } else {
              res.render('login',{style:"error",message:"Entered password doesn't match with password in data base"})
            }
          }
      }

    })
    passwordCheck =  function(pwFform, pFdataBase){
      if(bcrypt.compareSync(pwFform, pFdataBase)) {
        return true
      } else {
        return false
      }
    }

  },

  //------------------
  //       EXIT
  //------------------
    exit: function(req, res){
      if(req.session.user != undefined){
        console.dir("====== user exited:");
        console.dir(usersOnline[req.session.user.id]);
        console.dir("===================");
        delete usersOnline[req.session.user.id];
      }
      req.session.destroy()
      res.redirect('/')
    },

///////////////////////////////////////
/// END OF LOGIN AND REGISTRATION /////
///////////////////////////////////////

//--------------------------------
//       SOCKET LOGIC DESCRIPTION
//--------------------------------
  winnerUpdate: function(u_id){
    console.log("winner update: " + u_id);

    var o_id = new ObjectID(u_id);
    User.findOne({ _id: o_id })
      .exec(function(err,data){
        if(err){
          console.log("====>>>>> error occured on winnerUpdate users/controller = 1")
        }else{
          var user = data;
          user.won++;
          user.save(function(err){
            if(err){
              console.log("====>>>>> error occured on winnerUpdate users/controller = 2")
            } else {
              return true;
            }
          })
        }
      })
  },

  looserUpdate: function(u_id){
    console.log("looser update: " + u_id);

    var o_id = new ObjectID(u_id);
    User.findOne({ _id: o_id })
      .exec(function(err,data){
        if(err){
          console.log("====>>>>> error occured on looserUpdate users/controller = 1")
        }else{
          var user = data;
          user.lost++;
          user.save(function(err){
            if(err){
              console.log("====>>>>> error occured on looserUpdate users/controller = 2")
            } else {
              return true;
            }
          })
        }
      })
  }




}
