
/*
 * GET home page.
 */

exports.index = function(req, res){
  	res.render('index', 
  		{ title: 'Express', 
		dietary: req.session.dietary, 
		cuisine: req.session.cuisines, 
		flavors: req.session.flavors });
};