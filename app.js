var express = require('express'),
    path = require('path'),
    User = require('./models/user.js');

var app = express();

// global app configurations
app.configure(function(){
  app.set('views',__dirname,'/views');
  app.set('view engine','ejs');
  app.use(express.logger('tiny'));
  app.use(express.bodyParser());
  app.use(app.router);
  // static files belong in public folder
  app.use(express.static(path.join(__dirname,'public')));
});


app.get('/', function(req,res){
  res.render('views/index',{});
});

app.get('/play',function(req,res){
  res.render('views/play',{});
});

// login skeleton
app.get('/login',function(req,res){});
app.post('/login',function(req,res){});

// logout skeleton
app.get('/register',function(req,res){
  res.render('views/register',{});
});

app.post('/register',function(req,res){
  var user = {};
  user.username = req.body.user.username;
  user.password = req.body.user.password;
  user.passwordconf = req.body.user.passwordconf;
  user.email = req.body.user.email;
  res.render('views/index',{user:user});
});

app.listen(8888);
