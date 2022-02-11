require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const passport = require('passport')
const mongoose = require('mongoose')
const cookieSession = require('cookie-session')

require('./passport-auth')

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(cookieSession({
    name: 'my-session',
    keys: [process.env.KEY1, process.env.KEY2], //Encrption IDs
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(passport.initialize());
app.use(passport.session());

const checkIsLoggedInWhenLoggedIn = (req, res, next) => {
    if(req.user){
        next()
    }else{
        res.send('<h1> <a href="/google">Authenticate with Google</a> </h1>' )
    }
}

const checkIsLoggedInWhenNotLoggedIn = (req, res, next) =>{
    if(req.user){
        res.redirect('/sucess');
    }else{
        next()
    }
}

app.get('/', checkIsLoggedInWhenNotLoggedIn  , (req, res) => {
    res.send('<h1><a href="/google">Authenticate with Google</a></h1>')
})

app.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email']}));

app.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/faild', successRedirect: '/sucess' }),
);

app.get('/sucess', checkIsLoggedInWhenLoggedIn  ,(req, res) => {
    // console.log(req.user)
    res.send(`<h1> Hello ${req.user.username} <br> <a href="/logout">Logout</a> </h1>`)
})

app.get('/faild', (req, res) => {
    res.send(`<h1> Not a user from the Organaization <br> <a href="/google">Try with Organaization Email</a> </h1>`)
})

app.get('/logout', (req, res) => {
    req.session = null
    req.logout()
    res.redirect('/')
})

mongoose.connect(process.env.MONGODB_URL , () => {
    console.log('MongoDB is Connected')
})

app.listen(process.env.PORT, () => {
    console.log(`Listning to Port ${process.env.PORT}`)
})