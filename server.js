var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
// var SessionSockets = require('session.socket.io');
// sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

var app = express();

app.use(express.static(path.join(__dirname + "/client/static")));
app.set('views', path.join(__dirname, './client/views'));
app.use(session({secret: 'S5od42iH-n_gd3jor(2JOcK8s'}));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

// require the mongoose configuration file which does the rest for us
require('./server/config/mongoose.js');

// store the function in a variable
var routes_setter = require('./server/config/routes.js');
// invoke the function stored in routes_setter and pass it the "app" variable
routes_setter(app);

var server = app.listen(7578, function(){
  console.log("listening on port http://54.67.124.107:7578/shooter");
  console.log("listening on port http://localhost:7578/shooter");
})

// /////////////////////
//    SOCKETS       ////
// /////////////////////

var usersOnline = {};
    //  { first_name: ,
    //    last_name: ,
    //    id: ,
    //    challenge: "none" - link to the challange  }
var challenges = {};
    // id_userOne + id_userTwo: {
    //    id_userOne: {

    //    },
    //    id_userTwo: {

    //    }
    // }
var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){

  //---------------------
  // ACTUALLY GAME SOCKETS
  //---------------------

        socket.on("game", function(id, data) {
          io.broadcast.to(id).emit('my message', msg);

        })


    // -----------------------------------------------------
    // GENERAL CHANNEL TO CATCH ALL dashboard page refreshes
    // -----------------------------------------------------
        socket.on("refresh_dashboard_fe", function( data) {

          usersOnline[data.id] = {
            first_name: data.first_name,
            last_name: data.last_name,
            id: data.id,
            challenge: "none"
          }
          // responding to individual user
          // var channelName = "refresh_dashboard_be" + data.userId;
          // console.log("channel name issued: " + channelName)
          // io.emit(channelName, {
          //   message: "data from server"
          // })
          io.emit('broadcast_all', usersOnline);
        })

    //  WHEN USER LEAVE THE PAGE
        socket.on('leave_page', function(data){
          delete usersOnline[data];
          console.log("user leaves page")
          io.emit('broadcast_all', usersOnline);
        });

    // WHEN USER SENDS CHALLENGE
        socket.on('challange', function(data){
          // challenge will receive only challanged User
          var challengedUserChanel = "receiveChallange" + data.challanged;

          switch (data.status) {
            case "invite":
              io.emit(challengedUserChanel, {
                first_name: usersOnline[data.challanger].first_name,
                last_name: usersOnline[data.challanger].last_name,
                id: usersOnline[data.challanger].id,
                invite: true
              });
              break;
            case "decline":
              io.emit(challengedUserChanel, "declined");
              break;
            case "accept":
              io.emit(challengedUserChanel, "accept");
              break;
            default:
              console.log("data.status = " + data.status);
          }
        });


})
