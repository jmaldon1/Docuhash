var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var mongo = require('mongodb')
var session = require('express-session');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
PDFParser = require("pdf2json");
var SHA3 = require('sha3');
var Web3 = require('web3');
var solc = require('solc');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20');
var keys = require('./keys');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);
var User = require('./models/user');
var exphbs = require('express-handlebars');

var app = express();

// passport.use(new GoogleStrategy({
//         callbackURL:'auth/google/redirect',
//         clientID: keys.google.clientID,
//         clientSecret: keys.google.clientSecret
//     }, ()=> {

//     }));

//mongodb connection
mongoose.connect("mongodb://localhost:27017/docuhash", {
	useMongoClient: true
})
var db = mongoose.connection;
//mongo error
db.on('error', console.error.bind(console, 'connection error:'));

//use session for tracking logins
app.use(session({
    secret: 'treehouse loves you', //Signs the session ID cookie...required and can be any string of text
    resave: true, //forces the session to be saved in the session store
    saveUninitialized: false, //forces an uninitialized session to be saved in the session store
    store: new MongoStore({
    	mongooseConnection: db
    })
}));

app.use(function(req, res, next){
	res.locals.loggedIn = req.session.userId;
	next();
});


// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

app.use(flash());

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.engine('hbs', exphbs({extname: 'hbs', defaultLayout: 'layoutA', layoutsDir: __dirname + '/views/layouts'}));
app.set('view engine', 'hbs');
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
app.listen(3000, function() {
    console.log('Express app listening on port 3000');
});