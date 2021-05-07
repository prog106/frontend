const db = require('../modules/common.js').db();
const flash = require('connect-flash');

module.exports = function(app) {
    const express = require('express');
    const passport = require('passport');
    const crypt = require('../modules/crypto.js');

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    const router = express.Router();
    const auth = require('../modules/auth.js');

    // HOME
    router.get('/', function(req, res) {
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        res.render('index.ejs', { user: user, path: req.originalUrl });
    });
    // Guide - 이용안내
    router.get('/guide', function(req, res) {
        res.render('guide.ejs', { user: req.user, path: req.originalUrl });
    });
    // 사용자 선택
    router.get('/member', function(req, res) {
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(user && user.user_idx) {
            res.redirect('/');
            return false;
        }
        res.render('member.ejs', { user: user, path: req.originalUrl });
    });
    router.get('/bookaudio', function(req, res) {
        if(req.user) {
            if(!req.user.user_idx) {
                res.redirect('/member');
                return false;
            }
        }
        res.render('bookaudio/bookaudio.ejs', { user: req.user, path: req.originalUrl });
    });
    router.get('/login', function(req, res) {
        if(req.user) {
            res.cookie('SBOOK.uid', crypt.encrypt(JSON.stringify(req.user)), { signed: true, expires: new Date(Date.now() + 1000 * 60 * 3), httpOnly: true });
            res.redirect('/member'); // referrer url
            return false;
        }
        res.render('login/login.ejs', { user: req.user, path: req.originalUrl });
    });
    router.get('/logout', function(req, res) {
        req.logout(); // passport session 삭제
        req.session.save(function() { // session 이 사라진 것을 확인 후 이동
            // res.redirect('/');
            res.render('login/logout.ejs', { user: req.user, path: req.originalUrl })
        });
    });
    // /mylove?id=2
    // router.get('/mylove', function(req, res) {
    //     res.render('mylove.ejs', { user: req.query.id });
    // });
    // router.get('/chat', function(req, res) {
    //     if(!req.user) {
    //         res.redirect('/logout');
    //         return false;
    //     }
    //     res.render('chat/index.ejs', {
    //         user_idx: req.user.user_idx,
    //         user_name: req.user.user_name,
    //         user_email: req.user.user_email,
    //     });
    // });
    // router.get('/single', function(req, res) {
    //     if(!req.user) {
    //         res.redirect('/logout');
    //         return false;
    //     }
    //     res.render('chat/single.ejs', {
    //         user_idx: req.user.user_idx,
    //         user_name: req.user.user_name,
    //         user_email: req.user.user_email,
    //     });
    // });
    // // 로그인 상태 확인
    // router.post('/state', function(req, res) {
    //     let ret = {
    //         success: false,
    //         message: null,
    //     }
    //     if(!req.user) return res.json(ret);
    //     ret.success = true;
    //     return res.json(ret);
    // });
    return router;
}
