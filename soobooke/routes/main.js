module.exports = function(app) {
    const express = require('express');
    const router = express.Router();

    const db = require('../modules/common.js').db();
    const crypt = require('../modules/crypto.js');
    const auth = require('../modules/auth.js');

    const multer  = require('multer');
    const upload = multer({ dest: 'uploads/' }); // fetch 전소용

    // HOME
    router.get('/', function(req, res) {
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(user && !user.user_idx) return res.redirect('/choose');
        res.render('main.ejs', { user: user, path: req.originalUrl });
    });
    // 로그인
    router.get('/login', function(req, res) {
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(user) {
            if(!user.user_idx) return res.redirect('/choose');
            else return res.redirect('/');
        }
        res.render('login/login.ejs', { user: user, path: req.originalUrl });
    });
    // 사용자 선택
    router.get('/choose', function(req, res) {
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(user && user.user_idx) return res.redirect('/');
        res.render('choose.ejs', { user: user, path: req.originalUrl });
    });
    router.get('/logout', function(req, res) {
        if(req.user) req.logout(); // passport session 삭제
        res.clearCookie('SBOOK.uid');
        res.redirect('/');
    });
    /* // GET /get/[params]?[query]=1
    router.get(['/get', '/get/:uid'], function(req, res) {
        console.log(req.params.uid);
        console.log(req.query.id);
        let ret = {
            success: false,
            message: null,
            code: 'get',
            data: null,
        }
        return res.status(404).json(ret);
    });
    // PUT
    router.put('/put', upload.none(), function(req, res) {
        console.log(req.body);
        let ret = {
            success: false,
            message: null,
            code: 'put',
            data: null,
        }
        return res.status(404).json(ret);
    });
    // POST
    router.post('/post', upload.none(), function(req, res) {
        console.log(req.body);
        let ret = {
            success: false,
            message: null,
            code: 'post',
            data: null,
        }
        return res.status(404).json(ret);
    });
    // DELETE
    router.delete('/delete', upload.none(), function(req, res) {
        console.log(req.body);
        let ret = {
            success: false,
            message: null,
            code: 'delete',
            data: null,
        }
        return res.status(404).json(ret);
    }); */









    // Guide - 이용안내
    router.get('/guide', function(req, res) {
        res.render('guide.ejs', { user: req.user, path: req.originalUrl });
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
