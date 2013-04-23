var Models = require('../models/models')
	, User = Models.user;

/*
 * GET users listing.
 */

var yummlyID = '45928695',
    yummlyKEY = '32e141669097e9e4be73c86737f3bd3d';

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.login = function(req, res) {
    req.session.url = '/';
	res.render('login', {title: "Sign In"});
};

exports.profile = function(req, res){
	res.render('profile', {title: "My Profile"});
};

exports.search = function(req, res) {
	req.session.url = '/search';
	res.render('search', {
		title: "Search for new recipes!"
	});
}

exports.settings = function(req, res) {
    res.render('user', {title: 'Profile', prefs: JSON.stringify(req.user.preferred_categories)})
};

exports.prefs = function(req, res) {
	req.user.preferred_categories=req.body.categories;
	req.user.save(function(err){
		if (err){
			res.send(err);
			return console.log('error', err);
		}
		res.send(err);
	});
};
