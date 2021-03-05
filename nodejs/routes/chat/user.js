const db = require('../../modules/common.js').db();
const bodyParser = require('body-parser'); // post 전송용
const moment = require('moment');
moment.locale('ko');

module.exports=function(app) {
    const express = require('express');
    const passport = require('passport');

    let router = express.Router();

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(bodyParser.urlencoded({extended: false})); // post 전송용

    passport.serializeUser(function(user, done) { // 로그인 성공시 실행
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    // 회원정보
    router.get('/info', function(req, res) {
        let user_idx = req.user.user_idx;
        if(!user_idx) return res.redirect('/logout');
        db.query('SELECT * FROM test_user_social WHERE user_idx = ?', [user_idx], function(err, rows, fields) {
            if(rows.length < 1) return res.render('error.ejs', {'message': 'login error, retry!', 'location': '/logout'});
            let user = rows[0];
            return res.render('auth/info.ejs', { user: req.user });
        });
    });

    return router;
}
