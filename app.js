var express = require('express'),
    path = require('path'),
    User = require('./models/user.js'),
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


app.get('/', function(req,res){
  if(typeof(req.session) != "undefined"){
    user = req.session.user;
    res.render('views/index',{user:user});
    return;
  }
  res.render('views/index',{});
});

app.get('/play',function(req,res){
  if(typeof(req.session) != "undefined"){
    user = req.session.user;
    res.render('views/play',{user:user});
    return;
  }
  res.render('views/play',{});
});

// login skeleton
app.get('/login',function(req,res){
  if(typeof(req.session) != 'undefined'){
    user = req.session.user
    res.render('views/login',{user:user});
    return;
  }
  res.render('views/login',{});
});

app.post('/login',function(req,res){
  var username = req.body.user.name;
  var password = req.body.user.password;

  User.login(username,password, function(user){
    // return errors
    if(user instanceof Array){
      res.render('views/login',{errors:user});
      return;
    }
    req.session.user = user;
    res.redirect('');
    return;
  });
});

// logout skeleton
app.post('/logout',function(req,res){
  // destroy the session
  delete req.session.user;
  // redirect to home
  res.redirect('https://floodric.com:8889/');
});


app.get('/register',function(req,res){
  if(typeof(req.session) != "undefined"){
    user = req.session.user;
    res.render('views/register',{user:user});
  }
  res.render('views/register',{});
});

app.post('/register',function(req,res){
  // combine all the info into a user object
  var user = {};
  user.username = req.body.user.username;
  user.password = req.body.user.password;
  user.passwordconf = req.body.user.passwordconf;
  user.email = req.body.user.email;
  console.log(JSON.stringify(user));

  // now send to the user model to ensure that it all works
  User.register(user,function(err,userdb){
    console.log(JSON.stringify(userdb));
    if(userdb instanceof Array){
      res.render('views/register',{errors:err});
      return;
    } else {
      req.session.user = userdb;
      res.redirect('https://floodric.com:8889/');
    }
  }); // end user registration step
});

//http.createServer(options,app).listen(8888); // http server
app.listen(8888);
https.createServer(options,app).listen(8889); // https server
