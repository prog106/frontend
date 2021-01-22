const express = require('express');
const router = express.Router();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const bkfd2Password = require('pbkdf2-password');
const hasher = bkfd2Password();

const mysql = require('mysql');
const db = mysql.createConnection({
    host: '',
    port: '3306',
    user: '',
    password: '',
    database: '',
});

module.exports = function(app) {

    app.use(passport.initialize());
    app.use(passport.session()); // session 설정한 환경에서 작동

    // 3. middleware - 로그인 성공시 실행
    passport.serializeUser(function(user, done) {
        // passport session 저장하기
        console.log(user);
        done(null, user.user_idx);
    });

    // 4. middleware - 사용자 재접속시 passport.serializeUser 에서 저장된 session의 user.useremail 값을 가지고 회원이 정상적인 회원인지 체크. 로그인 후 사용자 session 정보 확인하는 로직.
    passport.deserializeUser(function(id, done) {  // id 에는 user.useremail 이 들어옴.
        done(null, id);
    });

    // 2. middleware - 로그인 시도시 실행
    passport.use(new LocalStrategy(
        {
            usernameField: 'email', // form ID 이름 변경이 필요할 때 사용. 기본 username
            passwordField: 'pwd', // form PW 이름 변경이 필요할 때 사용. 기본 password
        },
        function(username, password, done) {
            db.query('SELECT * FROM test_user WHERE user_email = ?', [username], function(err, rows, fields) {
                if(rows) {
                    let user = rows[0];
                    return hasher({password: password, salt: user.user_pwd_salt}, function(err, pass, salt, hash) {
                        if(hash === user.user_pwd) {
                            done(null, {'user_idx': user.user_idx, 'user_email': user.user_email, 'user_name': user.user_name});
                        } else {
                            done(null, false); // failureFlash: false 일 경우 세번째 인자 사용 안함
                        }
                    });
                }
                done(null, false);
            });
        }
    ));

    router.post(
        '/login',
        passport.authenticate(
            'local', // new LocalStrategy() 를 호출
            {
                successRedirect: '/', // 로그인 성공 후 이동
                failureRedirect: '/forms/login', // 로그인 실패 후 이동
                failureFlash: false, // 실패 정보 노출 여부 - hasher 에서 done 컨트롤 때 사용
            }
        )
    );
    router.get('/join', function(req, res) {
        console.log(req.user);
        let ret = {
            'success': true,
            'message': null,
        }
        res.json(ret);
    });
    return router;
}
