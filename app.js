/******************************************
 *  Author : Harsh Jagdishbhai Kevadia   
 *  Created On : Fri Jul 21 2017
 *  File : app.js
 *******************************************/
const express = require('express');
const bodyParser = require('body-parser');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');

const data = require("./data");

const static = express.static(__dirname + '/public');
const configRoutes = require("./routes");

passport.use(new LocalStrategy(
    function (email, password, done) {
        let vendor = data.vendors.getVendorByEmail(email);
        if (vendor === undefined) {
            return done("Saloon is not found");
        }
        else {
            bcrypt.compare(password, vendor.hashedPassword, function (err, res) {
                if (err) {
                    return done(err);
                }
                if (res === true) {
                    return done(null, saloonDetails);
                }
                else if (res === false) {
                    return done(null, false);
                }
            });
        }
    }
));

passport.serializeUser((vendor, obj) => {
    obj(null, vendor._id);
});

passport.deserializeUser((id, obj) => {
    let vendorDetails = data.vendors.getVendorById(id);
    if (vendorDetails === undefined) {
        return obj("There is error");
    }
    else {
        obj(null, vendorDetails);
    }
});

const app = express();

const handlebarsInstance = exphbs.create({
    defaultLayout: 'main',
    // Specify helpers which are only registered on this instance.
    helpers: {
        asJSON: (obj, spacing) => {
            if (typeof spacing === "number")
                return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
            return new Handlebars.SafeString(JSON.stringify(obj));
        }
    }
});

app.use(bodyParser.json()); // for parsing application/json

app.use("/public", static);
app.use(bodyParser.urlencoded({ extended: true }));

app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

/* app.get('/vendor',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        res.render('pages/private', { userInfo: req.user });
    });

app.get('/login',
    function (req, res) {
        res.render('pages/login');
    });

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/');
    });

app.get('/private',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        res.render('pages/private', { userInfo: req.user });
    }); */



configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3000");
});