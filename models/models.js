
//Not currently used in implementation -- may be used in the future.

var mongoose = require('mongoose');

var user_schema = mongoose.Schema({
	email: String,
	username: String,
	preferences: [String],
})

var User = mongoose.model('User', user_schema);

exports.user = User;
