const redis = require('../../modules/common.js').redis();
module.exports = function(io) {
    let chat = io.of('/star').on('connection', function(socket) {
        let user = socket.request.session.passport.user;
        socket.on('record', function(data) {
            let keys = 'phaser_star';
            redis.zadd(keys, data.record, user.user_id, function(err, rows) {
                if(err) console.log(err);
                // 등수
                redis.zrevrank(keys, user.user_id, function(err, rows) {
                    if(err) console.log(err);
                    // console.log(rows);
                    // 내 등수 +- 5
                    redis.zrevrange(keys, ((rows<5)?0:rows-5), ((rows<5)?9:rows+5), 'withscores', function(err, rows) {
                        if(err) console.log(err);
                        let result = rows.reduce(function (a, c, i) {
                            var idx = i / 2 | 0;
                            if (i % 2) {
                              a[idx].score = c;
                            } else {
                              a[idx] = { id: c };
                            }
                            return a;
                        }, []);
                        socket.emit('ranking', result);
                    });
                });
            });
        });
    });
    return chat;
}
