module.exports = function(app) {
    const express = require('express');
    const passport = require('passport');
    const cookieParser = require('cookie-parser');

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키 암호화

    const router = express.Router();

    // HOME
    router.get('/', function(req, res) {
        if(req.user) {
            if(!req.signedCookies.use_user) {
                res.render('select.ejs', { user: req.user });
            } else {
                res.render('index.ejs', { user: req.user, use_user: req.signedCookies.use_user });
            }
        } else {
            res.render('non_index.ejs', { user: req.user });
        }
    });
    router.get('/bookshelf', function(req, res) {
        if(req.user) {
            if(!req.signedCookies.use_user) {
                res.render('select.ejs', { user: req.user });
            } else {
                res.render('bookshelf/bookshelf.ejs', { user: req.user });
            }
        } else {
            res.render('non_index.ejs', { user: req.user });
        }
    });
    router.get('/login', function(req, res) {
        if(req.user) {
            res.redirect('/');
            return false;
        }
        res.render('login/login.ejs', { user: req.user });
    });
    // /mylove?id=2
    router.get('/mylove', function(req, res) {
        res.render('mylove.ejs', { user: req.query.id });
    });
    router.get('/logout', function(req, res) {
        req.logout(); // passport session 삭제
        req.session.save(function() { // session 이 사라진 것을 확인 후 이동
            if(req.signedCookies.use_user) res.clearCookie('use_user');
            res.redirect('/');
        });
    });

    router.get('/chat', function(req, res) {
        if(!req.user) {
            res.redirect('/logout');
            return false;
        }
        res.render('chat/index.ejs', {
            user_idx: req.user.user_idx,
            user_name: req.user.user_name,
            user_email: req.user.user_email,
        });
    });
    router.get('/single', function(req, res) {
        if(!req.user) {
            res.redirect('/logout');
            return false;
        }
        res.render('chat/single.ejs', {
            user_idx: req.user.user_idx,
            user_name: req.user.user_name,
            user_email: req.user.user_email,
        });
    });
    // 로그인 상태 확인
    router.post('/state', function(req, res) {
        let ret = {
            success: false,
            message: null,
        }
        if(!req.user) return res.json(ret);
        ret.success = true;
        return res.json(ret);
    });
    return router;
}
