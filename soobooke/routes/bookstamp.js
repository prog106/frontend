module.exports=function(app) {
    const db = require('../modules/common.js').db();
    const redis = require('../modules/common.js').redis();
    const express = require('express');
    const request = require('request');
    const multer  = require('multer');
    const upload = multer({ dest: 'uploads/' });
    const moment = require('moment');
    moment.locale('ko');
    const crypt = require('../modules/crypto.js');
    const auth = require('../modules/auth.js');
    const crypto = require('crypto');

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
        let season = moment().format('YYYYMM');

        db.query(`SELECT * FROM mybook WHERE mybook_idx = ?`, [book.mybook_idx], function(err, rows, fields) {
            if(err) {
                ret.message = '데이터가 없습니다.';
                ret.code = 'reload';
                return res.json(ret);
            }
            book = rows[0];
            db.beginTransaction(function(err) {
                let sql = `UPDATE mybook SET
                                mybook_status = 'complete',
                                mybook_stamp = ?,
                                completed_at = NOW(),
                                season = ?,
                                updated_at = NOW()
                            WHERE mybook_idx = ?`;
                db.query(sql, [stamp, season, book.mybook_idx], function(err, rows, fields) {
                    if(err) {
                        db.rollback(function(err) {
                            ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                            return res.json(ret);
                        });
                    }
                    db.query(`INSERT INTO bookpoint
                                (point_date, user_idx, book, point, created_at, updated_at)
                            VALUES
                                (?, ?, 1, ?, NOW(), NOW())
                            ON DUPLICATE KEY UPDATE
                                book = book + VALUES(book),
                                point = point + VALUES(point)`,
                        [season, book.user_idx, book.mybook_point],
                        function(err, rows, fields) {
                            if(err) {
                                db.rollback(function(err) {
                                    ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                                    return res.json(ret);
                                });
                            }
                            db.commit(function(err) {
                                if(err) {
                                    db.rollback(function(err) {
                                        ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                                        return res.json(ret);
                                    });
                                    return false;
                                }
                                // 스탬프 찍힌 사용자의 점수 저장하기 - 부모는 랭킹에서 제외
                                let keys = 'SB_'+season;
                                redis.zscore(keys, book.user_idx, function(err, rows) {
                                    let score = rows + book.mybook_point;
                                    redis.zadd(keys, score, book.user_idx, function(err, rows) {
                                        if(err) console.log(err);
                                        ret.success = true;
                                        return res.json(ret);
                                    });
                                });
                            });
                        }
                    );
                });
            });
        });
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
                rows.forEach(function(v, k) {
                    rows[k].user = crypto.createHash('sha512').update(`{user_idx:${v.user_idx}}`).digest('base64');
                    delete rows[k].user_idx;
                });
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
                rows.forEach(function(v, k) {
                    rows[k].user = crypto.createHash('sha512').update(`{user_idx:${v.user_idx}}`).digest('base64');
                    delete rows[k].book_idx;
                    delete rows[k].user_idx;
                    delete rows[k].shelf_idx;
                });
                ret.success = true;
                ret.data = rows;
                return res.json(ret);
            }
        );
    });
    return router;
};
