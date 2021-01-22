module.exports = function(app) {
    const express = require('express');
    // pbkdf2-password
    const bkfd2Password = require('pbkdf2-password');
    const hasher = bkfd2Password();
    // passport & passport-local
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    let route = express.Router();

    app.use(passport.initialize());
    app.use(passport.session());

    let users = [
        {
            useremail: '11@11.com',
            username: 'lsk',
            password: 'm1ZA9SJC/oN+YPYscwNxMsVfcV429A7ddwE/LzvcgBt8ARPwafnMsV5wFEa9IC40dNZbeJfg2v3XYhGjsnEGF6FglqSqlAefFySTUCbQy48qhd5ETIEdmUHvV9SZmZ7d/G3gc6GIeZkvPy9ZiLdQEsfC7rZdoJH4lNZXrMeILbc=',
            salt: 'HHNIir/DDLCzW/HB0pXymoZk6S+pBPdpjyzp5G/IHwDFlAjTHVjsxJtoL4pb+weWasNUQJIcBiw2M6bHY7pYMQ=='
        }, // 1111
        {
            useremail: 'prog106@gmail.com',
            username: 'prog106',
            password: 'SIbV/yqlLH/1LxkFct9kkkid8g2O1sLkKQY8SiW1tfBrJgMf7TH7H/ULHePtLGzzF/MFk2AM2s3aAHOSTb/6c+Osre/sWolYhmbyK/EovSi57wBgZnpUPW8BmeGrPedYmKtBz4Obg9WFO59IhGisecbt27bD/7H4Ns9hqTQbtrY=',
            salt: 'AfV2im9/lCflOQcA8rgPSmGf43mZWy+m+FubMRDEbBHJpgIY7Jg7LchixLdpPW1T0HnVW4bJDjApimJq5QTwSw=='
        } // 1234
    ];

    passport.serializeUser(function(user, done) { // 로그인 성공시 실행
        done(null, user.useremail); // req.user.useremail 에 user.useremail 가 session 에 저장됨. >> /auth/welcome 에서 확인
    });

    passport.deserializeUser(function(id, done) { // passport.serializeUser 에서 저장된 session의 user.useremail 값을 가지고 회원이 정상적인 회원인지 체크하는 로직. id 에는 user.useremail 이 들어옴. 로그인 후 사용자 session 정보 확인하는 로직.
        // console.log(id);
        for(let i=0; i<users.length; i++) {
            let user = users[i];
            if(user.useremail === id) {
                return done(null, user);
            }
        }
    });

    passport.use(new LocalStrategy(
        {
            usernameField: 'email', // form ID 이름 변경이 필요할 때 사용. 기본 username
            passwordField: 'pwd', // form PW 이름 변경이 필요할 때 사용. 기본 password
        },
        function(username, password, done) {
            for(let i=0; i<users.length; i++) {
                let user = users[i];
                if(user.username === username) {
                    return hasher({password: password, salt: user.salt}, function(err, pass, salt, hash) {
                        if(hash === user.password) {
                            done(null, user); // 로그인 성공시 user는 passport.serializeUser() 의 user로 전달
                        } else {
                            done(null, false); // failureFlash: false 일 경우 세번째 인자 사용 안함
                        }
                    });
                }
            }
            done(null, false); // failureFlash: true 일 경우 세번째 인자 사용 가능 - done(null, false, {message: 'Incorrect Username'}); 
        }
    ));

    route.get('/form', function(req, res) {
        res.render('auth/form.ejs');
    });

    route.get('/welcome', function(req, res) {
        // console.log(req.user);
        // console.log(req.session);
        if(req.user && req.user.useremail) {
            res.send(`<h1>Welcome! ${req.user.useremail}</h1><br><a href="/auth/logout">Logout</a>`);
        } else {
            res.send(`<h1>Login Fail</h1><br><a href="/auth/form">Go Login</a>`);
        }
    })

    route.post(
        '/login',
        passport.authenticate( // middleware - 콜백함수를 만들어 줌. - passport.use() 를 호출
            'local', // LocalStrategy 실행
            {
                successRedirect: '/auth/welcome', // 로그인 성공 후 이동
                failureRedirect: '/auth/form', // 로그린 실패 후 이동
                failureFlash: false, // 실패 정보 노출 여부 - hasher 에서 done 컨트롤 때 사용
            }
        )
    );

    route.get('/logout', function(req, res) {
        req.logout(); // 로그아웃
        req.session.save(function() { // session 이 사라진 것을 확인 후 이동
            res.redirect('/auth/form');
        });
    });

    return route;
}
