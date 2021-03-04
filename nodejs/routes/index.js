module.exports = function(app) {
    const express = require('express');
    const passport = require('passport');
    const cookieParser = require('cookie-parser');

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(cookieParser(process.env.COOKIE_SECRET));

    const router = express.Router();

    // HOME
    router.get('/', function(req, res) {
        if(req.user) {
            if(!req.signedCookies.guest) {
                res.cookie('guest', req.user.user_id, { signed: true, expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 100), httpOnly: true });
            }
        }
        res.render('index.ejs', { user: req.user, guest: req.signedCookies.guest });
    });
    router.get('/logout', function(req, res) {
        req.logout(); // passport session 삭제
        req.session.save(function() { // session 이 사라진 것을 확인 후 이동
            res.redirect('/');
        });
    });
    router.get('/chat', function(req, res) {
        res.render('chat/index.ejs', {
            user_idx: req.session.user_idx,
            user_name: req.session.user_name,
            user_email: req.session.user_email,
        });
    });
    router.get('/io', function(req, res) {
        res.render('chat/io.ejs');
    });
    return router;
}
