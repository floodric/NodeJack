var express = require('express'),
    path = require('path');

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
app.get('/register',function(req,res){});
app.post('/regster',function(req,res){});

app.listen(8888);
