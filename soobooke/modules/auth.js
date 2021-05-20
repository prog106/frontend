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
                            user_name: username,
                            user_email: email,
                            user_profile: thumbnail,
                            user_platform: platform,
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
                return done(null, false, { message: 'signout' }) // 탈퇴 회원입니다.\n\n재가입을 원하시면 이용안내를 참고하세요.
            }
            let user = {
                // user_idx: info.user_idx,
                parent_user_idx: info.parent_user_idx,
                user_name: info.user_name,
                user_email: info.user_email,
                user_profile: info.user_profile,
                user_platform: info.user_platform,
            }
            return done(null, user);
        }
    });
};
module.exports.login = function(db, parent_user, user_idx, done) {
    db.query('SELECT * FROM book_user WHERE user_idx = ? AND parent_user_idx = ?',
        [user_idx, parent_user.parent_user_idx], function(err, rows, fields) {
            if(err) return res.json(ret);
            if(rows.length < 1) return done(null, false, 'logout');
            let row = rows[0];
            if(row.user_lock == 'yes') return done(null, false, 'lock');
            let user = {
                user_idx: row.user_idx,
                parent_user_idx: row.parent_user_idx,
                user_name: row.user_name,
                user_email: row.user_email,
                user_profile: row.user_profile,
                user_platform: row.user_platform,
            }
            // console.log(done);
            return done(null, user);
        }
    );
};
module.exports.login_check = function(uid) {
    const crypt = require('../modules/crypto.js');
    if(!uid) return false;
    else return JSON.parse(crypt.decrypt(uid));
};
module.exports.cookie_check = function(cookie) {
    const crypt = require('../modules/crypto.js');
    if(!cookie) return false;
    else return JSON.parse(crypt.decrypt(cookie));
};
module.exports.session_check = function(session) {
    if(!session.user_idx) return false;
    else return {
        user_idx: session.user_idx,
        user_name: session.user_name,
        user_email: session.user_email,
        user_profile: session.user_profile,
        user_platform: session.user_platform,
        parent_user_idx: session.parent_user_idx,
    }
};
