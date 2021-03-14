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
            if(req.user.platform == 'local') {
                if(!req.signedCookies['guest.sid']) {
                    res.cookie('guest.sid', req.user.user_id, { signed: true, expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 100), httpOnly: true }); // 영구쿠키
                }
            } else {
                if(req.signedCookies['guest.sid']) {
                    res.clearCookie('guest.sid'); // 비회원 정책에 따라 처리 필요
                }
            }
        }
        res.render('index.ejs', { user: req.user, guest: req.signedCookies['guest.sid'] });
    });
    router.get('/logout', function(req, res) {
        req.logout(); // passport session 삭제
        req.session.save(function() { // session 이 사라진 것을 확인 후 이동
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
