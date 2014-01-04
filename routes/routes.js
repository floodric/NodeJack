var User = require('../models/user.js');

// get index
function index(req,res){
  if(typeof(req.session) != "undefined"){
    user = req.session.user;
    res.render('views/index',{user:user});
    return;
  }
  res.render('views/index',{});
}

// play get
function play(req,res){
  if(typeof(req.session) != "undefined"){
    user = req.session.user;
    res.render('views/play',{user:user});
    return;
  }
  res.render('views/play',{});

}

function login(req,res){
  if(typeof(req.session) != 'undefined'){
    user = req.session.user
    res.render('views/login',{user:user});
    return;
  }
  res.render('views/login',{});
}

function auth(req,res){
  var username = req.body.user.name;
  var password = req.body.user.password;

  User.login(username,password, function(errs,user){
    // return errors
    if(errs && errs.legnth > 0){
      console.log(errs);
      res.render('views/login',{errors:errs});
      return;
    }
    req.session.user = user;
    res.redirect('https://floodric.com:8889/');
    return;
  });
}

function logout(req,res){
  // destroy the session
  delete req.session.user;
  // redirect to home
  res.redirect('https://floodric.com:8889/');
}

function register(req,res){
  if(typeof(req.session) != "undefined"){
    user = req.session.user;
    res.render('views/register',{user:user});
  }
  res.render('views/register',{});
}

function newUser(req,res){
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
}

exports.index = index;
exports.play = play;

exports.login = login;
exports.auth = auth;
exports.logout = logout;

exports.register = register;
exports.newUser = newUser;
