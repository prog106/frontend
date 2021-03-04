const db = require('../../modules/common.js').db();
const bodyParser = require('body-parser'); // post 전송용
const moment = require('moment');
moment.locale('ko');

module.exports=function(app) {
    const express = require('express');
    const passport = require('passport');

    const bkfd2Password = require('pbkdf2-password');
    const hasher = bkfd2Password();

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

    // Local
    const LocalStrategy = require('passport-local').Strategy;
    passport.use(new LocalStrategy(
        {
            usernameField: 'userid', // form ID 이름 변경이 필요할 때 사용. 기본 username
            passwordField: 'username', // form PW 이름 변경이 필요할 때 사용. 기본 password
        },
        function(username, password, done) {
            // 비회원 일 경우 platform:local, auth_id:guest1234, user_name, user_email, user_profile, user_created_at
            let id = username;
            let name = password;
            let platform = 'local';
            db.query('SELECT * FROM test_user_social WHERE auth_id = ? AND platform = ?', [username, platform], function(err, rows, fields) {
                if(rows.length < 1) {
                    db.query(
                        'INSERT INTO test_user_social (platform, auth_id, user_name, user_email, user_profile, user_created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                        [platform, id, name, '', ''],
                        function(err, rows, fields) {
                            let user = {
                                user_idx: rows.insertId,
                                user_name: name,
                                user_id: id,
                                user_email: null, // local 은 이메일 없음.
                                platform: platform,
                            }
                            done(null, user);
                        }
                    );
                } else {
                    let info = rows[0];
                    let user = {
                        user_idx: info.user_idx,
                        user_name: info.user_name,
                        user_id: info.auth_id,
                        user_email: info.user_email,
                        platform: info.platform,
                    }
                    done(null, user);
                }
            });
        }
    ));
    router.post(
        '/guest',
        passport.authenticate( // middleware - 콜백함수를 만들어 줌. - passport.use() 를 호출
            'local', // LocalStrategy 실행
            {
                successRedirect: '/', // 로그인 성공 후 이동
                failureRedirect: '/login', // 로그인 실패 후 이동
                failureFlash: false,
            }
        )
    );

    // Facebook
    const FacebookStrategy = require('passport-facebook').Strategy;
    passport.use(new FacebookStrategy(
        {
            clientID: '340703400619795',
            clientSecret: '50471e9ee0b794d41fa0bf45b4b82fb6',
            callbackURL: "/auth/facebook/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            db.query('SELECT * FROM test_user_social WHERE auth_id = ? AND platform = ?', [profile.id, 'facebook'], function(err, rows, fields) {
                if(rows.length < 1) {
                    db.query(
                        'INSERT INTO test_user_social (platform, auth_id, user_name, user_email, user_profile, user_created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                        [profile.provider, profile.id, profile.displayName, profile.emails, profile.profileUrl],
                        function(err, rows, fields) {
                            let user = {
                                user_idx: rows.insertId,
                                user_name: profile.displayName,
                                user_id: profile.id,
                                user_email: '', // facebook 은 이메일 안줌.
                                platform: profile.provider,
                            }
                            done(null, user);
                        }
                    );
                } else {
                    let info = rows[0];
                    let user = {
                        user_idx: info.user_idx,
                        user_name: info.user_name,
                        user_id: info.auth_id,
                        user_email: info.user_email,
                        platform: info.platform,
                    }
                    done(null, user);
                }
            });
        }
    ));
    router.get('/facebook', passport.authenticate('facebook'));
    router.get('/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));



    // router.get('/', function(req, res) {
    //     // console.log(req.session.passport.user);
    //     // console.log(req.user);
    //     res.send(`<h1>Welcome ${req.user.user_name}</h1><br><a href="/">Home</a> | <a href="/social/logout">logout</a>`);
    // });
    
    return router;
}
