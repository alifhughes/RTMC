// Module imports
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sockIO = require('socket.io')();

// Configure and connect to mongodb
var dbConfig = require('./db');
var mongoose = require('mongoose');

// Connect to DB
mongoose.connect(dbConfig.url);
mongoose.connection.once('connected', function() {
        console.log("Database connected successfully")
});

// Create instance of express app
var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');


// Set up express session and passport
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

// Attach socket io to it
app.sockIO = sockIO;

var routes = require('./routes');

app.use('/', routes);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Testing for socket io no of clients connected
var clients = 0;

// On socket connect
sockIO.on('connection', function(socket){
    // Increase the number of clients
    clients++;

    // Broadcast out the number of clients connected
    sockIO.sockets.emit('broadcast', {
        description: clients + ' clients connected!'
    });

    // On disconnect
    socket.on('disconnect', function () {

        // Decrement number of clients
        clients--;

        // broadcast out how many clients
        sockIO.sockets.emit('broadcast' , {
            description: clients + ' clients connected!'
        });

    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
