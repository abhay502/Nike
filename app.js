var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs=require('express-handlebars')
var session=require('express-session')
var db=require('./config/connection') 
const noocache = require("nocache");
let nocache = require('node-nocache');
var handlebars=require('handlebars')

const sWal=require('sweetalert2')             

 
db.connect((err)=>{
  if (err) {
    console.log('Connection error')
  }else{
    console.log('connection successfully on http://localhost:3000/') 
  }
})
 
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

handlebars.registerHelper('inc',(value,options)=>{
  return(value)+1

})

var Hbs=hbs.create({});

Hbs.handlebars.registerHelper('if_eq', function(a, b, opts) {
  if(a == b) // Or === depending on your needs
      return opts.fn(this);
  else
      return opts.inverse(this);
});

var app = express(); 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialDir:__dirname+'views/partials/'}))


app.use(session({secret:'key',cookie:{maxAge:600000000000},resave:false,saveUninitialized:false}))


app.use(nocache);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false })) ;
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', userRouter);
app.use('/admin', adminRouter);

if(app.use('/', userRouter) ){
  
  app.use(express.static(path.join(__dirname, 'public/assetsuser')));

 };
  if( app.use('/admin/', adminRouter)){
 
  app.use(express.static(path.join(__dirname, 'public/assetsadmin')));
 
 };    

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
   