var express = require('express'),
    path = require('path'),
    User = require('./models/user.js'),
    Routes = require('./routes/routes.js'),
    passport = require('passport'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    LocalStrategy = require('passport-local').Strategy;

// set up the local authentication strategy for NodeJack
passport.use(new LocalStrategy(
  function(username, password, done){
    User.login(username,password,function(errs,user){
      if(errs.length > 0){
        done(errs);
        return;
      }
      if(!user  || !user._id || !user.username){
        done(null,false,{message: "Incorrect Username"});
        return;
      }
      done(null, user);
      return;
    }); // end user.login
  }) // end localStrat function
); // end use localStrategy

var app = express();

var options = {
  key: fs.readFileSync('/etc/nginx/ssl/server.key'),
  cert: fs.readFileSync('/etc/nginx/ssl/server.crt')
};

// global app configurations.  
app.configure(function(){
  // set up cookies and sessions with stuff
  app.use(express.cookieParser()); 
  app.use(express.session({secret: 'secret key'})); 

  // If insecure connection, redirect to https connection, else run normal
  app.use(function(req,res,next){
    if(!req.secure){
      // replace http port with https port
      var newhost = req.get('Host').replace(/8888/,"8889");
      return res.redirect(['https://', newhost, req.url].join(''));
    }
    next();
  });

  // set up the views in the views folder and rending with EJS
  app.set('views',__dirname,'/views'); 
  app.set('view engine','ejs'); 
  app.use(express.logger('tiny')); 
  app.use(express.bodyParser()); // reading params from post requests

  // set up passport for login/logout functionality
  app.use(passport.initialize());
  app.use(passport.session());

  // static files belong in public folder
  app.use(express.static(path.join(__dirname,'public')));
  app.use(app.router); // all else dynamically routed
});


app.get('/', Routes.index);
app.get('/play',Routes.play);

// login skeleton
app.get('/login',Routes.login);
app.post('/login',Routes.auth);

// logout skeleton
app.get('/logout',Routes.logout);
app.post('/logout',Routes.logout);


app.get('/register',Routes.register);
app.post('/register',Routes.newUser);

//http.createServer(options,app).listen(8888); // http server
app.listen(8888);
https.createServer(options,app).listen(8889); // https server
