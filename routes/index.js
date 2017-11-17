var express = require('express');
var router = express.Router();
var User = require('../models/user');

// GET /test
router.get('/test', function(req,res,next){
  return res.render('test',{title: 'test'});
});

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

//GET /login
router.get('/login', function (req, res, next){
	return res.render('login', {title: 'Login'});
});

//POST /login
router.post('/login', function(req, res, next){
	if (req.body.email && req.body.password)  {
		User.authenticate(req.body.email, req.body.password, function(error, user){
			if (error || !user) {
				var err = new Error('Wrong email or password.');
				err.status = 401;
				return next(err);
			} else {
				req.session.userId = user._id;
				return res.redirect('/profile');
			}
		});
	}else {
		var err = new Error('Email and password are required.');
		err.status = 401;
		return next(err);
	}
});

// GET /register
router.get('/register', function(req,res,next){
  return res.render('register',{title: 'Sign Up'});
});

// POST /register
router.post('/register', function(req,res,next){
	if (req.body.fullname &&
		req.body.username &&
		req.body.email &&
		req.body.password &&
		req.body.confirmPassword){

		if (req.body.password !== req.body.confirmPassword){
			var err = new Error('Passwords do not match.');
			err.status = 400;
			return next(err);
		}

		//create object with form input
		var userData = {
			fullname: req.body.fullname,
			username: req.body.username,
			email: req.body.email,
			password: req.body.password
		};

		//use schema's 'create' method to insert document into Mongo
		User.create(userData, function (error, user) {
			if (error){
				return next(error);
			} else{
				req.session.userId = user._id;
				return res.redirect('/profile')
			}
		});


	} else{
		var err = new Error('All fields required.');
		err.status = 400;
		return next(err);
	}
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

module.exports = router;
