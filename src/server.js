// Imported modules
import path from 'path';
import express from 'express';
import {appName, port, db} from './config/index.js';
import router from './routes/index.js';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from 'express-session';
// const path = path();
// const express = express();
// const config = require('./config');
// const router = require('./routes');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const session = require('express-session');
const __dirname = path.dirname(new URL(import.meta.url).pathname);

mongoose.Promise = global.Promise;


// Create the application object
const app = express();

// use sessions for tracking logins
app.use(session({
  secret: 'thanks for using cartograph',
  resave: true,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    secure: false
  }
}));

// make user ID available for all views
app.use(function (req, res, next) {
  res.locals.currentUser = req.session.userId;
  next();
});

// use body parser to parse json info
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// path to static files
const publicPath = path.resolve(__dirname, './public');
app.use(express.static(publicPath));

app.use('/', router);



// connect to the database
mongoose.connect(`mongodb://${db.host}/${db.dbName}`, {useMongoClient: true});

//require the User model file
//require the User model file
import User from './models/user.model.js';
// import ('./models/user.model.js').default;



// Start the server
app.listen(port, function() {
  console.log(`${appName} is listening on port ${port}`);
});