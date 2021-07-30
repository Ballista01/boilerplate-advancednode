'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');
const { ObjectID } = require('mongodb');
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
passport.session();

passport.serializeUser((id, done) => {
  done(null, user._id);
});
passport.deserializeUser((id, done) => {
  // myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
    done(null, null);
  // })
})

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.route('/').get((req, res) => {
  res.render('pug/index', {title: 'Hello', message: 'Please login'});
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
