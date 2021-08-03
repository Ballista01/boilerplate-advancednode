const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const { ObjectID } = require('mongodb');
const { nextTick } = require('process');
const GithubStrategy = require('passport-github').Strategy;

module.exports = function (app, myDataBase) {
	// Serialization and deserialization here...
	passport.serializeUser((user, done) => {
		done(null, user._id);
	});
	passport.deserializeUser((id, done) => {
		myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
			done(null, doc);
		})
	});

	passport.use(new LocalStrategy(
		function (username, password, done) {
			myDataBase.findOne({ username: username }, function (err, user) {
				console.log('User ' + username + ' attempted to log in.');
				if (err) return done(err);
				if (!user) return done(null, false);
				if (!bcrypt.compareSync(password, user.password)) {
					console.log('Wrong Password!');
					return done(null, false);
				}
				return done(null, user);
			});
		}
	));

	passport.use(new GithubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT.ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: 'https://wiz.codes/auth/github/callback',
		},
		function(accessToken, refreshToken, profile, cb){
			console.log(profile);
		}
	))
}