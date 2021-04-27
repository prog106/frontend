const db = require('../modules/common.js').db();
const flash = require('connect-flash');

module.exports = function(app) {
    const express = require('express');
    const passport = require('passport');
    const cookieParser = require('cookie-parser');

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키 암호화

    const router = express.Router();

    // HOME
    router.get('/member', function(req, res) {
        // console.log(__dirname); // /Users/.../fronent/soobooke/routes
        if(!req.user || !req.user.parent_user_idx) {
            res.redirect('/logout');
            return false;
        }
        res.render('member.ejs', { user: req.user, path: req.originalUrl });
    });
    router.get('/', function(req, res) {
        if(req.user) {
            if(!req.user.user_idx) {
                res.redirect('/member');
                return false;
            }
        }
        res.render('index.ejs', { user: req.user, path: req.originalUrl });
    });
    router.get('/bookshelf', function(req, res) {
        if(req.user) {
            if(!req.user.user_idx) {
                res.redirect('/member');
                return false;
            }
        }
        res.render('bookshelf/bookshelf.ejs', { user: req.user, path: req.originalUrl });
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
            if(!req.user.user_idx) {
                res.redirect('/member');
            } else {
                res.redirect('/');
            }
            return false;
        }
        res.render('login/login.ejs', { user: req.user, path: req.originalUrl, err: req.flash('error')[0] });
    });
    router.get('/logout', function(req, res) {
        req.logout(); // passport session 삭제
        req.session.save(function() { // session 이 사라진 것을 확인 후 이동
            res.redirect('/');
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
