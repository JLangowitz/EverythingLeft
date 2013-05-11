
//Not currently used in implementation -- may be used in the future.

var mongoose = require('mongoose');

// Has email for googleAuth, username can be set, prefs are user settings
// which ref tags, which are global. Favorites are refs to specific recips
// the user likes
var userSchema = mongoose.Schema({
	email: String,
	username: String,
	preferences: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
	favorites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Recipe'}]
});

var User = mongoose.model('User', userSchema);

exports.user = User;

// Recipes are user inputted or taken from Yummly, and they have a ref 
// list of tags and likes
var recipeSchema = mongoose.Schema({
	name: String,
	image_small: String,
	image_large: String,
	ingredients: Array,
	description: String,
	counter: Number,
	url: String,
	tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
	timestamp: Number
});

var Recipe = mongoose.model('Recipe', recipeSchema);

exports.recipe = Recipe;

// Tags are objects that specify a certain kind of food
var tagSchema = mongoose.Schema({
	name: String,
	category: String
});

var Tag = mongoose.model('Tag', tagSchema);

exports.tag = Tag;
