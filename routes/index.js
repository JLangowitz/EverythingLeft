
/*
 * GET home page.
 */

exports.index = function(req, res){
	console.log(req.session);
  	res.render('index', 
  		{ title: 'Express', 
		dietary: req.session.dietary, 
		cuisines: req.session.cuisines, 
		flavors: req.session.flavors });
};