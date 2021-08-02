'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');
const { ObjectID } = require('mongodb');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const routes = require('./routes.js');
const auth = require('./auth');
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

  routes(app, myDataBase);
  auth(app, myDataBase);

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

// app.route('/').get((req, res) => {
//   res.render('pug/index', { title: 'Hello', message: 'Please login' });
// });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
