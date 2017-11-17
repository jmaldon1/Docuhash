// run 'mongod --dbpath ~/data/db' in cmd to start the Database.

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var UserSchema = new mongoose.Schema({

	fullname: {
		type: String,
		required: true,
		trim: true,
	},

	username: {
		type: String,
		unique: true,
		required: true,
		trim: true,
	},
	email: {
		type: String, 
		unique: true, //email must be unique
		required: true, //field is required
		trim: true, //removes whitespace before or after the field
	},
	password: {
		type: String,
		required: true,
	}
});

//authenticate input against database documents
UserSchema.statics.authenticate = function (email, password, callback){
	User.findOne({ email:email })
		.exec(function (error, user){
			if(error) {
				return callback(error);
			} else if (!user) {
				var err = new Error ('User not found.');
				err.status = 401;
				return callback(err);
			}
			bcrypt.compare(password, user.password, function(error, result) {
				if (result === true) {
					return callback(null, user);
				} else{
					return callback();
				}
			})
		});
}

//hash password before saving to database
UserSchema.pre('save', function(next) {
	var user = this;
	bcrypt.hash(user.password, 10, function(err, hash) {
		if (err) {
			return next(err);
		}
		user.password = hash;
		next();
	})

});


var User = mongoose.model('User', UserSchema);
module.exports = User;