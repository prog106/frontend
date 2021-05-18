module.exports=function(app) {
    const db = require('../modules/common.js').db();
    const redis = require('../modules/common.js').redis();
    const moment = require('moment');
    moment.locale('ko');
    const multer  = require('multer');
    const upload = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, `${__dirname}/../public/_profile`); // public 폴더를 지정합니다.
            },
            filename: (req, file, cb) => {
                function makeRandomName() { // unique
                    let name = '';
                    let possible = "abcdefghijklmnopqrstuvwxyz1234567890";
                    for( let i = 0; i < 10; i++ ) {
                        name += possible.charAt(Math.floor(Math.random() * possible.length));
                    }
                    return name;
                }
                var fileName = makeRandomName(); // 파일 이름
                var mimeType;
                switch (file.mimetype) { // 파일 타입 체크
                    case 'image/jpeg':
                        mimeType = 'jpg';
                    break;
                    case 'image/png':
                        mimeType = 'png';
                    break;
                    case 'image/gif':
                        mimeType = 'gif';
                    break;
                    default:
                        return cb(null, 'exterror');
                    break;
                }
                cb(null, fileName + '.' + mimeType); // 파일 이름 + 파일 타입 형태로 이름을 바꿉니다.
            },
        }),
        // limits: { fileSize: 1024*1024*5 }
    });
    const fs = require('fs');
    const sharp = require("sharp");
    const bkfd2Password = require('pbkdf2-password');
    const hasher = bkfd2Password();
    const path = require('path');
    const express = require('express');
    const crypto = require('crypto');

    const crypt = require('../modules/crypto.js');
    const auth = require('../modules/auth.js');

    let router = express.Router();

    // 회원정보
    router.get('/info', function(req, res) {
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) return res.redirect('/login');
        if(!user.user_idx) return res.redirect('/choose');
        db.query(`SELECT * FROM book_user WHERE user_idx = ?`, [user.user_idx], function(err, rows, fields) {
            if(err || rows.length < 1) {
                return res.redirect('/logout');
            }
            let userinfo = rows[0];
            res.render('user/info.ejs', { user: user, userinfo: userinfo, path: req.originalUrl });
        });
    });
    // 내 이번달 포인트 가져오기 [get]/user/point
    router.get('/point', function(req, res) {
        let ret = {
            success: false,
            message: null,
            point: 0,
            book: 0,
        };
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        // console.log(moment().subtract(1, 'month').format('YYYYMM'));
        let season = moment().format('YYYYMM');
        let keys = 'SB_' + season;
        // bookpoint 와 redis.point 가 다를 경우 mybook에서 데이터를 가져와서 새로 만든다.
        db.query('SELECT * FROM bookpoint WHERE user_idx = ? AND season = ?', [user.user_idx, season], function(err, rows, fields) {
            if(err) return res.json(ret);
            let point = 0;
            let book = 0;
            if(rows.length > 0) {
                let row = rows[0];
                point = row.point;
                book = row.book;
                redis.zscore(keys, user.user_idx, function(err, score) {
                    if(point != score) {
                        db.query('SELECT count(*) AS count, SUM(mybook_point) AS point FROM mybook WHERE user_idx = ? AND season = ?',
                            [user.user_idx, season],
                            function(err, rows, fields) {
                                if(err) return res.json(ret);
                                let row = rows[0];
                                db.query(`UPDATE bookpoint SET book = ?, point = ? WHERE user_idx = ? AND season = ?`,
                                    [row.count, row.point, user.user_idx, season],
                                    function(err, rows, fields) {
                                        if(err) return res.json(ret);
                                        redis.zadd(keys, row.point, user.user_idx, function(err, rows) {
                                            ret.success = true;
                                            ret.point = row.point;
                                            ret.book = row.count;
                                            return res.json(ret);
                                        });
                                    }
                                );
                            }
                        );
                    } else {
                        ret.success = true;
                        ret.point = point;
                        ret.book = book;
                        return res.json(ret);
                    }
                });
            } else {
                db.query(`INSERT INTO bookpoint (season, user_idx, book, point, created_at) VALUES (?, ?, 0, 0, NOW())`, [season, user.user_idx], function(err, rows, fields) {
                    if(err) return res.json(ret);
                    redis.zadd(keys, 0, user.user_idx, function(err, rows) {
                        ret.success = true;
                        ret.point = 0;
                        ret.book = 0;
                        return res.json(ret);
                    });
                });
            }
        });
        /* db.query('SELECT SUM(mybook_point) AS point FROM mybook WHERE user_idx = ? AND season = ?', [user.user_idx, season], function(err, rows, fields) {
            if(err) return res.json(ret);
            let point = (rows[0].point) ? rows[0].point : 0;
            if(user.user_idx != user.parent_user_idx) {
                let keys = 'SB_' + season;
                redis.zscore(keys, user.user_idx, function(err, score) {
                    if(point != score) {
                        redis.zadd(keys, point, user.user_idx, function(err, rows) {
                            ret.success = true;
                            ret.point = point;
                            return res.json(ret);
                        });
                    } else {
                        ret.success = true;
                        ret.point = point;
                        return res.json(ret);
                    }
                });
            } else {
                ret.success = true;
                ret.point = point;
                return res.json(ret);
            }
        }); */
    });
    // 뱃지정보
    router.get('/badge', function(req, res) {
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) return res.redirect('/login');
        if(!user.user_idx) return res.redirect('/choose');
        db.query(`SELECT * FROM book_user WHERE user_idx = ?`, [user.user_idx], function(err, rows, fields) {
            if(err || rows.length < 1) {
                return res.redirect('/logout');
            }
            let userinfo = rows[0];
            res.render('user/badge.ejs', { user: user, userinfo: userinfo, path: req.originalUrl });
        });
    });
    // 뱃지정보 써머리
    router.get('/badge/info', function(req, res) {
        let ret = {
            success: false,
            message: null,
            info: {},
        };
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        db.query('SELECT season, SUM(mybook_point) AS point, COUNT(*) AS count,  FROM mybook WHERE user_idx = ? AND season IS NOT NULL GROUP BY 1', [user.user_idx], function(err, rows, fields) {
            if(err) return res.json(ret);
            ret.success = true;
            let best_point = 0;
            let lowest_point = 0;
            let best_book = 0;
            rows.forEach(function(v, k) {
                if(best_point < v.point) best_point = v.point;
                if(lowest_point > v.point) lowest_point = v.point;
                if(best_book < v.count) best_book = v.count;
            });
            ret.info.push(best_point, best_point);
            ret.info.lowest_point = lowest_point;
            ret.info.best_book = best_book;
            // 전체 랭킹 가져오기
            let keys = 'SB_'+moment().format('YYYYMM');
            redis.zcount(keys, 0, 100000, function(err, rows) { // 0 ~ 100000 점 사이 전체 회원수
                if(err) console.log(err);
                ret.info.count = rows;
                // 내 등수 가져오기
                redis.zrevrank(keys, user.user_id, function(err, rows) {
                    if(err) console.log(err);
                    ret.info.rank = rows + 1;
                });
            });
            return res.json(ret);
        });
    });
    // 내 특정월 포인트 가져오기 [get]/user/point/202105
    router.get('/point/:season', function(req, res) {
        let ret = {
            success: false,
            message: null,
            point: 0,
        };
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        let season = req.params.season;
        db.query('SELECT SUM(mybook_point) AS user_point FROM mybook WHERE user_idx = ? AND season = ?', [user.user_idx, season], function(err, rows, fields) {
            if(err) return res.json(ret);
            let row = rows[0];

            ret.success = true;
            ret.point = (!row.user_point)?0:row.user_point;
            return res.json(ret);
        });
    });
    // 회원탈퇴 페이지
    router.get('/signout', function(req, res) {
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) return res.redirect('/login');
        if(!user.user_idx) return res.redirect('/choose');
        if(user.user_idx != user.parent_user_idx) return res.redirect('/user/info');
        db.query(`SELECT * FROM book_user WHERE user_idx = ?`, [user.user_idx], function(err, rows, fields) {
            if(err || rows.length < 1) {
                return res.redirect('/logout');
            }
            let userinfo = rows[0];
            res.render('user/signout.ejs', { user: user, userinfo: userinfo, path: req.originalUrl });
        });
    });
    // 직접 탈퇴 요청 > user_platform_* 정보를 제외하고 모두 초기화 > 카카오 연결코드만 남기기 > 로그인 불가
    router.put('/leave', upload.none(), function(req, res) {
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
        db.query('SELECT * FROM book_user WHERE parent_user_idx = ?', [user.parent_user_idx], function(err, rows, fields) {
            if(err) {
                ret.message = '오류!!';
                return res.json(ret);
            }
            if(rows.length > 1) {
                ret.message = '부 사용자 계정을 모두 삭제후 진행해 주세요.';
                return res.json(ret);
            } else if(rows.length == 0) {
                ret.message = '일치하는 회원 정보가 없습니다.';
                ret.code = 'logout';
                return res.json(ret);
            } else {
                db.query(`UPDATE book_user SET
                            parent_user_idx = 0,
                            user_name = '',
                            user_email = '',
                            user_profile = '',
                            user_lock = 'no',
                            user_lock_salt = '',
                            user_lock_password = '',
                            user_updated_at = NOW()
                        WHERE parent_user_idx = ?`,
                    [user.parent_user_idx],
                    function(err, rows, fields) {
                        if(err) {
                            ret.message = '오류!';
                            return res.json(ret);
                        }
                        db.query(`INSERT INTO book_user_leave (user_idx, user_leave_reason, user_leave_desc, user_leave_created_at) VALUES (?, ?, ?, NOW())`,
                            [user.user_idx, req.body.signout_reason, req.body.siginout_desc],
                            function(err, rows, fields) {
                            }
                        );
                        if(req.user) req.logout(); // passport session 삭제
                        res.clearCookie('SBOOK.uid');
                        ret.success = true;
                        ret.message = '탈퇴 처리되었습니다.\n\n수북이를 이용해 주셔서 감사합니다.';
                        return res.json(ret);
                    }
                );
            }
        });
    });
    // 사용자 관리
    router.get('/manage', function(req, res) {
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) return res.redirect('/login');
        if(!user.user_idx) return res.redirect('/member');
        if(user.user_idx != user.parent_user_idx) return res.redirect('/user/info');
        res.render('user/manage.ejs', { user: req.user, path: req.originalUrl });
    });
    // 사용자 목록 가져오기 [get]/user
    router.get('/', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            members: [],
        };
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        db.query('SELECT * FROM book_user WHERE parent_user_idx = ?', [user.parent_user_idx], function(err, rows, fields) {
            if(err) return res.json(ret);
            rows.forEach(function(v, k) {
                ret.members.push({
                    user: crypto.createHash('sha512').update(`{user_idx:${v.user_idx}}`).digest('base64'), // 암호화
                    user_parent: (v.user_idx == v.parent_user_idx)? true : false,
                    user_name: v.user_name,
                    user_profile: v.user_profile,
                });
            });
            ret.success = true;
            return res.json(ret);
        });
    });
    // 사용자 추가
    router.post('/', upload.single('user_picture'), function(req, res) {
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
        if(user.parent_user_idx != user.user_idx) {
            ret.message = '사용할 수 없는 기능입니다.';
            ret.code = 'logout';
            return res.json(ret);
        }
        if(!req.body.user_name) {
            ret.message = '이름을 입력하세요.';
            return res.json(ret);
        }
        db.query(`SELECT COUNT(*) AS count FROM book_user WHERE parent_user_idx = ?`,
            [user.parent_user_idx],
            async function(err, rows, fields) {
                if(err) {
                    ret.message = '오류가 발생했습니다. 잠시 후 다시해 주세요.';
                    return res.json(ret);
                }
                if(rows[0].count >= 5) {
                    ret.message = '사용자를 더 이상 추가할 수 없습니다.';
                    return res.json(ret);
                }
                let user_profile = '';
                if(req.file && req.file.filename) {
                    if(req.file.filename == 'exterror') {
                        ret.message = '프로필 이미지는 jpg/gif/png 만 가능합니다.';
                        return res.json(ret);
                    }
                    await sharp(req.file.path).resize({ width:300 }).withMetadata().toFile(`${__dirname}/../public/profile/${req.file.filename}`);
                    fs.unlinkSync(req.file.path);
                    user_profile = `/profile/${req.file.filename}`;
                }
                db.query(`INSERT INTO book_user
                            (parent_user_idx, user_name, user_profile, user_created_at, user_updated_at)
                        VALUES
                            (?, ?, ?, NOW(), NOW())`,
                    [user.parent_user_idx, req.body.user_name, user_profile],
                    function(err, rows, fields) {
                        if(err) {
                            ret.message = '추가에 실패하였습니다. 잠시 후 다시해 주세요.';
                            ret.code = 'reload';
                            return res.json(ret);
                        }
                        ret.success = true;
                        res.json(ret);
                    }
                );
            }
        );
    });
    // 사용자 정보 수정
    router.put('/', upload.single('user_mod_picture'), function(req, res) {
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
        if(user.parent_user_idx != user.user_idx) {
            ret.message = '사용할 수 없는 기능입니다.';
            ret.code = 'logout';
            return res.json(ret);
        }
        if(!req.body.user) {
            ret.message = '아이 정보 수정에 에러가 있습니다.';
            ret.code = 'reload';
            return res.json(ret);
        }
        if(!req.body.user_name) {
            ret.message = '아이 이름을 입력하세요.';
            return res.json(ret);
        }
        db.query(`SELECT * FROM book_user WHERE parent_user_idx = ?`, [user.parent_user_idx], async function(err, rows, fields) {
            if(err) {
                ret.message = '오류가 발생했습니다. 잠시 후 다시해 주세요.';
                return res.json(ret);
            }
            if(rows.length < 1) {
                ret.message = '로그인 후 이용해 주세요.';
                ret.code = 'logout';
                return res.json(ret);
            }
            // let user_idx = crypt.decrypt(req.body.user_idx);
            let user_profile = '';
            if(req.file && req.file.filename) {
                if(req.file.filename == 'exterror') {
                    ret.message = '프로필 이미지는 jpg/gif/png 만 가능합니다.';
                    return res.json(ret);
                }
                await sharp(req.file.path).resize({ width:300 }).withMetadata().toFile(`${__dirname}/../public/profile/${req.file.filename}`);
                fs.unlinkSync(req.file.path);
                user_profile = `/profile/${req.file.filename}`;
            }
            rows.forEach(function(v, k) {
                if(req.body.user == crypto.createHash('sha512').update(`{user_idx:${v.user_idx}}`).digest('base64')) {
                    let user_name = req.body.user_name;
                    let sql = 'UPDATE book_user SET ';
                    if(user_profile) sql += ' user_profile = "'+ user_profile +'", ';
                    sql += ' user_name = ?, ';
                    sql += ' user_updated_at = NOW() '
                    sql += ' WHERE user_idx = ? AND parent_user_idx = ? ';
                    db.query(sql,
                        [user_name, v.user_idx, user.parent_user_idx],
                        function(err, rows, fields) {
                            if(err) {
                                ret.message = '프로필 수정에 실패하였습니다.';
                                return res.json(ret);
                            }
                            // if(user_profile) {
                            //     if(req.user.user_profile.indexOf('://') < 0) fs.unlinkSync(path.resolve(__dirname, '../public'+req.user.user_profile));
                            //     req.user.user_profile = user_profile;
                            // }
                            ret.success = true;
                            return res.json(ret);
                        }
                    );
                }
            });
        });
    });
    // 사용자 정보 삭제
    router.delete('/', upload.none(), async function(req, res) {
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
        if(user.parent_user_idx != user.user_idx) {
            ret.message = '사용할 수 없는 기능입니다.';
            ret.code = 'logout';
            return res.json(ret);
        }
        if(!req.body.user) {
            ret.message = '아이 정보 삭제에 에러가 있습니다.';
            ret.code = 'reload';
            return res.json(ret);
        }
        db.query(`SELECT * FROM book_user WHERE parent_user_idx = ?`, [user.parent_user_idx], async function(err, rows, fields) {
            if(err) {
                ret.message = '오류가 발생했습니다. 잠시 후 다시해 주세요.';
                return res.json(ret);
            }
            if(rows.length < 1) {
                ret.message = '로그인 후 이용해 주세요.';
                ret.code = 'logout';
                return res.json(ret);
            }
            rows.forEach(function(v, k) {
                if(req.body.user == crypto.createHash('sha512').update(`{user_idx:${v.user_idx}}`).digest('base64')) {
                    // let user_idx = crypt.decrypt(req.body.user_idx);
                    let sql = 'UPDATE book_user SET ';
                    sql += ' parent_user_idx = 0, ';
                    sql += ' user_updated_at = NOW() '
                    sql += ' WHERE user_idx = ? AND parent_user_idx = ? ';
                    db.query(sql,
                        [v.user_idx, user.parent_user_idx],
                        function(err, rows, fields) {
                            if(err) {
                                ret.message = '프로필 삭제에 실패하였습니다.';
                                return res.json(ret);
                            }
                            ret.success = true;
                            return res.json(ret);
                        }
                    );
                }
            });
        });
    });
    // 프로필 선택
    router.put('/choose', upload.none(), function(req, res) {
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
        if(!req.body.user) {
            ret.message = '사용자를 선택해 주세요.'
            return res.json(ret);
        }
        // let user_idx = crypt.decrypt(req.body.user_idx); // 복호화
        db.query('SELECT * FROM book_user WHERE parent_user_idx = ?',
            [user.parent_user_idx], function(err, rows, fields) {
                if(err) {
                    ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                    return res.json(ret);
                }
                if(rows.length < 1) {
                    ret.message = '로그인 후 이용해 주세요.';
                    ret.code = 'logout';
                    return res.json(ret);
                }
                rows.forEach(function(v, k) {
                    if(req.body.user == crypto.createHash('sha512').update(`{user_idx:${v.user_idx}}`).digest('base64')) {
                        let row = v;
                        if(row.user_lock == 'yes') {
                            ret.success = true;
                            ret.code = 'lock';
                            return res.json(ret);
                        } else {
                            user.user_idx = row.user_idx;
                            user.parent_user_idx = row.parent_user_idx;
                            user.user_name = row.user_name;
                            user.user_profile = row.user_profile;
                            user.user_email = row.user_email;
                            user.user_platform = row.user_platform;
                            res.cookie('SBOOK.uid', crypt.encrypt(JSON.stringify(user)), { signed: true, expires: new Date(Date.now() + 1000 * 60 * process.env.COOKIE_EXPIRE), httpOnly: true });
                            ret.success = true;
                            return res.json(ret);
                        }
                    }
                });
            }
        );
    });
    // 잠금 프로필 처리
    router.put('/lock_choose', upload.none(), function(req, res) {
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
        if(!req.body.user) {
            ret.message = '사용자를 선택해 주세요.'
            return res.json(ret);
        }
        if(!req.body.lock_password) {
            ret.message = '비밀번호를 입력해 주세요.'
            return res.json(ret);
        }
        if(req.body.user != crypto.createHash('sha512').update(`{user_idx:${user.parent_user_idx}}`).digest('base64')) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        // let user_idx = crypt.decrypt(req.body.user_idx); // 복호화
        db.query('SELECT * FROM book_user WHERE parent_user_idx = ?',
            [user.parent_user_idx], function(err, rows, fields) {
                if(err) {
                    ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                    return res.json(ret);
                }
                if(rows.length < 1) {
                    ret.message = '로그인 후 이용해 주세요.';
                    ret.code = 'logout';
                    return res.json(ret);
                }
                let row = rows[0];
                hasher({ password: req.body.lock_password, salt: row.user_lock_salt }, function(err, pass, salt, hash) {
                    if(row.user_lock_password === hash) {
                        user.user_idx = row.user_idx;
                        user.parent_user_idx = row.parent_user_idx;
                        user.user_name = row.user_name;
                        user.user_profile = row.user_profile;
                        user.user_email = row.user_email;
                        user.user_platform = row.user_platform;
                        res.cookie('SBOOK.uid', crypt.encrypt(JSON.stringify(user)), { signed: true, expires: new Date(Date.now() + 1000 * 60 * process.env.COOKIE_EXPIRE), httpOnly: true });
                        ret.success = true;
                        return res.json(ret);
                    } else {
                        ret.message = '비밀번호가 틀립니다.\n\n비밀번호를 확인해 주세요.';
                        return res.json(ret);
                    }
                });
            }
        );
    });
    // 닉네임 & 썸네일 수정
    router.put('/modify', upload.single('user_profile_picture'), async function(req, res) {
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
        let user_profile = '';
        if(req.file && req.file.filename) {
            if(req.file.filename == 'exterror') {
                ret.message = '프로필 이미지는 jpg/gif/png 만 가능합니다.';
                return res.json(ret);
            }
            await sharp(req.file.path).resize({ width:300 }).withMetadata().toFile(`${__dirname}/../public/profile/${req.file.filename}`);
            fs.unlinkSync(req.file.path);
            user_profile = `/profile/${req.file.filename}`;
        }
        let user_name = req.body.user_name;
        let sql = 'UPDATE book_user SET ';
        if(user_profile) sql += ' user_profile = "'+ user_profile +'", ';
        sql += ' user_name = ?, ';
        sql += ' user_updated_at = NOW() '
        sql += ' WHERE user_idx = ? AND parent_user_idx = ? ';
        db.query(sql,
            [user_name, user.user_idx, user.parent_user_idx],
            function(err, rows, fields) {
                if(err) {
                    ret.message = '프로필 수정에 실패하였습니다.';
                    return res.json(ret);
                }
                if(req.user) {
                    req.user.user_name = user_name;
                    if(user_profile) req.user.user_profile = user_profile;
                }
                user.user_name = user_name;
                if(user_profile) user.user_profile = user_profile;
                res.cookie('SBOOK.uid', crypt.encrypt(JSON.stringify(user)), { signed: true, expires: new Date(Date.now() + 1000 * 60 * process.env.COOKIE_EXPIRE), httpOnly: true });
                // if(user_profile) {
                //     if(req.user.user_profile.indexOf('://') < 0) fs.unlinkSync(path.resolve(__dirname, '../public'+req.user.user_profile));
                //     req.user.user_profile = user_profile;
                // }
                ret.success = true;
                res.json(ret);
            }
        );
    });
    // 프로필 잠금설정 처리
    router.put('/lock', upload.none(), function(req, res) {
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
        if(!req.body.lock_password) {
            ret.message = '비밀번호를 입력해 주세요.'
            return res.json(ret);
        }
        if(!req.body.lock_password_re) {
            ret.message = '비밀번호를 입력해 주세요.'
            return res.json(ret);
        }
        if(req.body.lock_password != req.body.lock_password_re) {
            ret.message = '비밀번호를 확인해 주세요.'
            return res.json(ret);
        }
        db.query('SELECT * FROM book_user WHERE user_idx = ? AND parent_user_idx = ?',
            [user.parent_user_idx, user.parent_user_idx],
            function(err, rows, fields) {
                if(err) {
                    ret.message = '오류 발생!';
                    ret.code = 'reload';
                    return res.json(ret);
                }
                if(rows.length < 1) {
                    ret.message = '일치하는 회원정보가 없습니다.';
                    ret.code = 'logout';
                    return res.json(ret);
                }
                let row = rows[0];
                if(row.user_lock == 'yes') {
                    ret.message = '잠금설정 오류!\n\n다시 시도해 주세요.';
                    ret.code = 'reload';
                    return res.json(ret);
                }
                hasher({ password: req.body.lock_password }, function(err, pass, salt, hash) {
                    db.query(`UPDATE book_user SET
                                user_lock = 'yes',
                                user_lock_salt = ?,
                                user_lock_password = ?
                            WHERE 1=1
                                AND user_idx = ?
                                AND parent_user_idx = ?`,
                        [salt, hash, user.parent_user_idx, user.parent_user_idx],
                        function(err, rows, fields) {
                            if(err) {
                                ret.message = '잠금설정에 실패하였습니다. 잠시후 다시 이용해 주세요.';
                                return res.json(ret);
                            }
                            ret.message = '사용자 잠금설정이 완료되었습니다.';
                            ret.success = true;
                            return res.json(ret);
                        }
                    )
                });
            }
        );
    });
    // 프로필 잠금해제 처리
    router.put('/unlock', upload.none(), function(req, res) {
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
        if(!req.body.unlock_password) {
            ret.message = '비밀번호를 입력해 주세요.'
            return res.json(ret);
        }
        db.query('SELECT * FROM book_user WHERE user_idx = ? AND parent_user_idx = ?',
            [user.parent_user_idx, user.parent_user_idx], function(err, rows, fields) {
                if(err || rows.length < 1) {
                    ret.message = '로그인 후 이용해 주세요.';
                    ret.code = 'logout';
                    return res.json(ret);
                }
                let row = rows[0];
                if(row.user_lock == 'no') {
                    ret.message = '잠금설정 오류!\n\n다시 시도해 주세요.';
                    ret.code = 'reload';
                    return res.json(ret);
                }
                hasher({ password: req.body.unlock_password, salt: row.user_lock_salt }, function(err, pass, salt, hash) {
                    if(row.user_lock_password === hash) {
                        db.query(`UPDATE book_user SET
                                    user_lock = 'no',
                                    user_lock_salt = null,
                                    user_lock_password = null
                                WHERE 1=1
                                    AND user_idx = ?
                                    AND parent_user_idx = ?`,
                            [user.parent_user_idx, user.parent_user_idx],
                            function(err, rows, fields) {
                                if(err) {
                                    ret.message = '잠금풀기에 실패하였습니다. 잠시후 다시 시도해 주세요.';
                                    return res.json(ret);
                                }
                                ret.message = '사용자 잠금설정이 해제되었습니다.';
                                ret.success = true;
                                return res.json(ret);
                            }
                        );
                    } else {
                        ret.message = '비밀번호가 틀립니다.\n\n비밀번호를 확인해 주세요.';
                        return res.json(ret);
                    }
                });
            }
        );
    });
    // 프로필 초기화
    router.put('/reset', upload.none(), function(req, res) {
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
        user.user_idx = 0;
        res.cookie('SBOOK.uid', crypt.encrypt(JSON.stringify(user)), { signed: true, expires: new Date(Date.now() + 1000 * 60 * process.env.COOKIE_EXPIRE), httpOnly: true });
        ret.success = true;
        return res.json(ret);
    });
    
    
    
    // [ 사용하지 말자 ] 소셜 탈퇴 요청 > user_platform_id = 0 & 모든 연동계정 삭제 > 재가입 시 신규 가입 가능
    // - 카카오 연결끊기
    //  . 새로운 회원코드가 발급되기 때문에, 기존 회원코드를 가지고 있는 앱에서 다시 로그인이 불가. 로그인이 안되기 때문에 앱에서 탈퇴도 못함.
    //  . 앱에서 먼저 탈퇴 처리 후 연결끊기를 사용하는 순서로 가야됨.
    // - 카카오 모든 정보 삭제
    //  . 위 첫번째 상황에서 강제로 삭제요청할 수 있는 기능
    //  . 하지만, 앱에서 이 기능을 사용하지 않으면 탈퇴 불가
    //  . 대부분 만들어 놓지 않음. 사이트 내에서 사용이력이 있기 때문에 별도의 탈퇴 프로세스를 따라야 하기 때문.
    /* router.get('/leave/kakao', function(req, res) {
        console.log(req.query.user_id); // 회원 ID
        console.log(req.query.referrer_type); // UNLINK_FROM_APPS 고정값
        console.log(req.headers.authorization); // 카카오 Admin 키
        let ret = {
            success: false,
            message: null,
            code: '',
        };
        db.query('SELECT * FROM book_user WHERE parent_user_id = ?', [req.user.parent_user_id], function(err, rows, fields) {
            if(err) {
                ret.message = '오류!';
                return res.json(ret);
            }
            db.query(`UPDATE book_user SET
                        parent_user_id = 0,
                        user_name = '',
                        user_email = '',
                        user_profile = '',
                        user_platform_id = '',
                        user_lock = 'no',
                        user_lock_salt = '',
                        user_lock_password = '',
                        user_updated_at = NOW()
                    WHERE parent_user_id = ?`,
                [req.user.parent_user_id],
                function(err, rows, fields) {
                    if(err) {
                        ret.message = '오류!';
                        return res.json(ret);
                    }
                    ret.success = true;
                    ret.message = '탈퇴 처리가 완료되었습니다.';
                    return res.json(ret);
                }
            );
        });
    }); */











    // 프로필 이미지
    router.post('/profile_img', upload.single('profile_img'), function(req, res) {
        console.log(req.file.filename);
    });
    // 오디오 파일 숨기기
    router.get('/audio', upload.none(), function(req, res) {
        fs.readFile('./public/profile/aaa.m4a', function (err, data) {
            res.send(data);
        });
    });
    // 내 아이 등록하기
    router.post('/add_mylove', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        if(!req.body.mylove) return res.json(ret);
        let mylove = req.body.mylove;
        db.query('INSERT INTO test_book_user (relation, relation_user_idx, nickname) VALUES (?, ?, ?)',
            ['children', user_idx, mylove],
            function(err, rows, fields) {
                if(err) {
                    console.log(err);
                    ret.message = '등록 오류!';
                    return res.json(ret);
                }
                ret.success = true;
                return res.json(ret);
            }
        );
    });
    // 내 아이 정보
    router.post('/mylove_list', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            data: [],
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        db.query('SELECT * FROM test_book_user WHERE relation_user_idx = ? AND relation = ?',
            [user_idx, 'children'],
            function(err, rows, fields) {
                if(err) console.log(err);
                ret.success = true;
                ret.data = rows;
                return res.json(ret);
            }
        );
    });
    // 내가 보내준 책 정보
    router.post('/bookshelf_list', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            data: [],
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        db.query(`SELECT * FROM test_book_send
                        INNER JOIN test_book
                    WHERE user_idx = ?`,
            [user_idx, 'children'],
            function(err, rows, fields) {
                if(err) console.log(err);
                ret.success = true;
                ret.data = rows;
                return res.json(ret);
            }
        );
    });
    // 아이가 받은 책 정보
    router.post('/send_list', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            data: [],
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        if(!req.body.mylove) return res.json(ret);
        let mylove = req.body.mylove;
        db.query(`SELECT BI.*, B.* FROM test_book_send BI
                        INNER JOIN test_book B ON B.book_idx = BI.book_idx
                    WHERE BI.to_user_idx = ? AND checked_at IS NULL`,
            [mylove],
            function(err, rows, fields) {
                if(err) console.log(err);
                ret.success = true;
                ret.data = rows;
                return res.json(ret);
            }
        );
    });
    // 사용자 선택
    router.post('/select_user', upload.none(), function(req, res) {
        let select_user = req.body.select_user;
        res.cookie('select_user', select_user, { signed: true, expires: new Date(Date.now() + 1000 * 60 * 1), httpOnly: true }); // 30분 쿠키
        let ret = {
            success: true,
            message: null,
        };
        res.json(ret);
    });
    return router;
}
