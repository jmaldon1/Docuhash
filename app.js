var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var multer  = require('multer');
var path = require('path');
var app = express();

// Set Storage Engine
var storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb){
    cb(null, file.fieldname + "-" + Date.now() + 
    path.extname(file.originalname));
  } 
})
//Multer
var upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('fileUpload');

//Check File Type
function checkFileType(file, cb){
  // allowed ext
  var filetypes = /pdf|txt|docx|img|png/;
  //Check ext
  var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  //Check mime
  var mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null, true);
  } else {
    cb("Error: Incorrect file type!");
  }
}


//use session for tracking logins
app.use(session({
	secret: 'treehouse loves you', //Signs the session ID cookie...required and can be any string of text
	resave: true,//forces the session to be saved in the session store
	saveUninitialized: false //forces an uninitialized session to be saved in the session store
}));

//mongodb connection
mongoose.connect("mongodb://localhost:27017/nda")
var db = mongoose.connection;
//mongo error
db.on('error',console.error.bind(console, 'connection error:'));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(__dirname + '/public'));

app.post( '/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err){
      res.render('contact', {
        msg: err
      });
    } else {
      console.log(req.file);
      if(req.file == undefined){
        res.render('contact', {
          msg: 'Error: No File Selected!'
        });
      } else {
        res.render('contact', {
          msg: 'File Uploaded!',
          file: `uploads/${req.file.filename}`
        });
      }
    }
  });
});

// view engine setup
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// include routes
var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// listen on port 3000
app.listen(3000, function () {
  console.log('Express app listening on port 3000');
});
