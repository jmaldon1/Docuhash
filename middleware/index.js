//Prevents logged in users from seeing pages that only logged out users should see(register/login pages)
function loggedOut(req,res,next){
	if(req.session && req.session.userId){
		return res.redirect('upload');
	}
	return next();
}

//Prevents non-logged in users from visiting certain pages that only logged in users should see
function requiresLogin(req,res,next){
	if(req.session && req.session.userId){
		return next();
	}else {
		var stop = true;
		var err = new Error('You must be logged in');
		error.status = 401;
		return next(err);
	}
}

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;