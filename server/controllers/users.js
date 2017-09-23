var mongoose = require('mongoose');
var User = mongoose.model('User');
var bcrypt = require('bcryptjs');

var idCount = 0;
var users = {};
var chatLog = ""

module.exports = {

// FRONT pagee
  fpage: function(req, res){
    console.log("index route");
    res.render('index');
  },

// ACTUALLY GAME
  shooter: function(req, res){
    var needUser = false;
      if(!req.session.userId) {
         needUser = true;
      }

      res.render('game',{
        needUser: needUser,
        request: req,
        users: users
      })
  },

  postUser: function(request, response){
    request.session.userId = ++idCount
    users[request.session.userId] = {
      name: request.body.name,
      id: request.session.userId
    }
    console.log(`user ${users[request.session.userId].name} was created, his id is ${request.session.userId}`)
    response.redirect('/shooter')
  },


/////////////////////////////////
/// LOGIN AND REGISTRATION /////
/////////////////////////////////

  show: function(req, res){
    // DELETE ALL USERS
    // User.remove({},function(err, data){
    //   if(err){ console.log("can't DELETE") }
    // })
    // DELETE ALL USERS
    User.find({}, function(err, data){
      if(err){

      }
      res.render('board',{context: data})
    })
  },

  register: function(req, res){
    if(req.body.password != req.body.confirm_password) {
      res.render('index',{context:"",message:"Password field doesn't match"})
    } else {
      // password and re password match
          var user = new User({
            email: req.body.email,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            password: req.body.password,
            birthday: req.body.birthday
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
              res.render('login', {title: titleMsg, errors: user.errors, context: ""})
            } else {
              res.redirect('/')
            }

          })
          // password and re password match
    }
  },

  login: function(req, res){
    User.find({email: req.body.email}, function(err, data){
      if(err){
          console.log("error occured while querying login");
      } else {
          if(data.length == 0) {
            var message = "NOPE, you are not in our database";
            if(!req.body.email){ message = ''; }
            res.render('login',{context:"",style:"error",message:message})
          } else {
            if( this.passwordCheck(req.body.password, data[0].password) ) {
              res.render('login',{style:"success",message:"Congrats! You are successfully logined!"})
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

  // EXIT
    exit: function(req, res){
      req.session.destroy()
      res.redirect('/')
    }

///////////////////////////////////////
/// END OF LOGIN AND REGISTRATION /////
///////////////////////////////////////
}
