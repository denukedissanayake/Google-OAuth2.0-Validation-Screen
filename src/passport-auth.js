const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./user-model')


passport.use( new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALL_BACK_URL 
    // prompt: 'select_account'
  },
  function(accessToken, refreshToken, profile, done) {

    // if(profile._json['email_verified'] == true  && profile._json['email'].split('@')[1].toString() == process.env.DOMAIN){
      if(profile._json['email'].split('@')[1].toString() == process.env.DOMAIN){

      User.findOne({googleId: profile.id}).then((currentUser)=> {
        if(currentUser){
          done(null, currentUser)
        }else{
          new User({
            username: profile.displayName,
            googleId: profile.id
          }).save().then((newUser) => {
            done(null, newUser)
          });
        }
      })
    }else{
      return done(null, null)
    }
  }
)); 

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
  User.findById(id).then((user) => {
    done(null, user);
  })
});