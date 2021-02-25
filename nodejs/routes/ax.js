const express = require('express');
const router = express.Router();

const bkfd2Password = require('pbkdf2-password');
const hasher = bkfd2Password();

const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

const db = require('../modules/common.js').db();

module.exports = function() {
    // 로그인
    router.post('/login', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        if(req.session.user_idx) return res.json(ret);
        let user_email = req.body.email;
        let user_pwd = req.body.pwd;
        db.query('SELECT * FROM test_user WHERE user_email = ?', [user_email], function(err, rows, fields) {
            if(rows.length < 1) {
                ret.message = 'check email';
                return res.json(ret);
            }
            let user = rows[0];
            hasher({password: user_pwd, salt: user.user_pwd_salt}, function(err, pass, salt, hash) {
                if(hash !== user.user_pwd) {
                    ret.message = 'check password';
                    return res.json(ret);
                }
                req.session.user_idx = user.user_idx;
                req.session.user_name = user.user_name;
                req.session.user_email = user.user_email;
                ret.success = true;
                ret.message = null;
                return res.json(ret);
            });
        });
    });
    // 회원가입
    router.post('/join', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        }
        if(req.session.user_idx) return res.json(ret);
        let user_email = req.body.email;
        let user_name = req.body.name;
        let user_password = req.body.pwd;
        db.query('SELECT * FROM test_user WHERE user_email = ?', [user_email], function(err, rows, fields) {
            if(err) return res.status(500).send(err);
            if(rows.length > 0) {
                ret.message = 'already user';
                return res.json(ret);
            }
            hasher({password: user_password}, function(err, pass, salt, hash) {
                db.query(
                    'INSERT INTO test_user (user_email, user_name, user_pwd, user_pwd_salt) VALUES (?, ?, ?, ?)',
                    [user_email, user_name, hash, salt],
                    function(err, rows, fields) {
                        if(err) return res.json(ret);
                        ret.success = true;
                        ret.message = null;
                        return res.json(ret);
                    }
                );
            });
        });
    });
    // 회원정보
    router.post('/info', function(req, res) {
        let ret = {
            success: false,
            message: null,
        }
        let user_idx = req.session.user_idx;
        if(!user_idx) {
            ret.message = 'login error';
            return res.json(ret);
        }
        db.query('SELECT * FROM test_user WHERE user_idx = ?', [user_idx], function(err, rows, fields) {
            if(rows.length < 1) {
                ret.message = 'login error';
                return res.json(ret);
            }
            let user = rows[0];
            let data = {
                'user_idx': user.user_idx,
                'user_name': user.user_name,
                'user_email': user.user_email,
            }
            ret.success = true;
            ret.message = null;
            ret.data = data;
            return res.json(ret);
        });
    });
    // 로그인 상태 확인
    router.post('/state', function(req, res) {
        let ret = {
            success: false,
            message: null,
        }
        let user_idx = req.session.user_idx;
        if(!user_idx) return res.json(ret);
        ret.success = true;
        return res.json(ret);
    });
    return router;
}
