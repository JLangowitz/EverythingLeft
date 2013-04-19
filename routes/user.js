
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.login = function(req, res) {
    req.session.url = '/';
	res.render('login', {title: "Sign In"});
};