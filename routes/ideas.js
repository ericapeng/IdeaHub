/*
 * All gets and posts to routes related to viewing and manipulating ideas
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Idea = mongoose.model('Idea');
var Comment = mongoose.model('Comment');
var Notification = mongoose.model('Notification');

//renders page showing all ideas or ideas filtered by the search bar
router.get('/', function(req, res, next) {
    Idea.find(function(err, ideas, count) {
        if(req.query.search !== undefined && req.query.search !== ''){
            ideas = ideas.filter(function(i) { return i.title === req.query.search; });
        }
        res.render('ideas', {ideas: ideas});
    });
});

//renders the page for a specific idea
router.get('/:slug', function(req, res, next) {
    Idea.findOne({slug: req.params.slug}, function(err, i, count) {
        if(err || i === null) {
            return next(err);
        }
        //if the user is not signed in, render the public version of the idea
        else if(req.user === undefined) {
            User.findOne({_id: i.author}, function(err, u, count) {
                Comment.find({_id: {$in: i.comments}}, function(err, comments, count) {
                    //get author ideas and populate them for the idea
                    var commentAuthIDs = comments.map(getAuthor);
                    User.find({_id: {$in: commentAuthIDs}}, function(err, auths, count) {
                        for(var n = 0; n < commentAuthIDs.length; n++) {
                            comments[n].fullAuthor = auths.find(
                                compareAuthorIDs.bind(null, comments[n].author));
                        }
                        //render the populated idea
                        res.render('publicidea', {
                            idea: i, 
                            author: u, 
                            comments: comments, 
                        });
                    });

                });
            });
        }
        //if the user is signed in, render the signed in version
        else {
            var supportable = true;
            var joinable = true;
            if(i.supporters.indexOf(req.user._id) !== -1) {
                supportable = false;
            }
            if(i.potentialMembers.indexOf(req.user._id) !== -1) {
                joinable = false;
            }
            User.findOne({_id: i.author}, function(err, u, count) {
                Comment.find({_id: {$in: i.comments}}, function(err, comments, count) {
                    //get author ideas and populate them for the idea
                    var commentAuthIDs = comments.map(getAuthor);
                    User.find({_id: {$in: commentAuthIDs}}, function(err, auths, count) {
                        for(var n = 0; n < commentAuthIDs.length; n++) {
                            comments[n].fullAuthor = auths.find(
                                compareAuthorIDs.bind(null, comments[n].author));
                        }
                        //render the populated idea
                        res.render('idea', {
                            idea: i, 
                            author: u, 
                            comments: comments, 
                            supportable: supportable,
                            joinable: joinable
                        });
                    });
                });
            });
        }
    });
});

function getAuthor(c) {
    return c.author;
}

function compareAuthorIDs(id, a) {
    return a._id.toString() === id;
}

//handles when a user supports an idea
router.post('/:slug/support', function(req, res, next) {
    if(req.user === undefined)
        res.redirect('/login');
    else {
        Idea.findOne({slug: req.params.slug}, function(err, idea, count) {
            idea.supporters.push(req.user._id);
            var newNotif = new Notification({idea: idea._id, user: req.user._id, type: 'supported'});
            newNotif.save(function(err, n, count) {});
            User.findOne({_id: idea.author}, function(err, user, count) {
                user.notifications.push(newNotif._id);
                user.save(function(err, u, count) {});
                idea.save(function(err, i, count) {
                    res.redirect('/ideas/'+i.slug);
                });
            });
        });
    }
});

//handles when a user unsupports an idea
router.post('/:slug/unsupport', function(req, res, next) {
    if(req.user === undefined)
        res.redirect('/login');
    else {
        Idea.findOne({slug: req.params.slug}, function(err, idea, count) {
            var index = idea.supporters.indexOf(req.user._id);
            idea.supporters.splice(index, 1);
            idea.save(function(err, i, count) {
                res.redirect('/ideas/'+i.slug);
            });
        });
    }
});

//handles when a user joins an idea
router.post('/:slug/join', function(req, res, next) {
    if(req.user === undefined)
        res.redirect('/login');
    else {
        Idea.findOne({slug: req.params.slug}, function(err, idea, count) {
            idea.potentialMembers.push(req.user._id);
            var newNotif = new Notification({idea: idea._id, user: req.user._id, type: 'joined'});
            newNotif.save(function(err, n, count) {});
            User.findOne({_id: idea.author}, function(err, user, count) {
                user.notifications.push(newNotif._id);
                user.save(function(err, u, count) {});
                idea.save(function(err, i, count) {
                    res.redirect('/ideas/'+i.slug);
                });
            });
        });
    }
});

//handles when a user unjoins an idea
router.post('/:slug/unjoin', function(req, res, next) {
    if(req.user === undefined)
        res.redirect('/login');
    else {
        Idea.findOne({slug: req.params.slug}, function(err, idea, count) {
            var index = idea.potentialMembers.indexOf(req.user._id);
            idea.potentialMembers.splice(index, 1);
            idea.save(function(err, i, count) {
                res.redirect('/ideas/'+i.slug);
            });
        });
    }
});

//handles when a user submits the comment form on an idea
router.post('/:slug', function(req, res, next) {
    if(req.user === undefined)
        res.redirect('/login');
    else {
        Idea.findOne({slug: req.params.slug}, function(err, idea, count) {
            var newComment = new Comment({
                author: req.user._id, 
                notes: req.body.notes
            });
            console.log(newComment);
            console.log(req.user);
            newComment.save(function(err, c, count) {
                if(err)
                    res.redirect('/ideas/'+req.params.slug);
                else {
                    idea.comments.push(c);
                    var newNotif = new Notification({
                        idea: idea._id, user: req.user._id, type: 'commented on'
                    });
                    newNotif.save(function(err, n, count) {});
                    User.findOne({_id: idea.author}, function(err, user, count) {
                        user.notifications.push(newNotif._id);
                        user.save(function(err, u, count) {});
                        idea.save(function(err, i, count) {
                            res.redirect('/ideas/'+i.slug);
                        });
                    });
                }
            });
        });
    }
});

module.exports = router;
