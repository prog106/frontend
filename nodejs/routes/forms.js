const express = require('express');
const router = express.Router();

module.exports = function () {
    // 회원가입
    router.get('/join', function(req, res) {
        if(req.session.user_idx) {
            return res.redirect('/');
        }
        res.render('forms/join.ejs');
    });
    // 로그인
    router.get('/login', function(req, res) {
        if(req.session.user_idx) {
            return res.redirect('/');
        }
        res.render('forms/login.ejs');
    });
    // 로그아웃
    router.get('/logout', function(req, res) {
        req.session.destroy(function(err) {
            res.redirect('/');
        });
    });
    return router;
}
