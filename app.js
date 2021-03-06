// @flow

var express = require('express');
var path = require('path');
var createError = require('http-errors');
var morgan = require('morgan');
var logger = require('./logger');

var app = express();

var usersRouter = require('./routes/users');
var indexRouter = require('./routes/index');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

if(process.env.NODE_ENV !== 'test') {
    logger.verbose(`Current working directory is ${process.cwd()}`);
    app.use(morgan('combined', {stream: logger.stream}));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', usersRouter);
app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    logger.error(err);
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;