#IdeaHub 
###The Entrepreneurial Playground Where Dreams Come True

##Overview
People often have ideas that they believe can bloom into a successful business, but lack the resources to take the first step. Wouldn't it be nice to have a single place where you can see how successful your idea might be, find team members, and get advice from other experienced entrepreneurs?

IdeaHub will be the a single place where all that can be done! Users can create there own profiles, post ideas, and share their opinions on the success-rate of others' ideas!

##Data Model
We store users, idea posts, comments, and notifications
 - each user has a profile, idea posts, and notifications
 - each idea post additionally contains a list of supporters (essentially likes), potential team members, and comments
 - users get notifications when any user supports, joins, or comments on one of their ideas
 - Schema:
```
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
    ideas: [String],            //idea ids
    notifications: [String]     //notification ids
});

var Comment = new mongoose.Schema({
    author: {
            type: String,       //user's id
            required: true
        },
    notes: {
            type: String,
            required: true
        }
});

Idea = new mongoose.Schema({
    author: {
            type: String,       //user's id
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
    potentialMembers: [String], //user ids
    supporters: [String],       //user ids
    comments: [Comment],
    createdDate: {
            type: Date,
            required: true
        }
});

Notification = new mongoose.Schema({
    idea: String,               //idea id
    user: String,               //id of user who initiated the notification
    type: String                //supported, joined, or commented
});

Idea.plugin(URLSlugs('title'));
User.plugin(passportLocalMongoose);
```

##Wireframes
/registration - page for registering a new user
![registration](/documents/register.jpg?raw=true)
/login - page for logging in
![login](/documents/login.jpg?raw=true)
/ideaHub - page displaying ideas
![ideaHub](/documents/ideaHub.jpg?raw=true)
/ideas/:slug - page displaying idea when the user is not signed in
![ideas-slug-unsigned](/documents/ideas-slug-unsigned.jpg?raw=true)
/ideas/:slug - page displaying idea when the user is signed in
![ideas-slug-signed](/documents/ideas-slug-signed.jpg?raw=true)
/ideas - page displaying all ideas
![ideas](/documents/ideas.jpg?raw=true)
/myAccount - page allowing the user to see their own ideas and notifications
![myAccount](/documents/myAccount.jpg?raw=true)
/myAccount/editProfile - form for editing the user's own profile
![myAccount-editProfile](/documents/myAccount-editProfile.jpg?raw=true)
/myAccount/newIdea - form for creating a new idea
![myAccount/newIdea](/documents/myAccount-newIdea.jpg?raw=true)
/profile/:id - page for viewing other users' profiles
![profile](/documents/profile.jpg?raw=true)

##Site Map
![site-map](/documents/site-map.jpg?raw=true)

##User Stories
1. as a user, I can create ideas
2. as a user, I can get notifications of activity on my ideas
3. as a user, I can comment on ideas
4. as a user, I can support ideas
5. as a user, I can ask to become a potential member of ideas
6. as a user, I can view other existing ideas
7. as a user, I can search for ideas
8. as a user, I can edit my profile
9. as a user, I can view others' profiles

##Research Topics
 - (6 points) Integrate User Authentification
     - Allow users to maintain an account and sign in and out.
     - Using passport-local-mongoose
 - (2 points) Use a CSS framework throughout your site, use a reasonable of customization of the framework 
     - Customized a theme with Bootstrap
     - Made the site memorable and visually appealing

