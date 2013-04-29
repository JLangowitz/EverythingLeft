var Models = require('../models/models')
	, Recipe = Models.recipe;

//http://api.yummly.com/v1/api/metadata/ingredient?_app_id=45928695&_app_key=32e141669097e9e4be73c86737f3bd3d

var yummlyID = '45928695'
	, yummlyKEY = '32e141669097e9e4be73c86737f3bd3d'
	, yummlyURL = 'http://api.yummly.com/v1/api/metadata/recipes?app_id='+yummlyID+'_app_key='+yummlyKEY
	, recipe = 'mwahaha global variable';

exports.tempdisp = function(req, res){
	res.send(recipe)
};

exports.list = function(req, res){
	recipe = req.body.results;
	console.log(req.results);
	res.redirect('/tempdisp');
};