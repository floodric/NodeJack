var bcrypt = require('bcrypt');
var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var ObjectId = mongo.ObjectID

var server = "mongodb://127.0.0.1:27017/";
var db = "users";

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
  console.log('creating user '+JSON.stringify(user));
  if(errs.length > 0){
    return callback(errs,{});
  }
  lookupUser("username",user.username,function(err,userdb){
    console.log(err+'userdb'+JSON.stringify(userdb));
    if(err && err.length > 0){
      console.log(err);
      return callback([err]);
    }
    if(userdb && typeof(userdb.username) != 'undefined'){
      console.log('failure');
      callback(["user already exists"],{});
      return;
    } // we got here, means username not taken, continue as normal

    console.log('ere');

    var newuser = {};
    newuser.username = user.username;
    newuser.email = user.email;
    newuser.role = "player";

    newuser.salt = bcrypt.genSaltSync(10);
    newuser.hash = bcrypt.hashSync(user.password, newuser.salt);

    mongoClient.connect(server+db,function(err,db){
      if(err){
        errs.push(err.message); 
        callback(errs,userdb);
        return; // lets not do any more work if we failed
      }
      var collection = db.collection('users');
      collection.insert(newuser,function(err,docs){
        console.log('insert'+JSON.stringify(newuser) );
        if(err){
          errs.push(err.message);
          console.log(err);
          callback(errs,userdb);
          return; // no more work if we failed
        }
        console.log('success!'+JSON.stringify(docs));
        docs = docs.map(function(val){scrubUser(val)});
        callback([],docs[0]); // [0] since we should only register one user at a time
        db.close();
      }); // end insert
    }); // end server connect
  }); // end lookupuser callback

  return; // all work is done in callbacks, so return nothing
}

// lookupUser: given a field, and a matching param for that field
//             will return a user object and a list of errors to the callback
function lookupUser(field,param,callback){
  console.log('lookup');
  if(field == "_id"){ // special type for id looking up
    var param = new ObjectId(param);
  }
  var errs = [];
  mongoClient.connect(server+db,function(err,db){
    console.log('connect');
    if(err){
      errs.push(err.message);
      callback(errs,{});
      return;
    }
    var collection = db.collection('users');
    var query = {};
    query[field] = param; // deref string, make it point to param
    console.log(JSON.stringify(query));
    collection.findOne(query, function(err,doc){
      console.log('collection');
      if(err){
        errs.push(err.message);
        callback(errs,doc);
        return;
      }
      console.log('SUCESS'+JSON.stringify(doc));
      callback(errs,doc); // send success
    }); // end findone
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
  console.log('login');
  // look up the user first
  lookupUser("username",username,function(err,user){
    console.log('lookup');
    if(err.length > 0){ // lookupuser failed
      console.log('failed lookup');
      callback([err],{});
      return;
    }
    if(!user){ // no user found
      console.log('no user');
      callback(["Invalid username or password"],user);
      return;
    }
    bcrypt.compare(password,user.hash,function(err,res){
      console.log('bcrypt');
      if(err.length > 0){ // bcrypt failed?
        console.log('failed bcrypt');
        callback(["Something went wrong"],{});
        return;
      }
      if(!res){ // passwords dont match
        console.log('failed match');
        callback(["Invalid username or password"],{});
        return;
      } 
      callback([],user);
    }); // end bcrypt.compare
  }); // end lookupuser
}

// scrub out sensitive information from the user (for passing around)
function scrubUser(user){
  if(typeof(user.hash) != 'undefined'){
    delete user.hash
  }
  if(typeof(user.salt) != 'undefined'){
    delete user.salt
  }
  return user;
}

exports.register = newUser;
exports.lookup = lookupUser;
exports.login = login;
exports.scrubUser = scrubUser;
