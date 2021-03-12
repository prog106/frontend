const db = require('../modules/common.js').db();
const moment = require('moment');
moment.locale('ko');

module.exports = function(io) {
    let chat = io.of('/chat').on('connection', function(socket) {
        let user = socket.request.session.passport.user; // 사용자 세션정보
        function reset() {
            // 접속자 정보 업데이트
            db.query(`SELECT CU.socket_id, CU.channel_idx AS channel, U.user_name, U.user_profile FROM test_channel_user CU
                INNER JOIN test_user_social U ON U.user_idx = CU.user_idx`,
                [], function(err, rows, fields) {
                    chat.emit('user_list', rows);
                }
            );
            // 채널 정보 업데이트
            db.query(`SELECT C.channel_idx, C.channel_title, C.channel_created_at, COUNT(CU.user_idx) AS channel_user_count FROM test_channel C
                LEFT JOIN test_channel_user CU ON CU.channel_idx = C.channel_idx GROUP BY 1`,
                [], function(err, rows, fields) {
                    // console.log(rows);
                    rows.forEach(function(v, k) {
                        if(v.channel_user_count < 1) {
                            rows.splice(k, 1);
                            db.query(`DELETE FROM test_channel WHERE channel_idx = ?`, [v.channel_idx], function(err, rows, fields) { });
                        }
                    });
                    chat.emit('channel_list', rows);
                }
            );
        }
        // 참여자 접속
        socket.on('ready', function(data) {
            if(!user.user_idx) {
                socket.emit('redirect', '로그인 후 이용해 주세요.');
                return false;
            }
            // 채널 접속
            db.query(`INSERT INTO test_channel_user (user_idx, socket_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE socket_id = VALUES(socket_id)`,
                [user.user_idx, socket.id],
                function(err, rows, fields) {
                    reset();
                }
            );
        });
        // 참여자 채널 만들기 & 접속
        socket.on('channel', function(data) {
            let title = data.title;
            db.query(`INSERT INTO test_channel (channel_title, channel_created_at) VALUES (?, NOW())`,
                [title], function(err, rows, fields) {
                    console.log(err);
                    console.log(rows);
                    let channel_idx = rows.insertId;
                    console.log(channel_idx);
                    db.query(`UPDATE test_channel_user SET channel_idx = ? WHERE user_idx = ?`,
                        [channel_idx, user.user_idx], function(err, rows, fields) {
                            console.log(err);
                            console.log(rows);
                            socket.join(channel_idx);
                            socket.room = channel_idx;
                            chat.to(channel_idx).emit('join', { // 나에게 or 전체.
                                channel: channel_idx,
                                title: title,
                            });
                            chat.to(channel_idx).emit('notice', {
                                msg: user.user_name + ' 님이 입장하였습니다!',
                            });
                            db.query(`SELECT U.user_name FROM test_channel_user CU
                                INNER JOIN test_user_social U ON U.user_idx = CU.user_idx
                                WHERE CU.channel_idx = ?`,
                                [channel_idx], function(err, rows, fields) {
                                    chat.to(channel_idx).emit('join_list', rows);
                                }
                            );
                            reset();
                        }
                    );
                }
            );
        });
        // 참여자 채널 접속
        socket.on('channel_join', function(data) {
            let channel_idx = data.channel;
            db.query(`SELECT * FROM test_channel WHERE channel_idx = ?`, [channel_idx], function(err, rows, fields) {
                if(rows.length < 1) {
                    socket.emit('redirect', '채널에 참여할 수 없습니다.');
                    reset();
                    return false;
                }
                let channel_title = rows[0].channel_title;
                db.query(`UPDATE test_channel_user SET channel_idx = ? WHERE user_idx = ?`, [channel_idx, user.user_idx], function(err, rows, fields) {
                    socket.join(channel_idx);
                    socket.room = channel_idx;
                    socket.emit('join', { // 나에게
                        channel: channel_idx,
                        title: channel_title,
                    });
                    chat.to(channel_idx).emit('notice', {
                        msg: user.user_name + ' 님이 입장하였습니다.',
                    });
                    db.query(`SELECT U.user_name FROM test_channel_user CU
                        INNER JOIN test_user_social U ON U.user_idx = CU.user_idx
                        WHERE CU.channel_idx = ?`,
                        [channel_idx], function(err, rows, fields) {
                            console.log(rows);
                            chat.to(channel_idx).emit('join_list', rows);
                        }
                    );
                    reset();
                });

            });
        });
        socket.on('leave', function(data) {
            db.query(`SELECT * FROM test_channel_user WHERE user_idx = ?`, [user.user_idx], function(err, rows, fields) {
                if(rows.length > 0) {
                    console.log(rows);
                    let channel_idx = rows[0].channel_idx;
                    console.log(channel_idx);
                    db.query(`UPDATE test_channel_user SET channel_idx = 0 WHERE user_idx = ?`, [user.user_idx], function(err, rows, fields) {
                        chat.to(channel_idx).emit('notice', {
                            msg: user.user_name + ' 님이 나갔습니다.',
                        });
                    });
                    db.query(`SELECT U.user_name FROM test_channel_user CU
                        INNER JOIN test_user_social U ON U.user_idx = CU.user_idx
                        WHERE CU.channel_idx = ?`,
                        [channel_idx], function(err, rows, fields) {
                            if(rows.length < 1) { // 아무도 없으면 방 삭제
                                db.query(`DELETE FROM test_channel WHERE channel_idx = ?`, [channel_idx], function(err, rows, fields) { })
                            } else {
                                chat.to(channel_idx).emit('join_list', rows);
                            }
                        }
                    );
                    socket.leave(channel_idx);
                    socket.room = 0;
                }
                reset();
            });
        });
        socket.on('disconnect', function(data) {
            db.query(`SELECT * FROM test_channel_user WHERE user_idx = ?`, [user.user_idx], function(err, rows, fields) {
                if(rows.length > 0) {
                    let channel_idx = rows[0].channel_idx;
                    socket.leave(channel_idx);
                    db.query(`UPDATE test_channel_user SET channel_idx = 0 WHERE user_idx = ?`, [user.user_idx], function(err, rows, fields) {
                        chat.to(channel_idx).emit('notice', {
                            msg: user.user_name + ' 님이 나갔습니다.',
                        });
                    });
                    db.query(`SELECT U.user_name FROM test_channel_user CU
                        INNER JOIN test_user_social U ON U.user_idx = CU.user_idx
                        WHERE CU.channel_idx = ?`,
                        [channel_idx], function(err, rows, fields) {
                            if(rows.length < 1) { // 아무도 없으면 방 삭제
                                db.query(`DELETE FROM test_channel WHERE channel_idx = ?`, [channel_idx], function(err, rows, fields) { })
                            } else {
                                chat.to(channel_idx).emit('join_list', rows);
                            }
                        }
                    );
                }
                socket.emit('reload');
                reset();
            });
        });
        socket.on('chat', function(data) {
            let channel_idx = data.channel;
            let msg = data.msg;
            db.query(`INSERT INTO test_channel_chat (channel_idx, user_idx, chat, chat_created_at) VALUES (?, ?, ?, NOW())`,
                [channel_idx, user.user_idx, msg],
                function(err, rows, fields) {
                    if(rows.insertId > 0) {
                        let res = {
                            idx: user.user_idx,
                            author: user.user_name,
                            msg: data.msg,
                            time: moment().format('LT'), // 오후 2:48
                        }
                        chat.to(channel_idx).emit('chat', res);
                    } else {
                        // 메시지 전송 실패 - 나에게만
                        chat.to(channel_idx).emit('notice', {
                            idx: user.user_idx,
                            msg: '메시지 발송 실패',
                        });
                    }
                }
            );
        });
    });

    return chat;
}
