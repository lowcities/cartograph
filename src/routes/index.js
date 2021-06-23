// Create a router object to export to server.js
import express from 'express';
const router = express.Router();
import pkg from 'mongoose';
const { Types } = pkg;
import User from '../models/user.model.js'
// const User = require('../models/user.model');


const Promise = global.Promise;


router.get('/home', function(req, res, next) {
    return res.render('home');
});

// Login page for new users
router.get('/', function(req, res, next) {
    return res.send();
});

router.get('/login', function(req, res, next) {
    if (req.session.userId) {
        console.log("session found", req.session.userId);
        return res.send({ redirect: '/profile' });
    } else {
        return res.send();
    }
        
});

// POST login info to access user profile
router.post('/login', (req, res, next) => {
    let userData = {
        email: req.body.email,
        password: req.body.password
    }
    console.log(userData);
    
    User.findOne({ email: req.body.email })
        //select the userName password and groceryList elements from User
        .select("userName password groceryList")
        .exec(function(error, user) {
            if (error) {
                return next(error);
            } else if ( !user ) {
                let err = new Error('User not found');
                err.status = 401;
                return next(err);
            } else if (!user.authenticate(req.body.password)) {
                console.log('Password not correct!');
                let err = new Error('Password is incorrect');
                err.status = 401;
                return next(err);
            } else {
                console.log("I think this worked");
                req.session.userId = user._id;
                res.json(user);
            }
        });
});

router.get('/register', function(req, res, next) {
    res.render('register');

});

// Create a new user account
router.post('/register', function(req, res, next) {
    //create object with form input
	let userData = {
		email: req.body.email,
		name: req.body.name,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
        };

    if (req.body.email &&
		req.body.name &&
		req.body.password &&
		req.body.confirmPassword) {
          
		//confirm that user typed same password twice
		if (req.body.password !== req.body.confirmPassword) {
			let err = new Error('Passwords do not match.');
			err.status = 400;
			return next(err);
		}
        //use schema's 'create' method to insert document into Mongo
		User.create(userData, (error, user) => {
			if(error) {
				return next(error);
			} else {
                req.session.userId = user._id;
                console.log(user._id);
                res.json(user);            
            }
            
        });

		} else {
			let err = new Error('All fields required.');
			err.status = 400;
			return next(err);
		}
});

// GET user profile and list
router.get('/profile', function(req, res, next) {
    // if no session cookie exists throw error
    if (!req.session.userId ) {
        let err = new Error("You are not authorized to view this page.");
        err.status = 403;
        return next(err);
    }
    // find session cookie for user and return database info for said user
    User.findById(req.session.userId)
        .exec((error, user) => {
            if (error) {
                return next(error);
            } else {
                // console.log("I am getting the profile", user);
                return res.json(user);
            }
        });
});


// Add a new grocery list item to user profile
router.put('/profile/:userId', function(req, res, next) {
    let userId = req.session.userId;
    let item = req.body.itemName;

    User.findById(userId, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        if (!user) {
            return res.status(404).json({message: "File not found"})
        }

        user.groceryList.push({itemName: item});
        user.save( function(err, savedFile) {
            console.log("File saved");
            console.error(err);
            res.json(user);
        });
    });
});

// edit an exsisting item in user's grocery list
router.put('/profile/:userId/list/:itemId', function(req, res, next) {
    let userId = req.params.userId;
    let itemName = req.body.itemName;
    let itemId = req.params.itemId;
    let options = { new: false };
    let itemIdObj = new Types.ObjectId(itemId);

    const itemObject = {
        itemName: itemName,
        _id: itemIdObj,
    };

    const conditions = { 
        _id: userId,
        'groceryList._id': itemIdObj,
        };
    const update = {
        $set: { 
            'groceryList.$.itemName': itemName,
        }
    };
  
    /* find the document that matches the userId 
    and has matching itemId and update it with the new itemName */
    User.findOneAndUpdate(conditions, update, options, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        if (!user) {
            return res.status(404).json({message: "File not found"})
        }
        res.json(user);
    });
});

router.delete('/profile/:userId/list/:itemId', function(req, res, next) {
    let userId = req.params.userId;
    let itemName = req.body.itemName;
    let itemId = req.params.itemId;
    let options = { 
        safe: true,
        multi: false
    };
    let itemIdObj = new Types.ObjectId(itemId);

    User.update({_id: userId}, { "$pull": { "groceryList" : { '_id': itemIdObj } }}, options, function(err, item) {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        if (!item) {
            return res.status(404).json({message: "File not found"})
        }
        res.json(item);
        console.log(item);
    });
});

// GET /logout
router.get('/logout', function(req, res, next) {
    if (req.session) {
        req.session.destroy(function(err) {
            if (err) {
                return next(err);
            } else {
                console.log('User has logged out.')
                return res.send();
            }
        });
    }
});

export default router;