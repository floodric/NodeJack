var express = require('express'),
    path = require('path'),
    User = require('./models/user.js');

var app = express();

// global app configurations
app.configure(function(){
  app.use(express.cookieParser());
  app.use(express.session({secret: 'secret key'}));
  app.set('views',__dirname,'/views');
  app.set('view engine','ejs');
  app.use(express.logger('tiny'));
  app.use(express.bodyParser());
  app.use(app.router);
  // static files belong in public folder
  app.use(express.static(path.join(__dirname,'public')));
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
app.get('/login',function(req,res){});
app.post('/login',function(req,res){});

// logout skeleton
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

  // now send to the user model to ensure that it all works
  user = User.register(user); 
  req.session.user = user;

  if(user instanceof Array){
    res.render('views/register',{errors:user});
    return;
  } else {
    console.log('here');
    res.redirect('views/index',{user:user});
  }
});

app.listen(8888);
