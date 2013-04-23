
/*
 * GET home page.
 */

exports.index = function(req, res){
  console.log('user', req.session.user);
  res.render('index', { title: 'Express' });
};