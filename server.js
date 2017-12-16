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
          //{     challanged: id,
          //      challanger: id",
          //      status: "accept" }
          var chaler = data.challanger;
          var chaled = data.challanged;

          // challenge will receive only challanged User
          var challengedUserChanel = "receiveChallange" + chaled;

          switch (data.status) {
            case "invite":
              io.emit(challengedUserChanel, {
                first_name: usersOnline[chaler].first_name,
                last_name: usersOnline[chaler].last_name,
                id: usersOnline[chaler].id,
                invite: true
              });
              break;
            case "decline":
              io.emit(challengedUserChanel, "declined");
              break;
            case "accept":
              // after accepting challange we creating game ID
              var gameId = chaled + chaler;
              // creating level with this ID
              challenges[gameId] = {}
              // in this level each player has own set of data
              challenges[gameId][chaled] = {
                hp: 100,
                left: 5,
                top: 5,
                opponentId: chaler
              }
              challenges[gameId][chaler] = {
                hp: 100,
                left: 5,
                top: 5,
                opponentId: chaled
              }
              // each user has link to it's game level
              usersOnline[chaled].challange = challenges[gameId];
              usersOnline[chaler].challange = challenges[gameId];
              io.emit(challengedUserChanel, "accept");
              break;
            default:
              console.log("data.status = " + data.status);
          }
        });

        //---------------------
        // ACTUALLY GAME SOCKETS
        //---------------------
        socket.on('gameCoordinateChange', function(data){
          var id = data.id;
          var left = data.left;
          var top = data.top;
          var opponentId = usersOnline[id].challange[id].opponentId;
          var fightChannelId = "fightChannelId" + opponentId;

          io.emit(fightChannelId, {
            left: left,
            top: top,
          });



        });


})
