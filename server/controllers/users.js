var mongoose = require('mongoose');
var User = mongoose.model('User');

var idCount = 0;
var users = {};
var chatLog = ""

module.exports = {

  shooter: function(req, res){
    var needUser = false;
      if(!req.session.userId) {
         needUser = true;
      }

      res.render('index',{
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

  exit: function(req, res){
    req.session.destroy()
    res.redirect('/shooter')
  }

}
