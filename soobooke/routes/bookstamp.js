module.exports=function(app) {
    const db = require('../modules/common.js').db();
    const express = require('express');
    const request = require('request');
    const multer  = require('multer');
    const upload = multer({ dest: 'uploads/' });
    const moment = require('moment');
    const crypt = require('../modules/crypto.js');
    const auth = require('../modules/auth.js');

    let router = express.Router();

    router.get('/', function(req, res) {
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) return res.redirect('/login');
        if(!user.user_idx) return res.redirect('/choose');
        if(user.user_idx != user.parent_user_idx) return res.redirect('/user/info');
        res.render('bookstamp/index.ejs', { user: user, path: req.originalUrl });
    });
    router.put('/', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            code: '',
        };
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        if(user.user_idx != user.parent_user_idx) {
            ret.message = '사용할 수 없는 기능입니다.';
            ret.code = 'reload';
            return res.json(ret);
        }
        if(!req.body.stamp) {
            ret.message = '스탬프를 선택하세요.';
            return res.json(ret);
        }
        if(!req.body.book) {
            ret.message = '스탬프 찍으려는 책을 선택하세요.';
            return res.json(ret);
        }
        let stamp = req.body.stamp;
        let book = JSON.parse(req.body.book)[0];

        console.log(stamp);
        console.log(book);
        ret.success = true;
        return res.json(ret);
    });
    router.get('/menu', function(req, res) {
        let ret = {
            success: false,
            message: null,
            code: '',
            data: [],
        };
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        if(user.user_idx != user.parent_user_idx) {
            ret.message = '사용할 수 없는 기능입니다.';
            ret.code = 'reload';
            return res.json(ret);
        }
        db.query(`SELECT user_idx, user_name, user_profile FROM book_user WHERE parent_user_idx = ? AND user_platform = 'local' ORDER BY user_idx ASC`,
            [user.parent_user_idx],
            function(err, rows, fiels) {
                if(err) {
                    ret.message = '데이터 가져오기 실패!';
                    return res.json(ret);
                }
                ret.success = true;
                ret.data = rows;
                return res.json(ret);
            }
        );
    });
    router.get('/info', function(req, res) {
        let ret = {
            success: false,
            message: null,
            code: '',
            data: [],
        };
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        if(user.user_idx != user.parent_user_idx) {
            ret.message = '사용할 수 없는 기능입니다.';
            ret.code = 'reload';
            return res.json(ret);
        }
        db.query(`SELECT
                    MB.*,
                    B.*
                FROM mybook MB
                    INNER JOIN book B ON B.book_idx = MB.book_idx
                WHERE 1=1
                    AND MB.user_idx IN (SELECT user_idx FROM book_user WHERE parent_user_idx = ?)
                    AND MB.mybook_status = 'request'
                    ORDER BY MB.updated_at ASC`,
            [user.parent_user_idx],
            function(err, rows, fiels) {
                if(err) {
                    ret.message = '데이터 가져오기 실패!';
                    return res.json(ret);
                }
                ret.success = true;
                ret.data = rows;
                return res.json(ret);
            }
        );
    });
    return router;
};
