const db = require('../../modules/common.js').db();
const bodyParser = require('body-parser'); // post 전송용
const { signedCookie } = require('cookie-parser');

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

    // Local - guest
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
                                user_profile: null,
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
                        user_profile: info.user_profile,
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
                failureRedirect: '/', // 로그인 실패 후 이동
                failureFlash: false,
            }
        )
    );

    // Facebook
    const FacebookStrategy = require('passport-facebook').Strategy;
    passport.use(new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_ID,
            clientSecret: process.env.FACEBOOK_SECRET,
            callbackURL: '/auth/facebook/callback',
            passReqToCallback: true, // function 에서 req 사용 가능
        },
        function(req, accessToken, refreshToken, profile, done) {
            let id = profile.id;
            let username = profile.displayName;
            let email = profile.emails;
            let thumbnail = profile.profileUrl;
            let platform = 'facebook';
            db.query('SELECT * FROM test_user_social WHERE auth_id = ? AND platform = ?', [id, platform], function(err, rows, fields) {
                if(rows.length < 1) {
                    if(req.user) {
                        if(req.user.platform != 'local') return done(null, false);
                        db.query(
                            'UPDATE test_user_social SET platform = ?, auth_id = ?, user_name = ?, user_email = ?, user_profile = ?, user_connected_at = NOW() WHERE user_idx = ?',
                            [platform, id, username, email, thumbnail, req.user.user_idx],
                            function(err, rows, fields) {
                                if(err) return done(err);
                                let user = {
                                    user_idx: req.user.user_idx,
                                    user_name: username,
                                    user_id: id,
                                    user_email: email,
                                    user_profile: thumbnail,
                                    platform: platform,
                                }
                                done(null, user);
                            }
                        );
                    } else {
                        db.query(
                            'INSERT INTO test_user_social (platform, auth_id, user_name, user_email, user_profile, user_created_at, user_connected_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                            [platform, id, username, email, thumbnail],
                            function(err, rows, fields) {
                                if(err) return done(err);
                                let user = {
                                    user_idx: rows.insertId,
                                    user_name: username,
                                    user_id: id,
                                    user_email: email,
                                    user_profile: thumbnail,
                                    platform: platform,
                                }
                                done(null, user);
                            }
                        );
                    }
                } else {
                    let info = rows[0];
                    let user = {
                        user_idx: info.user_idx,
                        user_name: info.user_name,
                        user_id: info.auth_id,
                        user_email: info.user_email,
                        user_profile: info.user_profile,
                        platform: info.platform,
                    }
                    done(null, user);
                }
            });
        }
    ));
    router.get('/facebook', passport.authenticate('facebook'));
    router.get('/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/' }));

    // Google
    const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: "/auth/google/callback",
            passReqToCallback: true, // function 에서 req 사용 가능
        },
        function(req, token, tokenSecret, profile, done) {
            let id = profile.id;
            let username = profile.displayName;
            let email = profile.emails;
            let thumbnail = profile.photos[0].value;
            let platform = 'google';
            db.query('SELECT * FROM test_user_social WHERE auth_id = ? AND platform = ?', [id, platform], function(err, rows, fields) {
                if(rows.length < 1) {
                    if(req.user) {
                        if(req.user.platform != 'local') return done(null, false);
                        db.query(
                            'UPDATE test_user_social SET platform = ?, auth_id = ?, user_name = ?, user_email = ?, user_profile = ?, user_connected_at = NOW() WHERE user_idx = ?',
                            [platform, id, username, email, thumbnail, req.user.user_idx],
                            function(err, rows, fields) {
                                if(err) return done(err);
                                let user = {
                                    user_idx: req.user.user_idx,
                                    user_name: username,
                                    user_id: id,
                                    user_email: email,
                                    user_profile: thumbnail,
                                    platform: platform,
                                }
                                done(null, user);
                            }
                        );
                    } else {
                        db.query(
                            'INSERT INTO test_user_social (platform, auth_id, user_name, user_email, user_profile, user_created_at, user_connected_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                            [platform, id, username, email, thumbnail],
                            function(err, rows, fields) {
                                if(err) return done(err);
                                let user = {
                                    user_idx: rows.insertId,
                                    user_name: username,
                                    user_id: id,
                                    user_email: email,
                                    user_profile: thumbnail,
                                    platform: platform,
                                }
                                done(null, user);
                            }
                        );
                    }
                    
                } else {
                    let info = rows[0];
                    let user = {
                        user_idx: info.user_idx,
                        user_name: info.user_name,
                        user_id: info.auth_id,
                        user_email: info.user_email,
                        user_profile: info.user_profile,
                        platform: info.platform,
                    }
                    done(null, user);
                }
            });
        }
    ));
    router.get('/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));
    router.get('/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/' }));

    // Kakao
    const KakaoStrategy = require('passport-kakao').Strategy;
    passport.use(new KakaoStrategy({
            clientID : process.env.KAKAO_ID,
            clientSecret: process.env.KAKAO_SECRET,
            callbackURL : '/auth/kakao/callback',
            passReqToCallback: true, // function 에서 req 사용 가능
        },
        function(req, accessToken, refreshToken, profile, done) {
            let id = profile.id;
            let username = profile._json.properties.nickname;
            let email = profile._json.properties.email;
            let thumbnail = profile._json.properties.thumbnail_image;
            let platform = 'kakao'; // profile.provider
            db.query('SELECT * FROM test_user_social WHERE auth_id = ? AND platform = ?', [id, platform], function(err, rows, fields) {
                if(rows.length < 1) {
                    if(req.user) {
                        if(req.user.platform != 'local') return done(null, false);
                        db.query(
                            'UPDATE test_user_social SET platform = ?, auth_id = ?, user_name = ?, user_email = ?, user_profile = ?, user_connected_at = NOW() WHERE user_idx = ?',
                            [platform, id, username, email, thumbnail, req.user.user_idx],
                            function(err, rows, fields) {
                                if(err) return done(err);
                                let user = {
                                    user_idx: req.user.user_idx,
                                    user_name: username,
                                    user_id: id,
                                    user_email: email,
                                    user_profile: thumbnail,
                                    platform: platform,
                                }
                                done(null, user);
                            }
                        );
                    } else {
                        db.query(
                            'INSERT INTO test_user_social (platform, auth_id, user_name, user_email, user_profile, user_created_at, user_connected_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                            [platform, profile.id, profile.displayName, profile.emails, profile.profileUrl],
                            function(err, rows, fields) {
                                if(err) return done(err);
                                let user = {
                                    user_idx: rows.insertId,
                                    user_name: username,
                                    user_id: id,
                                    user_email: email,
                                    user_profile: thumbnail,
                                    platform: platform,
                                }
                                done(null, user);
                            }
                        );
                    }
                } else {
                    let info = rows[0];
                    let user = {
                        user_idx: info.user_idx,
                        user_name: info.user_name,
                        user_id: info.auth_id,
                        user_email: info.user_email,
                        user_profile: info.user_profile,
                        platform: info.platform,
                    }
                    done(null, user);
                }
            });
        }
    ));
    router.get('/kakao', passport.authenticate('kakao'));
    router.get('/kakao/callback', passport.authenticate('kakao', { successRedirect: '/', failureRedirect: '/' }));

    // Naver
    const NaverStrategy = require('passport-naver').Strategy;
    passport.use(new NaverStrategy(
        {
            clientID: process.env.NAVER_ID,
            clientSecret: process.env.NAVER_SECRET,
            callbackURL: '/auth/naver/callback',
            passReqToCallback: true, // function 에서 req 사용 가능
        },
        function(req, accessToken, refreshToken, profile, done) {
            let id = profile.id;
            let username = profile.displayName;
            let email = profile._json.email;
            let thumbnail = profile._json.profile_image;
            let platform = 'naver';
            db.query('SELECT * FROM test_user_social WHERE auth_id = ? AND platform = ?', [id, platform], function(err, rows, fields) {
                if(rows.length < 1) {
                    if(req.user) {
                        if(req.user.platform != 'local') return done(null, false);
                        db.query(
                            'UPDATE test_user_social SET platform = ?, auth_id = ?, user_name = ?, user_email = ?, user_profile = ?, user_connected_at = NOW() WHERE user_idx = ?',
                            [platform, id, username, email, thumbnail, req.user.user_idx],
                            function(err, rows, fields) {
                                if(err) return done(err);
                                let user = {
                                    user_idx: req.user.user_idx,
                                    user_name: username,
                                    user_id: id,
                                    user_email: email,
                                    user_profile: thumbnail,
                                    platform: platform,
                                }
                                done(null, user);
                            }
                        );
                    } else {
                        db.query(
                            'INSERT INTO test_user_social (platform, auth_id, user_name, user_email, user_profile, user_created_at, user_connected_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                            [platform, id, username, email, thumbnail],
                            function(err, rows, fields) {
                                if(err) return done(err);
                                let user = {
                                    user_idx: rows.insertId,
                                    user_name: username,
                                    user_id: id,
                                    user_email: email,
                                    user_profile: thumbnail,
                                    platform: platform,
                                }
                                done(null, user);
                            }
                        );
                    }
                    
                } else {
                    let info = rows[0];
                    let user = {
                        user_idx: info.user_idx,
                        user_name: info.user_name,
                        user_id: info.auth_id,
                        user_email: info.user_email,
                        user_profile: info.user_profile,
                        platform: info.platform,
                    }
                    done(null, user);
                }
            });
        }
    ));
    router.get('/naver', passport.authenticate('naver'));
    router.get('/naver/callback', passport.authenticate('naver', { successRedirect: '/', failureRedirect: '/' }));

    return router;
}
