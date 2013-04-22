
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

exports.search = function(req, res) {
	req.session.url = '/search';
	res.render('search', {
		title: "Search for new recipes!"
	});
}