
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , MongoStore = require('connect-mongo')(express)
  , GoogleStrategy = require('passport-google').Strategy
  , Models = require('./models/models.js')
  , User = Models.user;

var app = express();

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/everythingleft');

var passport = require('passport')

app.configure('development', function(){
  app.use(express.errorHandler());
  app.set('host', process.env.PRODUCTION_URL || 'http://localhost:3000')
});

console.log(app.get('host'));

passport.use(new GoogleStrategy({
    returnURL: app.get('host') + '/auth/google/return',
    realm: app.get('host')
  },
  function(identifier, profile, done) {

    var email = profile.emails[0].value;
    console.log(email);
    User.findOne({email:email}).exec(function(err,user){
      console.log("\nUser info below: \n")
      console.log(user);
      if (err){
        console.log(err);
        return done(err);
      }
      if (user==null){
        user = new User({email:email, username:email});
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
  // app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(app.get('secret')));
  app.use(express.session({ secret: 'keyboard cat' }))
  // app.use(express.session({
  //   maxAge: new Date(Date.now() + 3600000),
  //   store: new MongoStore(
  //     {db:mongoose.connection.db},
  //     function(err){
  //         console.log(err || 'connect-mongodb setup ok');
  //       })
  // }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

// GET requests.
app.get('/', loginRequired, routes.index);
app.get('/login', user.login); // Logging in, creating a user.
app.get('/profile', user.profile);
app.get('/search', user.search);



// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.

passport.serializeUser(function(user, done) {
    done(null, user.email);
});

passport.deserializeUser(function(email, done) {
    User.findOne({email:email}, function(err, user) {
        done(err, user);
    });
});

// GET requests.
app.get('/', loginRequired, routes.index);
app.get('/login', user.login); // Logging in, creating a user.
app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/return', passport.authenticate('google', {failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.url);
});
app.get('/settings', loginRequired, user.settings);


// POST requests.
app.post('/prefs', loginRequired, user.prefs);//Set user preferences


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

function loginRequired(req, res, next){
  if (!req.user) {
    //Set the url the user was trying to get to in req.session
    req.session.url = req.url
    console.log("User not authenticated.")
    //Automatically lead the user to the auth page
    res.redirect('/auth/google');
  } else {
    console.log("User already logged in.")
    console.log(req.user)
    next();
  }
}
