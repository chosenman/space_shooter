var users = require('../controllers/users.js');

module.exports = function(app) {

  // index pagee
  app.get('/',function(request, response){
    users.fpage(request, response)
  })

  // login pagee
  app.get('/login',function(request, response){
    users.login(request, response)
  })

  // Shooter route
  app.get("/shooter", function(request, response){
    users.shooter(request, response)
  })

  // create User
  app.post("/addUser", function(request, response){
    users.postUser(request, response)
  })

  // exit shooter
  app.get("/exit", function(request, response){
    users.exit(request, response)
  })

}
