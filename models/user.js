// run 'mongod --dbpath ~/data/db' in cmd to start the Database.

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var FileSchema = new mongoose.Schema({
	path: {
		type: String
	},
	originalname: {
		type: String
	},
	mimetype: {
		type: String
	},
	hash: {
		type: String
	},
	time: {
		type: String
	},
	contractaddress: {
		type: String
	},
	txhash: {
		type: String
	}
});

var UserSchema = new mongoose.Schema({

	fullname: {
		type: String,
		required: true,
		trim: true,
	},

	username: {
		//type of text that will be in the input field
		type: String,
		//checks database to see if the username already exists
		unique: true,
		//the field is required
		required: true,
		//trims any whitespace off the front and back of the input field
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
	},
	files: [
		FileSchema
	]
});

//authenticate input against database documents
UserSchema.statics.authenticate = function (email, password, callback){
	//searches database for username or email
	User.findOne({ $or: [{email: email},{username: email}] }).exec(function (error, user){
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
var File = mongoose.model('File', FileSchema);

module.exports.File = File;
module.exports.User = User;
