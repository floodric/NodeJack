var bcrypt = require('bcrypt');
var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var ObjectId = mongo.ObjectID

var server = "mongodb://127.0.0.1:27017/";
var db = "users";


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
//          returns to a callback function, since mongo is asynchronous
function newUser(user,callback){
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

  Mongoclient.connect(server+db,function(err,db){
    if(err){
      errs.push(err.message); 
      callback(errs,userdb);
      return; // lets not do any more work if we failed
    }
    var collection = db.collection('user');
    collection.insert(userdb,function(err,docs){
      if(err){
        errs.push(err.message);
        callback(errs,userdb);
        return; // no more work if we failed
      }
      db.close();
    }); // end insert
  }); // end server connect

//  users.push(userdb);
//  console.log(users);
  return; // all work is done in callbacks, so return nothing
}

// lookupUser: given a field, and a matching param for that field
//             will return a user object and a list of errors to the callback
function lookupUser(field,param,callback){
  if(field == "_id"){ // special type for id looking up
    var param = new ObjectId(param);
  }
  var errs = [];
  Mongoclient.connect(server+db,function(err,db){
    if(err){
      errs.push(err.message);
      callback(errs,{});
      return;
    }
    var collection = db.collection('user');
    collection.findOne({field:param}, function(err,doc){
      if(err){
        errs.push(err.message);
        callback(errs,doc);
        db.close(); 
        return;
      }
    }); // end findone
    db.close();
  }); // end connect

  /* flat javascript object example
  var matches = users.filter(function(val,arr,i){
    if(typeof(val.name) != "undefined"){
      return (val.name == userName);
    }
    return false;
  });
  return matches.pop();
  */
}

// login: given a username and password, will return an array of errors 
//        and a user (if successful) to the callback
function login(username,password,callback){
  // look up the user first
  lookupUser("username":username,function(err,user){
    if(err){ // lookupuser failed
      callback([err],{});
      return;
    }
    if(!user){ // no user found
      callback(["Invalid username or password"],user);
      return;
    }
    bcrypt.compare(password,user.hash,function(err,res){
      if(err){ // bcrypt failed?
        callback(["Something went wrong"],{});
        return;
      }
      if(!res){ // passwords dont match
        callback(["Invalid username or password"],{});
        return;
      } 
      callback([],user);
    }); // end bcrypt.compare
  }); // end lookupuser
}

exports.register = newUser;
exports.lookup = lookupUser;
exports.login = login;
