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
            challenge: "none",
            window_x: data.window_x,
            window_y: data.window_y
          }

          io.emit('broadcast_all', usersOnline);
        })

    //  WHEN USER LEAVE THE PAGE
        socket.on('leave_page', function(data){
          // delete usersOnline[data];
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

          var chaler_x = usersOnline[chaler].window_x;
          var chaler_y = usersOnline[chaler].window_y;

          var chaled_x = usersOnline[chaled].window_x;
          var chaled_y = usersOnline[chaled].window_y;

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

              // making coefficients
              if( chaler_x >= chaled_x ) {
                usersOnline[chaled].kX = (chaler_x/chaled_x).toFixed(6);
                usersOnline[chaler].kX = (1/usersOnline[chaled].kX).toFixed(6);
              }
              else if( chaled_x > chaler_x ){
                usersOnline[chaler].kX = (chaled_x/chaler_x).toFixed(6);
                usersOnline[chaled].kX = (1/usersOnline[chaler].kX).toFixed(6);
              }

              if( chaler_y >= chaled_y ) {
                usersOnline[chaled].kY = (chaler_y/chaled_y).toFixed(6);
                usersOnline[chaler].kY = (1/usersOnline[chaled].kY).toFixed(6);
              }
              else if( chaled_y > chaler_y ){
                usersOnline[chaler].kY = (chaled_y/chaler_y).toFixed(6);
                usersOnline[chaled].kY = (1/usersOnline[chaler].kY).toFixed(6);
              }

              challenges[gameId][chaled] = {
                hp: 30,
                left: 5,
                first_name: usersOnline[chaled].first_name,
                last_name: usersOnline[chaled].last_name,
                top: 5,
                color: "blue",
                opponentId: chaler
              }
              challenges[gameId][chaler] = {
                hp: 30,
                left: 5,
                first_name: usersOnline[chaler].first_name,
                last_name: usersOnline[chaler].last_name,
                top: 5,
                color: "red",
                opponentId: chaled
              }
              // each user has link to it's game level
              usersOnline[chaled].challenge = challenges[gameId];
              usersOnline[chaler].challenge = challenges[gameId];
              console.log("-----USERS OBJECTS");
              console.dir(usersOnline);
              console.log("-----Challanges OBJECT");
              console.dir(challenges);
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
          var left, opponentId, fightChannelId, opponent, fightChannelId_2;

          var myShipInBattle = usersOnline[id].challenge[id];
          var enemyId = myShipInBattle.opponentId;

          var updatedOpponents = {}

          updatedOpponents[id] = myShipInBattle;
          updatedOpponents[enemyId] = usersOnline[enemyId].challenge[enemyId];

          // console.log("data --- check:")
          // console.dir(data);
          // console.log("-----USERS OBJECTS");
          // console.dir(usersOnline);

          if(usersOnline[id]!=undefined){
            opponent = usersOnline[id];
            opponentId = usersOnline[id].challenge[id];

            left = Math.round( data.left*opponent.kX );
            fightChannelId = "fightChannelId" + opponentId.opponentId;
            fightChannelId_2 = "fightChannelId" + id;

            opponentId.left = left;

            console.log("opponentId --- check:")
            console.dir(usersOnline[id].challenge);

            io.emit(fightChannelId, {
              left: left
            });
          }

          // FIRST UPDATE
          if(usersOnline[id]!=undefined && data.firstUpdate){

            updatedOpponents.firstUpd = true;

            io.emit(fightChannelId_2, updatedOpponents);

            updatedOpponents.left = data.left;
            io.emit(fightChannelId, updatedOpponents);

            updatedOpponents.firstUpd = false;
          }

          // TRANSFERING SHOOTED BULLET
          if(usersOnline[id]!=undefined && data.shoot){
            io.emit(fightChannelId, {
              shoot: true,
              leftBulletCoordinate: left+12,
              kY: opponent.kY
            });
          }

          // UPDATING HEALTH OF USERS
          if(usersOnline[id]!=undefined && data.hit){

            myShipInBattle.hp--;
            updatedOpponents.hit = true;

            updatedOpponents[id] = myShipInBattle;
            updatedOpponents[enemyId] = usersOnline[enemyId].challenge[enemyId];
            // sending updated health
             io.emit(fightChannelId, updatedOpponents);
             io.emit(fightChannelId_2, updatedOpponents);
             updatedOpponents.hit = false;
          }


        });


})
