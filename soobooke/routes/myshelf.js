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

    // 내 책꽂이
    router.get('/', function(req, res) {
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) return res.redirect('/login');
        if(!user.user_idx) return res.redirect('/choose');
        let render = 'myshelf/index.ejs';
        if(user.user_idx != user.parent_user_idx) render = 'myshelf/kid_index.ejs';
        res.render(render, { user: user, path: req.originalUrl });
    });
    // 내 책꽂이 가져오기
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
        db.query(`SELECT
                    MB.*,
                    B.*,
                    IF(S.shelf_name, S.shelf_name, '') AS shelf_name
                FROM mybook MB
                    INNER JOIN book B ON B.book_idx = MB.book_idx
                    LEFT JOIN shelf S ON S.shelf_idx = MB.shelf_idx AND S.user_idx = MB.user_idx
                WHERE MB.user_idx = ?
                ORDER BY MB.mybook_idx DESC`,
            [user.user_idx],
            function(err, rows, fields) {
                if(err) {
                    ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                    return res.json(ret);
                }
                ret.success = true;
                ret.data = rows;
                return res.json(ret);
            }
        )
    });
    // 책 상태 바꾸기 - ready > [ start > request ] > complete
    router.put('/info', upload.none(), function(req, res) {
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
        if(!req.body.code || (req.body.code != 'start' && req.body.code != 'complete')) {
            ret.message = '잘못된 요청입니다.';
            return res.json(ret);
        }
        if(!req.body.book) {
            ret.message = '잘못된 요청입니다.';
            return res.json(ret);
        }
        let code = (req.body.code == 'complete') ? 'request' : req.body.code;
        let book = JSON.parse(req.body.book)[0];
        db.query(`UPDATE mybook SET mybook_status = ?, updated_at = NOW() WHERE user_idx = ? AND book_idx = ?`,
            [code, user.user_idx, book.book_idx],
            function(err, rows, fields) {
                if(err) {
                    ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                    return res.json(ret);
                }
                ret.success = true;
                return res.json(ret);
            }
        )
    });
    return router;
};
