var mongoose = require('mongoose'),
    URLSlugs = require('mongoose-url-slugs'),
    passportLocalMongoose = require('passport-local-mongoose');

var Idea = new mongoose.Schema({});
var Notification = new mongoose.Schema({});

var User = new mongoose.Schema({
    firstName: {
            type: String,
            required: true
        },
    lastName: {
            type: String,
            required: true
        },
    email: {
            type: String,
            required: true
        },
    bio: {
            type: String,
            required: true
        },
    linkedin: String,
    ideas: [String],                //idea ids
    notifications: [String]         //notification ids
});

var Comment = new mongoose.Schema({
    author: {
            type: String,           //user's id
            required: true
        },
    notes: {
            type: String,
            required: true
        }
});

Idea = new mongoose.Schema({
    author: {
            type: String,           //user's id
            required: true
        },
    title: {
            type: String,
            required: true
        },
    description: {
            type: String,
            required: true
        },
    potentialMembers: [String],     //user ids
    supporters: [String],           //user ids
    comments: [Comment],
    createdDate: {
            type: Date,
            required: true
        }
});

Notification = new mongoose.Schema({
    idea: String,                   //idea id
    user: String,                   //id of user who initiated the notification
    type: String                    //supported, joined, or commented
});

Idea.plugin(URLSlugs('title'));
User.plugin(passportLocalMongoose);


mongoose.model('User', User);
mongoose.model('Comment', Comment);
mongoose.model('Idea', Idea);
mongoose.model('Notification', Notification);

// is the environment variable, NODE_ENV, set to PRODUCTION? 
if (process.env.NODE_ENV == 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 var fs = require('fs');
 var path = require('path');
 var fn = path.join(__dirname, 'config.json');
 var data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 var conf = JSON.parse(data);
 var dbconf = conf.dbconf; 
} else {
 // if we're not in PRODUCTION mode, then use
 //dbconf = 'mongodb://localhost/final-project';
 dbconf = 'mongodb://heroku_phkshczd:eqpjtncvegc9jumevpl9gb22hj@ds127968.mlab.com:27968/heroku_phkshczd';
}

mongoose.connect(dbconf);
