module.exports.db = function() {
    const mysql = require('mysql');
    return mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PWD,
        database: process.env.DB_DATABASE,
        dateStrings: 'date', // 날짜 형식 처리
    });
}

module.exports.redis = function() {
    const redis = require('redis');
    return redis.createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PWD,
        prefix: 'node:',
    });
}
