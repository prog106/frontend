module.exports.social = function(db, req, id, username, email, thumbnail, platform, done) {
    db.query('SELECT * FROM book_user WHERE user_platform_id = ? AND user_platform = ?', [id, platform], function(err, rows, fields) {
        if(err) return done(err);
        if(rows.length < 1) {
            db.query(
                'INSERT INTO book_user (user_name, user_email, user_profile, user_platform, user_platform_id, user_created_at, user_updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                [username, email, thumbnail, platform, id],
                function(err, rows, fields) {
                    if(err) return done(err);
                    let user = {
                        // user_idx: rows.insertId,
                        parent_user_idx: rows.insertId,
                        user_name: username,
                        user_id: id,
                        user_email: email,
                        user_profile: thumbnail,
                        platform: platform,
                    }
                    db.query('UPDATE book_user SET parent_user_idx = user_idx WHERE user_idx = ?',
                        [rows.insertId],
                        function(err, rows, fields) {
                        }
                    );
                    return done(null, user);
                }
            );
        } else {
            let info = rows[0];
            let user = {
                // user_idx: info.user_idx,
                parent_user_idx: info.parent_user_idx,
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
