const db = require('../modules/common.js').db();

module.exports=function(app) {
    const express = require('express');
    const passport = require('passport');
    FacebookStrategy = require('passport-facebook').Strategy;
    let route = express.Router();

    // const bodyParser = require('body-parser'); // post 전송용
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) { // 로그인 성공시 실행
        done(null, user); // req.user.useremail 에 user.useremail 가 session 에 저장됨. >> /auth/welcome 에서 확인
    });

    passport.deserializeUser(function(user, done) { // passport.serializeUser 에서 저장된 session의 user.useremail 값을 가지고 회원이 정상적인 회원인지 체크하는 로직. id 에는 user.useremail 이 들어옴. 로그인 후 사용자 session 정보 확인하는 로직.
        done(null, user);
    });

    passport.use(new FacebookStrategy(
        {
            clientID: '340703400619795',
            clientSecret: '50471e9ee0b794d41fa0bf45b4b82fb6',
            callbackURL: "/social/auth/facebook/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            db.query('SELECT * FROM test_user WHERE auth_id = ? AND platform = ?', [profile.id, 'facebook'], function(err, rows, fields) {
                if(rows.length < 1) {
                    db.query(
                        'INSERT INTO test_user (user_name, auth_id, platform) VALUES (?, ?, ?)',
                        [profile.displayName, profile.id, 'facebook'],
                        function(err, rows, fields) {
                            let newuser = {
                                user_idx: rows.insertId,
                                user_name: profile.displayName,
                                user_email: '', // facebook 은 이메일 안줌.
                            }
                            done(null, newuser);
                        }
                    );
                } else {
                    done(null, rows[0]);
                }
            });
        }
    ));

    route.get('/', function(req, res) {
        // console.log(req.session.passport.user);
        // console.log(req.user);
        res.send(`<h1>Welcome ${req.user.user_name}</h1><br><a href="/">Home</a> | <a href="/social/logout">logout</a>`);
    });
    route.get('/auth/facebook', passport.authenticate('facebook'));
    route.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/social/', failureRedirect: '/social/login' }));
    route.get('/login', function(req, res) {
        // console.log(req.session);
        // console.log(req.user);
        res.send(`<a href="/">Home</a> | <a href="/social/auth/facebook">Facebook</a>`);
    });
    route.get('/logout', function(req, res) {
        req.logout(); // passport session 삭제
        req.session.save(function() { // session 이 사라진 것을 확인 후 이동
            res.redirect('/social/login');
        });
    });

    return route;
}
