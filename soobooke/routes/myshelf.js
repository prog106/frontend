module.exports=function(app) {
    const db = require('../modules/common.js').db();
    const redis = require('../modules/common.js').redis();
    const express = require('express');
    const request = require('request');
    const multer  = require('multer');
    const upload = multer({ dest: 'uploads/' });
    const moment = require('moment');
    const auth = require('../modules/auth.js');

    let router = express.Router();

    // 내 책꽂이
    router.get('/', function(req, res) {
        let puser = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!puser) return res.redirect('/login');
        let user = req.user;
        if(!user || !user.user_idx) return res.redirect('/choose');
        let season_info = [];
        let start_season = '202001';
        for(let i=0; i<6; i++) { // 최근 6개월만 확인 가능
            season = moment().subtract(i, 'months').format('YYYYMM');
            season_info.push({
                val: season,
                kr: moment().subtract(i, 'months').format('YYYY년 MM월'),
            });
            if(start_season == season) break;
        }
        let render = 'myshelf/index.ejs';
        // if(user.user_idx != user.parent_user_idx) render = 'myshelf/kid_index.ejs';
        res.render(render, { user: user, season_info: season_info, path: req.originalUrl });
    });
    // 내 책꽂이 가져오기
    router.get(['/info', '/info/:season'], function(req, res) {
        let ret = {
            success: false,
            message: null,
            code: '',
            data: [],
            info: {},
        };
        let puser = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!puser) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        let user = req.user;
        if(!user || !user.user_idx) {
            ret.code = 'choose';
            return res.json(ret);
        }
        let season = (req.params.season) ? req.params.season : moment().format('YYYYMM');
        let sql = 'SELECT MB.*, B.* FROM mybook MB ';
        sql += ' INNER JOIN book B ON B.book_idx = MB.book_idx ';
        sql += ' WHERE 1=1 AND MB.user_idx = ? ';
        if(req.params.season && req.params.season != moment().format('YYYYMM')) sql += ' AND MB.season = ? ';
        else sql += ' AND (MB.season = ? OR MB.season IS NULL) ';
        sql += ' ORDER BY MB.season ASC, MB.completed_at DESC, MB.mybook_idx DESC ';
        db.query(sql, [user.user_idx, season], function(err, rows, fields) {
            if(err) {
                console.log(err);
                ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                return res.json(ret);
            }
            let all = rows.length;
            let ready = 0;
            let start = 0;
            let complete = 0;
            rows.forEach(function(v, k) {
                delete rows[k].user_idx;
                delete rows[k].book_idx;
                delete rows[k].shelf_idx;
                switch(v.mybook_status) {
                    case "ready": ready++; break;
                    case "start": start++; break;
                    case "request": case "complete": complete++; break;
                }
            });
            ret.success = true;
            ret.data = rows;
            ret.info = {
                all: all,
                ready: ready,
                start: start,
                complete: complete,
            }
            return res.json(ret);
        });
    });
    // 책 상태 바꾸기 - ready > [ start > request ] > complete
    router.put('/info', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            code: '',
        };
        let puser = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!puser) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        let user = req.user;
        if(!user || !user.user_idx) {
            ret.code = 'choose';
            return res.json(ret);
        }
        if(!req.body.code || (req.body.code != 'start' && req.body.code != 'complete' && req.body.code != 'ready')) {
            ret.message = '잘못된 요청입니다.';
            return res.json(ret);
        }
        if(!req.body.book) {
            ret.message = '잘못된 요청입니다.';
            return res.json(ret);
        }
        let code = '';
        let book = JSON.parse(req.body.book)[0];
        db.query(`SELECT * FROM mybook WHERE mybook_idx = ? AND user_idx = ?`, [book.mybook_idx, user.user_idx], function(err, rows, fields) {
            if(rows.length < 1) {
                ret.message = '잘못된 요청입니다.';
                return res.json(ret);
            }
            let row = rows[0];
            if(row.mybook_status == 'complete') {
                ret.message = '모두 읽은 책입니다.';
                return res.json(ret);
            }
            mybook_point = row.mybook_point;
            let season = moment().format('YYYYMM');
            if(user.user_idx == user.parent_user_idx) {
                code = req.body.code;
                db.beginTransaction(function(err) {
                    let sql = `UPDATE mybook SET
                                    ${(code == 'ready')? 'started_at = NULL, requested_at = NULL, ':''}
                                    ${(code == 'start')? 'started_at = NOW(), ' : ''}
                                    ${(code == 'complete')? `completed_at = NOW(), season = '${season}', mybook_stamp = '', ` : ''}
                                    mybook_status = ?,
                                    updated_at = NOW()
                                WHERE mybook_idx = ? AND user_idx = ?`;
                    db.query(sql, [code, book.mybook_idx, user.user_idx], function(err, rows, fields) {
                        if(err) {
                            return db.rollback(function(err) {
                                ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                                return res.json(ret);
                            });
                        }
                        if(req.body.code == 'complete') {
                            db.query(`INSERT INTO bookpoint
                                        (season, user_idx, book, point, created_at, updated_at)
                                    VALUES
                                        (?, ?, 1, ?, NOW(), NOW())
                                    ON DUPLICATE KEY UPDATE
                                        book = book + VALUES(book),
                                        point = point + VALUES(point)`,
                                [season, user.user_idx, mybook_point],
                                function(err, rows, fields) {
                                    if(err) {
                                        return db.rollback(function(err) {
                                            ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                                            return res.json(ret);
                                        });
                                    }
                                    return db.commit(function(err) {
                                        if(err) {
                                            return db.rollback(function(err) {
                                                ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                                                return res.json(ret);
                                            });
                                        }
                                        // 스탬프 사용자 점수 저장하기
                                        let keys = 'SB_'+season;
                                        redis.zscore(keys, user.user_idx, function(err, rows) {
                                            let score = rows + mybook_point;
                                            redis.zadd(keys, score, user.user_idx, function(err, rows) {
                                                if(err) console.log(err);
                                                ret.success = true;
                                                return res.json(ret);
                                            });
                                        });
                                    });
                                }
                            );
                        } else {
                            return db.commit(function(err) {
                                if(err) {
                                    return db.rollback(function(err) {
                                        ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                                        return res.json(ret);
                                    });
                                }
                                ret.success = true;
                                return res.json(ret);
                            });
                        }
                    });
                });
            } else {
                code = (req.body.code == 'complete') ? 'request' : req.body.code;
                db.query(`UPDATE mybook SET mybook_status = ?, updated_at = NOW() WHERE mybook_idx = ? AND user_idx = ?`,
                    [code, book.mybook_idx, user.user_idx],
                    function(err, rows, fields) {
                        if(err) {
                            ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                            return res.json(ret);
                        }
                        ret.success = true;
                        return res.json(ret);
                    }
                );
            }
        });
    });
    // 책꽂이에서 제거하기
    router.delete('/info', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            code: '',
        };
        let puser = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!puser) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        let user = req.user;
        if(!user || !user.user_idx) {
            ret.code = 'choose';
            return res.json(ret);
        }
        if(!req.body.book) {
            ret.message = '잘못된 요청입니다.';
            return res.json(ret);
        }
        let book = JSON.parse(req.body.book)[0];
        db.query(`SELECT * FROM mybook WHERE mybook_idx = ? AND user_idx = ?`, [book.mybook_idx, user.user_idx], function(err, rows, fields) {
            if(err) {
                ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                return res.json(ret);
            }
            if(rows.length < 1) {
                ret.message = '잘못된 요청입니다.';
                return res.json(ret);
            }
            let row = rows[0];
            if(row.mybook_status == 'complete') {
                ret.message = '모두 읽은 책은 삭제할 수 없습니다.';
                return res.json(ret);
            }
            let sql = `UPDATE mybook SET user_idx = 0,
                            updated_at = NOW()
                        WHERE mybook_idx = ? AND user_idx = ?`;
            db.query(sql, [book.mybook_idx, user.user_idx], function(err, rows, fields) {
                if(err) {
                    ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                    return res.json(ret);
                }
                ret.message = '책꽂이에서 삭제되었습니다.';
                ret.success = true;
                return res.json(ret);
            });
        });
    });
    return router;
};
