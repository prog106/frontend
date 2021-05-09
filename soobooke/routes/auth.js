module.exports = function(app) {
    const db = require('../modules/common.js').db();
    const express = require('express');
    const passport = require('passport');
    const multer  = require('multer');
    const crypt = require('../modules/crypto.js');
    const flash = require('connect-flash');
    const upload = multer({ dest: 'uploads/' });

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    const router = express.Router();

    passport.serializeUser(function(user, done) { // 로그인 성공시 실행
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    // auth - login & signin ( guest & social )
    let auth = require('../modules/auth.js');

    // Local - guest
    const LocalStrategy = require('passport-local').Strategy;
    passport.use(new LocalStrategy(
        {
            usernameField: 'user_login_code', // form ID 이름 변경이 필요할 때 사용. 기본 username
            passwordField: 'user_login_code', // form PW 이름 변경이 필요할 때 사용. 기본 password
            // passReqToCallback : true,
        },
        function(username, password, done) {
            // 비회원 일 경우
            let id = username;
            let pwd = password;
            let platform = 'local';
            auth.local(db, id, platform, done);
        }
    ));
    router.post(
        '/code',
        passport.authenticate( // middleware - 콜백함수를 만들어 줌. - passport.use() 를 호출
            'local', // LocalStrategy 실행
            {
                successRedirect: '/', // 로그인 성공 후 이동
                failureRedirect: '/login', // 로그인 실패 후 이동
                failureFlash: true,
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
            auth.social(db, req, id, username, email, thumbnail, platform, done);
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
            auth.social(db, req, id, username, email, thumbnail, platform, done);
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
            auth.social(db, req, id, username, email, thumbnail, platform, done);
        }
    ));
    router.get('/kakao', passport.authenticate('kakao'));
    router.get('/kakao/callback', passport.authenticate('kakao', { successRedirect: '/auth/kakao/success', failureRedirect: '/auth/kakao/failure', failureFlash: true }));
    router.get('/kakao/success', function(req, res) {
        if(req.user) res.cookie('SBOOK.uid', crypt.encrypt(JSON.stringify(req.user)), { signed: true, expires: new Date(Date.now() + 1000 * 60 * process.env.COOKIE_EXPIRE), httpOnly: true });
        res.render('login/kakao/success.ejs');
    });
    router.get('/kakao/failure', function(req, res) {
        let error = req.flash('error')[0];
        res.render('login/kakao/failure.ejs');
    });

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
            auth.social(db, req, id, username, email, thumbnail, platform, done);
        }
    ));
    router.get('/naver', passport.authenticate('naver'));
    router.get('/naver/callback', passport.authenticate('naver', { successRedirect: '/', failureRedirect: '/' }));

    return router;
}
