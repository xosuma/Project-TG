var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'views')));
app.use(express.static(path.join(__dirname, 'public')));

//route here
app.get('/', function(req,res){
  res.sendFile('index.html');
});

app.post('/login',function(req,res){
  var name = req.body.user;
  var email = req.body.email;
  //check database
  //return cookie
  res.cookie("user",name,{maxAge:900000});
  res.cookie("email",email,{maxAge:900000});
  res.cookie("loggedIn",'true',{maxAge:900000});
  //여기에다가 데이터베이스 체크해서 새유저면 boolean값을보내서 주소를 쳐쓰게합시다
  //
  //res.cookie("isNew",boolean,{maxAge:900000});
  console.log("cookie created successfully");
  res.send("check cookie");
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
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


module.exports = app;
