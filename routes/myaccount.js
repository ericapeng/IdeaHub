/*
 * All gets and posts related to the user's account
 */
var express = require('express');
var router = express.Router();
require('../db');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Idea = mongoose.model('Idea');
var Notification = mongoose.model('Notification');

//render the user's myaccount page
router.get('/', function(req, res, next) {
    if(req.user === undefined)
        res.redirect('/login');
    else {
        Idea.find({_id: {$in: req.user.ideas}}, function(err, ideas, count) {
            Notification.find({_id: {$in:  req.user.notifications}}, function(err, notifs, count) {
                //get the ids of ideas and users related to the current user's notifications
                var notifUserIDs = notifs.map(function(n) {return n.user;});
                var notifIdeaIDs = notifs.map(function(n) {return n.idea;});

                User.find({_id: {$in: notifUserIDs}}, function(err, notifUsers, count) {
                    Idea.find({_id: {$in: notifIdeaIDs}}, function(err, notifIdeas, count) {
                        //populate the users and ideas related to notifications and render
                        for(var i = 0; i < notifs.length; i++) {
                            notifs[i].fullUser = notifUsers.find(
                                compareUserIDs.bind(null, notifs[i].user));
                            notifs[i].fullIdea = notifIdeas.find(
                                compareIdeaIDs.bind(null, notifs[i].idea));
                        }
                        res.render('myaccount', {myIdeas: ideas, myNotifs: notifs});
                    });
                });
            });
        });
    }
});

function compareUserIDs(id, u) {
    return u._id.toString() === id;
}

function compareIdeaIDs(id, i) {
    
    return i._id.toString() === id;
}

//render the newidea form
router.get('/newidea', function(req, res, next) {
    if(req.user === undefined)
        res.redirect('/login');
    else
        res.render('newidea');
});

//handles the submission of the newidea form
router.post('/newidea', function(req, res, next) {
    if(req.user === undefined)
        res.redirect('/login');
    else {
        var newIdea = new Idea({
            author: req.user._id,
            title: req.body.title,
            description: req.body.description,
            potentialMembers: [],
            supporters: [],
            comments: [],
            createdDate: Date.now()
        });
        newIdea.save(function(err, i, count) {
            if(err)
                res.render('newidea', {'alert': 'All fields are required.'});
            else {
                User.findOne({_id: req.user._id}, function(err, user, count) {
                    user.ideas.push(i._id);
                    user.save(function(err, u, count) {
                        res.redirect('/ideas/'+i.slug);
                    });
                });
            }
        });
    }
});

//renders the editprofile form
router.get('/editprofile', function(req, res, next) {
    if(req.user === undefined)
        res.redirect('/login');
    else
        res.render('editprofile');
});

//handles the submission of the editprofile form
router.post('/editprofile', function(req, res, next) {
    if(req.user === undefined)
        res.redirect('/login');
    else {
        User.findOne({_id: req.user._id}, function(err, user, count) {
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.bio = req.body.bio;
            user.save(function(err, u, count) {
                if(err)
                    res.render('editprofile', {'alert': 'No fields can be empty.'});
                else
                    res.redirect('/myaccount');
            });
        });
    }
});

//logs the user out
router.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/ideahub');
});

module.exports = router;
