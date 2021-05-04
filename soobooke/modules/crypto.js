const cryptojs = require('crypto-js');
require('dotenv').config({ path: __dirname + `/.env${process.env.NODE_ENV !== undefined ? '.live' : ''}`});
module.exports.encrypt = function(data) {
    return cryptojs.AES.encrypt(JSON.stringify(data), process.env.CRYPT_SECRET).toString();
}
module.exports.decrypt = function(data) {
    return JSON.parse(cryptojs.AES.decrypt(data, process.env.CRYPT_SECRET).toString(cryptojs.enc.Utf8));
}
