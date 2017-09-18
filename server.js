var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
// var SessionSockets = require('session.socket.io');
// sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

var app = express();

app.use(express.static(path.join(__dirname + "/client/static")));
app.set('views', path.join(__dirname, './client/views'));
app.use(session({secret: 'S5od42iHngd3jor2JOck8s'}));
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
var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){
  console.log('We are using sockets')
  console.log(socket.id)


  // ALL CHAT LOGIC
    socket.on("msg_sent", function(data) {
      console.log(`into chatLog was added new line: ${users[data.userId].name}: ${data.msg}`);

      chatLog += `<b>${users[data.userId].name}</b>: ${data.msg}<br/>`
      io.emit("update_chat", {
        chatLog: chatLog
      })
    })

    socket.on("page_refresh", function(data) {
      io.emit("update_chat", {
        chatLog: chatLog
      })
    })
  // ALL CHAT LOGIC


})
