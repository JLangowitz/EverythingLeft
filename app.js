
/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, user = require('./routes/user')
	, recipe = require('./routes/recipe')
	, http = require('http')
	, path = require('path')
	, mongoose = require('mongoose')
	, MongoStore = require('connect-mongo')(express)
	, GoogleStrategy = require('passport-google').Strategy
	, Models = require('./models/models.js')
	, Tag = Models.tag
	, User = Models.user;

var app = express();

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/everythingleft');

var passport = require('passport')

app.configure('development', function(){
	app.use(express.errorHandler());
	app.set('host', process.env.PRODUCTION_URL || 'http://localhost:3000')
});

console.log(app.get('host'));


// Creates the user on successful auth
passport.use(new GoogleStrategy({
		returnURL: app.get('host') + '/auth/google/return',
		realm: app.get('host')
	},
	function(identifier, profile, done) {

		var email = profile.emails[0].value;
		User.findOne({email:email}).exec(function(err,user){
			if (err){
				console.log(err);
				return done(err);
			}
			if (user==null){
				user = new User({email:email,preferences:[],favorites:[]});
				console.log('User created.');
				user.save(function(err){
					if (err) {
						console.log(err);
						return done(err);
					}
					console.log('User saved.');
					return done(null, user);
				});
			}
			else {
				console.log('User found.');
				return done(null, user);
			}
		});
	}));

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('secret', process.env.SESSION_SECRET || 'terrible, terrible secret')
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser(app.get('secret')));
	app.use(express.session({ secret: 'keyboard cat' }))
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  We store based on emails

passport.serializeUser(function(user, done) {
		done(null, user.email);
});

passport.deserializeUser(function(email, done) {
		User.findOne({email:email}, function(err, user) {
				done(err, user);
		});
});

// GET requests.
app.get('/', loginRequired, pullTags, routes.index);
app.get('/login', user.login); // Logging in, creating a user.
app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/return', passport.authenticate('google', {failureRedirect: '/login' }), function(req, res) {
	if(!req.user.username){
		console.log('no username found');
		res.redirect('/username');
		return;
	}
	res.redirect(req.session.url);
});
app.get('/settings', loginRequired, pullTags, user.profile);
app.get('/profile', loginRequired, pullTags, user.profile);
app.get('/search', loginRequired, pullTags, user.search);
app.get('/username', loginRequired, pullTags, user.username);
app.get('/multiselect/update', loginRequired, pullTags, user.update);
app.get('/preselect', pullTags, user.preselect);
app.get('/yummly/update', loginRequired, pullTags, user.yummly_update);
app.get('/navbar/search', loginRequired, pullTags, user.navbarSearch);
app.get('/yummly/popover/update', loginRequired, pullTags, user.popover_update);
app.get('/addrecipe', loginRequired, pullTags, recipe.addform);
app.get('/recipe/:recipe', loginRequired, pullTags, recipe.recipepage);
app.get('/database/search', loginRequired, pullTags, recipe.search);

// POST requests.
app.post('/user/update', loginRequired, pullTags, user.prefs);//Set user preferences
app.post('/username', loginRequired, pullTags, user.setname);
app.post('/new/tag', loginRequired, pullTags, user.newtag);
app.post('/addrecipe/new', loginRequired, pullTags, recipe.makenew);
app.post('/addfav', loginRequired, pullTags, recipe.addfav);
app.post('/recipe/update/desc', loginRequired, pullTags, recipe.update_desc);
app.post('/recipe/update/image', loginRequired, pullTags, recipe.update_image);

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

function loginRequired(req, res, next){
	if (!req.user) {
		//Set the url the user was trying to get to in req.session
		req.session.url = req.url;
		console.log("User not authenticated.");
		//Automatically lead the user to the auth page
		res.redirect('/login');
	} 
	else {
		if(!req.user.username&&req.url!='/username'){
			console.log('no username found');
			res.redirect('/username');
		}
		next();
	}
}

function pullTags(req, res, next){
	req.session.dietary=[];
	req.session.flavors=[];
	req.session.cuisines=[];
	Tag.find().sort({name:1}).exec(function(err, tags){
		for (var i = 0; i < tags.length; i++) {
			if (tags[i].category=='Dietary Restriction'){
				req.session.dietary.push(tags[i]);
			}
			if (tags[i].category=='Favorite Flavor'){	
				req.session.flavors.push(tags[i]);
			}
			if (tags[i].category=='Preferred Cuisine'){	
				req.session.cuisines.push(tags[i]);
			}
		};
		next();
	});
}
