module.exports = function(app) {
    const express = require('express');
    const passport = require('passport');
    const cookieParser = require('cookie-parser');

    app.use(passport.initialize());
    app.use(passport.session());

    let router = express.Router();

    router.get('/lotto', function(req, res) {
        if(!req.user) {
            res.redirect('/logout');
            return false;
        }
        res.render('game/lotto.ejs', {
            user_idx: req.user.user_idx,
            user_name: req.user.user_name,
            user_email: req.user.user_email,
        });
    });
    router.get('/minesweeper', function(req, res) {
        if(!req.user) {
            res.redirect('/logout');
            return false;
        }
        res.render('game/minesweeper.ejs', {
            user_idx: req.user.user_idx,
            user_name: req.user.user_name,
            user_email: req.user.user_email,
        });
    });
    router.get('/speed', function(req, res) {
        if(!req.user) {
            res.redirect('/logout');
            return false;
        }
        res.render('game/speed.ejs', {
            user_idx: req.user.user_idx,
            user_name: req.user.user_name,
            user_email: req.user.user_email,
        });
    });
    router.get('/jasstone', function(req, res) {
        if(!req.user) {
            res.redirect('/logout');
            return false;
        }
        res.render('game/jasstone.ejs', {
            user_idx: req.user.user_idx,
            user_name: req.user.user_name,
            user_email: req.user.user_email,
        });
    });
    return router;
};
