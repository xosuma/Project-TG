var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//var routes = require('./routes/index');
var schedules = require('./routes/schedules');
var users = require('./routes/users');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/scheduleApp', function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));


//route here
//app.use('/', routes);
app.use('/schedules', schedules);
app.use('/users', users);

var User = require('./models/User.js');

app.get('/', function(req,res){
  res.sendFile('index.html');
});

app.post('/login',function(req,res){

  var name = req.body.user;
  var email = req.body.email;
  User.find({email: email}, function (err, users) {
    if (err) return next(err);


    res.cookie("user",name,{maxAge:900000});
    res.cookie("email",email,{maxAge:900000});
    res.cookie("loggedIn",true,{maxAge:900000});
    res.cookie("token",req.body.token,{maxAge:900000})
    console.log(users[0]);
    if (users==[]||users[0]==undefined){
      res.cookie("isNew",true,{maxAge:900000});
      res.cookie("admin",false,{maxAge:900000});
    }
    else {
      console.log(users[0]["admin"]);
    
      if (users[0]["admin"]){
        res.cookie("admin",true,{maxAge:900000})
      }
      else{
        res.cookie("admin",false,{maxAge:900000})
      }
    }

   res.send("check cookie");

  });
 /* 

  //여기에다가 데이터베이스 체크해서 새유저면 boolean값을보내서 주소를 쳐쓰게합시다
  //
  //res.cookie("isNew",boolean,{maxAge:900000});
  console.log("cookie created successfully");*/
});

app.post('/logout',function(req,res){
  res.clearCookie('user');
  res.clearCookie('email');
  res.clearCookie('loggedIn');
  res.clearCookie('isNew');
  res.clearCookie('admin');
  res.clearCookie('token');
  console.log("cookie deleted successfully");
  res.send("cookie deleted");
});



// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

*/
module.exports = app;
