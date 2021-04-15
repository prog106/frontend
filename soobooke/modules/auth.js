/* module.exports.guest = function(db, id, name, platform, done) {
    db.query('SELECT * FROM test_user_social WHERE auth_id = ? AND platform = ?', [id, platform], function(err, rows, fields) {
        if(err) return done(err);
        if(rows.length < 1) {
            db.query(
                'INSERT INTO test_user_social (platform, auth_id, user_name, user_email, user_profile, user_created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                [platform, id, name, '', ''],
                function(err, rows, fields) {
                    if(err) return done(err);
                    let user = {
                        user_idx: rows.insertId,
                        user_name: name,
                        user_id: id,
                        user_email: null, // local 은 이메일 없음.
                        user_profile: null,
                        platform: platform,
                    }
                    return done(null, user);
                }
            );
        } else {
            let info = rows[0];
            let user = {
                user_idx: info.user_idx,
                user_name: info.user_name,
                user_id: info.auth_id,
                user_email: info.user_email,
                user_profile: info.user_profile,
                platform: info.platform,
            }
            return done(null, user);
        }
    });
} */

module.exports.social = function(db, req, id, username, email, thumbnail, platform, done) {
    db.query('SELECT * FROM test_book_user WHERE auth_id = ? AND platform = ?', [id, platform], function(err, rows, fields) {
        if(err) return done(err);
        if(rows.length < 1) {
            if(req.user) {
                if(req.user.platform != 'local') return done(null, false);
                db.query(
                    'UPDATE test_book_user SET platform = ?, auth_id = ?, user_name = ?, user_email = ?, user_profile = ?, user_connected_at = NOW() WHERE user_idx = ?',
                    [platform, id, username, email, thumbnail, req.user.user_idx],
                    function(err, rows, fields) {
                        if(err) return done(err);
                        let user = {
                            user_idx: req.user.user_idx,
                            user_name: username,
                            user_id: id,
                            user_email: email,
                            user_profile: thumbnail,
                            platform: platform,
                        }
                        return done(null, user);
                    }
                );
            } else {
                db.query(
                    'INSERT INTO test_book_user (platform, auth_id, user_name, user_email, user_profile, user_created_at, user_connected_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                    [platform, id, username, email, thumbnail],
                    function(err, rows, fields) {
                        if(err) return done(err);
                        let user = {
                            user_idx: rows.insertId,
                            user_name: username,
                            user_id: id,
                            user_email: email,
                            user_profile: thumbnail,
                            platform: platform,
                        }
                        return done(null, user);
                    }
                );
            }
        } else {
            let info = rows[0];
            let user = {
                user_idx: info.user_idx,
                user_name: info.user_name,
                user_id: info.auth_id,
                user_email: info.user_email,
                user_profile: info.user_profile,
                platform: info.platform,
            }
            return done(null, user);
        }
    });
}
