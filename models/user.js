var bcrypt = require('bcrypt');
var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;

//@TODO remove our dumb list of users here
var users = [];

// checkuser: validate assumptions about user, return list of errors
function checkUser(user){
  var errs = [];
  if(!user){ // return now because rest of checks dont make sense
    return["No User given"];
  }
  if(!user.username){
    errs.push("must have a username");
  }
  if(!user.email){
    errs.push("must have a password");
  } else { // do BASIC email validation
    if(user.email.indexOf('@') == -1 || user.email.indexOf('.') == -1){
      errors.push("Invalid email");
    }
  }
  if(!user.passHash){
    if(user.password || user.passwordconf){ // if user has string passwords
      if(user.password != user.passwordconf){
        errs.push("given passwords do not match");
      }
    } else { // either not sent strings or no stored hash
      errs.push("no password set");
    }
  }
  return errs;
}

// newUser: will try to create a user or return a list of errors
function newUser(user){
  var errs = [];
  errs = checkUser(user);
  if(errs.length > 0){
    return errs;
  }
  if(lookupUser(user.username)){
    return ["user already exists"];
  }

  userdb = {};
  userdb.username = user.username;
  userdb.email = user.email;
  userdb.role = "player";

  userdb.salt = bcrypt.genSaltSync(10);
  userdb.hash = bcrypt.hashSync(user.password, userdb.salt);

  //@TODO store to the database here
  users.push(userdb);
  console.log(users);

  return userdb;  
}

function lookupUser(userName){
  var matches = users.filter(function(val,arr,i){
    if(typeof(val.name) != "undefined"){
      return (val.name == userName);
    }
    return false;
  });

  return matches.pop();
}

exports.register = newUser;
exports.lookup = lookupUser
