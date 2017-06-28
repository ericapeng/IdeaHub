/*
 * All get and posts that pertaining to authentification, profiles, and home
 */

var passport = require('passport');
var express = require('express');
var router = express.Router();
require('../db');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Idea = mongoose.model('Idea');

//redirects to the home page
router.get('/', function(req, res, next) {
  res.redirect('/ideahub');
});

//renders the registration page
router.get('/registration', function(req, res, next) {
    if(req.user === undefined)
        res.render('registration');
    else
        res.redirect('/');
});

//handles when a user submits the registration form
router.post('/registration', function(req, res, next) {
    User.register(new User({
        username: req.body.username, 
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        bio: req.body.bio,
        linkedin: req.body.linkedin
    }), req.body.password, function(err, user) {
        if (err) {
            res.render('registration', {'alert': 'Make sure that you have entered your name, email, and bio at the least. Also make sure that you have entered a username and password, of course!'});
        }
            else {
            passport.authenticate('local')(req, res, function() {
                res.redirect('/ideahub');
            });
        }
    });
});

//renders the login page
router.get('/login', function(req, res, next) {
    if(req.user === undefined)
        res.render('login');
    else
        res.redirect('/');
});

//handles when a user submits the login form
router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err,user) {
        if(user) {
            req.logIn(user, function(err) {
                res.redirect('/ideahub');
            });
        } else {
            res.render('login', {alert:'Your username and/or password is incorrect.'});
        }
    })(req, res, next);
});

//renders the homepage
router.get('/ideahub', function(req, res, next) {
    Idea.find(function(err, ideas, count) {
        //find the most popular ideas
        var hottest = ideas.reduce(function(acc, curr, curri, arr) {
            if(acc.length < 3) {
                acc.push(curr);
                return acc;
            }
            else {
                var toReplace = -1;
                for(var i = 0; i < 3; i++) {
                    if(acc[i].supporters.length < curr.supporters.length && 
                        (toReplace === -1 || acc[i].supporters.length < acc[toReplace].supporters.length))
                        toReplace = i;
                }
                if(toReplace !== -1)
                    acc[toReplace] = curr;
                return acc;
            }
        }, []);

        //find the newest ideas and sort them
        var newest = ideas.reduce(function(acc, curr, curri, arr) {
            if(acc.length < 5) {
                acc.push(curr);
                return acc;
            }
            else {
                var toReplace = -1;
                var iTime;
                for(var i = 0; i < 5; i++) {
                    iTime = acc[i].createdDate.getTime();
                    if(iTime < curr.createdDate.getTime() && 
                        (toReplace === -1 || iTime < acc[toReplace].createdDate.getTime()))
                        toReplace = i;
                }
                if(toReplace !== -1)
                    acc[toReplace] = curr;
                return acc;
            }
        }, []);
        newest.sort(function(a,b) {
            var aDate = a.createdDate.getTime();
            var bDate = b.createdDate.getTime();
            if(aDate > bDate)
                return -1;
            else if(bDate > aDate)
                return 1;
            return 0;
        });

        res.render('ideahub', {hottestIdeas: hottest, newestIdeas: newest});
    });
});

//render a profile page
router.get('/profile/:id', function(req, res, next) {
    User.findOne({_id: req.params.id}, function(err, user, count) {
        if(err || user === null) {
            if(err)
                err.message = 'The profile you are looking for does not exist.';
            return next(err);
        }
        else {
            Idea.find({_id: {$in: user.ideas}}, function(err, ideas, count) {
                res.render('profile', {viewUser: user, ideas: ideas});
            });
        }
    });
});

module.exports = router;
