module.exports.social = function(db, req, id, username, email, thumbnail, platform, done) {
    db.query('SELECT * FROM book_user WHERE user_platform_id = ? AND user_platform = ?', [id, platform], function(err, rows, fields) {
        if(err) return done(err);
        if(rows.length < 1) {
            db.beginTransaction(function(err) {
                if(err) return done(null, false, { message: 'error' });
                db.query('INSERT INTO book_user (user_name, user_email, user_profile, user_platform, user_platform_id, user_created_at, user_updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                    [username, email, thumbnail, platform, id],
                    function(err, rows, fields) {
                        if(err) {
                            db.rollback(function(err) {
                                done(null, false, { message: 'error' });
                            });
                            return false;
                        }
                        let user = {
                            // user_idx: rows.insertId,
                            parent_user_idx: rows.insertId,
                            // user_name: username,
                            // user_email: email,
                            // user_profile: thumbnail,
                            // user_platform: platform,
                        }
                        db.query('UPDATE book_user SET parent_user_idx = user_idx WHERE user_idx = ?',
                            [rows.insertId],
                            function(err, rows, fields) {
                                if(err) {
                                    db.rollback(function(err) {
                                        done(null, false, { message: 'error' });
                                    });
                                    return false;
                                }
                                db.commit(function(err) {
                                    if(err) {
                                        db.rollback(function(err) {
                                            done(null, false, { message: 'error' });
                                        });
                                        return false;
                                    }
                                    return done(null, user);
                                });
                            }
                        );
                    }
                );
            });
        } else {
            let info = rows[0];
            // 탈퇴 회원은 로그인 불가 처리
            if(info.parent_user_idx == 0) {
                return done(null, false, { message: 'signout' }); // 탈퇴 회원입니다.\n\n재가입을 원하시면 이용안내를 참고하세요.
            }
            let user = {
                // user_idx: info.user_idx,
                parent_user_idx: info.parent_user_idx,
                // user_name: info.user_name,
                // user_email: info.user_email,
                // user_profile: info.user_profile,
                // user_platform: info.user_platform,
            }
            return done(null, user);
        }
    });
};
module.exports.choose = function(db, user, puser, done) {
    if(!puser) return done(null, false, { code: 'logout', message: '로그인 후 이용해 주세요.' });
    if(!user) return done(null, false, { code: '', message: '사용자를 선택해 주세요.' });
    const crypto = require('crypto');
    db.query('SELECT * FROM book_user WHERE parent_user_idx = ?',
        [puser.parent_user_idx],
        function(err, rows, fields) {
            if(err) return done(null, false, { code: '', message: '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.' });
            if(rows.length < 1) return done(null, false, { code: 'logout', message: '로그인 후 이용해 주세요.' });
            rows.forEach(function(v, k) {
                if(user == crypto.createHash('sha512').update(`{user_idx:${v.user_idx}}`).digest('base64')) {
                    let row = v;
                    if(row.user_lock == 'yes') {
                        return done(null, false, { code: 'lock' });
                    } else {
                        let login = {
                            user_idx: row.user_idx,
                            parent_user_idx: row.parent_user_idx,
                            user_name: row.user_name,
                            user_profile: row.user_profile,
                            user_email: row.user_email,
                            user_platform: row.user_platform,
                        }
                        return done(null, login);
                    }
                }
            });
        }
    );
};
module.exports.lock_choose = function(db, user, password, puser, redis, done) {
    if(!puser) return done(null, false, { code: 'logout', message: '로그인 후 이용해 주세요.' });
    if(!user) return done(null, false, { code: '', message: '사용자를 선택해 주세요.' });
    if(!password) return done(null, false, { code: '', message: '비밀번호를 입력해 주세요.' });
    const crypto = require('crypto');
    const moment = require('moment');
    const bkfd2Password = require('pbkdf2-password');
    const hasher = bkfd2Password();
    if(user != crypto.createHash('sha512').update(`{user_idx:${puser.parent_user_idx}}`).digest('base64')) return done(null, false, { code: 'logout', message: '로그인 후 이용해 주세요.' });
    db.query('SELECT * FROM book_user WHERE user_idx = ?',
        [puser.parent_user_idx], function(err, rows, fields) {
            if(err) return done(null, false, { code: '', message: '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.' });
            if(rows.length < 1) return done(null, false, { code: 'logout', message: '로그인 후 이용해 주세요.' });
            let countkey = `errorpwd_count_${puser.parent_user_idx}`;
            let limitkey = `errorpwd_limit_${puser.parent_user_idx}`;
            redis.get(limitkey, function(err, val) {
                if(val > moment().unix()) {
                    return done(null, false, { code: '', message: (val - moment().unix())+'초 후 잠금해제를 시도할 수 있습니다.' });
                } else {
                    let row = rows[0];
                    hasher({ password: password, salt: row.user_lock_salt }, function(err, pass, salt, hash) {
                        if(row.user_lock_password === hash) {
                            let login = {
                                user_idx: row.user_idx,
                                parent_user_idx: row.parent_user_idx,
                                user_name: row.user_name,
                                user_profile: row.user_profile,
                                user_email: row.user_email,
                                user_platform: row.user_platform,
                            }
                            redis.del(countkey);
                            redis.del(limitkey);
                            return done(null, login);
                        } else {
                            redis.get(countkey, function(err, count) {
                                count = (count) ? parseInt(count) + 1 : 1;
                                redis.set(countkey, count, function(err, rf) {
                                    if(count >= 5) {
                                        let limit = Math.floor(count / 5);
                                        redis.set(limitkey, moment().add(60*limit, 'second').unix(), 'EX', 60*limit, function(err, rs) { });
                                        return done(null, false, { code: '', message: '비밀번호를 5회 이상 잘못 입력하였습니다.\n\n앞으로 '+limit+'분간 잠금해제를 할 수 없습니다.' });
                                    } else {
                                        return done(null, false, { code: '', message: '비밀번호를 '+count+'회 잘못 입력하였습니다.' });
                                    }
                                });
                            });
                        }
                    });
                }
            });
        }
    );
};
/* module.exports.login = function(db, parent_user, user_idx, done) {
    db.query('SELECT * FROM book_user WHERE user_idx = ? AND parent_user_idx = ?',
        [user_idx, parent_user.parent_user_idx], function(err, rows, fields) {
            if(err) return res.json(ret);
            if(rows.length < 1) return done(null, false, 'logout');
            let row = rows[0];
            if(row.user_lock == 'yes') return done(null, false, 'lock');
            let login = {
                user_idx: row.user_idx,
                parent_user_idx: row.parent_user_idx,
                user_name: row.user_name,
                user_email: row.user_email,
                user_profile: row.user_profile,
                user_platform: row.user_platform,
            }
            return done(null, login);
        }
    );
}; */
module.exports.login_check = function(uid) {
    const crypt = require('../modules/crypto.js');
    if(!uid) return false;
    else return JSON.parse(crypt.decrypt(uid));
};
