'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');
const { ObjectID } = require('mongodb');
const LocalStrategy = require('passport-local');
// const pug = require('pug');

const app = express();
app.set('view engine', 'pug');

// initialize session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
}))

// initialize passport
passport.initialize();
app.use(passport.initialize());
app.use(passport.session());

myDB(async client => {
  const myDataBase = await client.db('database').collection('users');
  console.log('myDataBase:' + myDataBase.toString());

  app.route('/').get((req, res) => {
    res.render('pug', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true,
    })
  })

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
        if (password !== user.password) return done(null, false);
        return done(null, user);
      });
    }
  ));

}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('pug', { title: e, message: 'Unable to login' });
  });
});

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use((req, res, next) => {res.status(404).type('text').send('Not Found')});

app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
  console.log('POST routed!');
  res.redirect('/profile');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
app.route('/profile').get(ensureAuthenticated, (req, res) => {
  res.render('pug/profile', {
    username: req.user.username,
  });
})
app.route('logout').get((req, res)=>{
  req.logout();
  res.redirect('/');
})
// app.route('/').get((req, res) => {
//   res.render('pug/index', { title: 'Hello', message: 'Please login' });
// });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
