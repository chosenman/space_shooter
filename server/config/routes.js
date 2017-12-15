var users = require('../controllers/users.js');

module.exports = function(app) {

  //------------
  // PAGES
  //------------

    // INDEX PAGE
      app.get('/',function(request, response){
        users.fpage(request, response)
      })

    // DASHBOARD
      app.get('/dashboard',function(request, response){
        users.dashboard(request, response)
      })

    // SHOOTER GAMEPLAY
      app.get("/shooter", function(request, response){
        users.shooter(request, response)
      })


  //------------
  // AUTHENTICATION
  //------------
        // app.get('/login',function(request, response){
        //   users.login(request, response)
        // })

        app.post("/register", function(req, res){
          users.register(req, res)
        })

        app.post("/login", function(request, response){
          users.login(request, response)
        })


  //------------
  // EXIT
  //------------
        app.get("/exit", function(request, response){
          users.exit(request, response)
        })

}
