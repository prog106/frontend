const db = require('../../modules/common.js').db();
const bodyParser = require('body-parser'); // post 전송용
const moment = require('moment');
moment.locale('ko');

module.exports = function(app) {
    const express = require('express');
    let router = express.Router();

    const request = require('request');
    const google = require('googleapis');

    // google 코드 요청하기
    router.get('/google/request', function(req, res) {
        let OAuth2Client = new google.Auth.OAuth2Client(process.env.GOOGLE_ID, process.env.GOOGLE_SECRET, 'http://localhost:3000/verify/google/response');
        let url = OAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/androidpublisher'],
            approval_prompt: 'force',
        });
        res.redirect(url);
    });

    // google 코드 & refresh_token & access_token 받기 - https://play.google.com/apps/publish/ 구글 개발자 접속 후 진행 가능
    router.get('/google/response', function(req, res) {
        let code = req.query.code;
        let url = 'https://accounts.google.com/o/oauth2/token';
        // code 저장
        db.query('INSERT INTO test_code (platform, code) VALUES (?, ?)', ['google', code], function(err, rows, fields) {
            if(err) return res.render('error.ejs', {'message': 'retry!', 'location': '/'});
            request.post(url, {form: {
                grant_type: 'authorization_code',
                code: code,
                client_id: process.env.GOOGLE_ID,
                client_secret: process.env.GOOGLE_SECRET,
                redirect_uri: 'http://localhost:3000/verify/google/response',
            }}, function(err, response, body) {
                if(err) return res.render('error.ejs', {'message': 'retry!', 'location': '/'});
                let ret = JSON.parse(body);
                // console.log(ret);
                // {
                //     access_token: 'ya29.a0AfH6SMBeRNs9Zk8B_HhyDqnh2l5cQ4A8TcLHWA9xH4hvCo3XUjItDqYXAabaVxDtsVMKn4Mk1p7x5KmvrCeG3HyrFIMkipyRtX9uzrqKfecjKqHNcOF3z3SbGbyWeVX1Z26cR-5Ub2F-lNzMugYODWcrXxl5',
                //     expires_in: 3599,
                //     refresh_token: '1//0eco61p9aTrrRCgYIARAAGA4SNwF-L9IrHtHiA7eCC9D2IcJOWsC05PajcYp1ia0KadWEghRkVqeT1IrIP66f1Cm9YzHNMroJo6k',
                //     scope: 'https://www.googleapis.com/auth/androidpublisher',
                //     token_type: 'Bearer'
                // }
                if(ret.access_token) {
                    let expire = moment().add(ret.expires_in, 's').format('YYYY-MM-DD HH:mm:ss');
                    db.query('UPDATE test_code SET refresh_token = ?, access_token = ?, edate = ? WHERE platform = ?',
                        [ret.refresh_token, ret.access_token, expire, 'google'],
                        function(err, rows, fields) {
                            if(err) return render('error.ejs', {'message': 'retry!', 'location': '/'});
                            return res.send('success');
                        }
                    );
                } else {
                    return res.render('error.ejs', {'message': 'retry!!', 'location': '/'});
                }
            });
        });
    });

    // onestore access_token 받기
    router.get('/onestore/request', function(req, res) {
        let url = `https://${process.env.NODE_ENV !== undefined ? 'apis' : 'sbpp'}.onestore.co.kr/v2/oauth/token`;
        request.post(url, {form: {
            client_id: process.env.ONESTORE_ID,
            client_secret: process.env.ONESTORE_SECRET,
            grant_type: 'client_credentials',
        }}, function(err, response, body) {
            if(err) return render('error.ejs', {'message': 'retry!', 'location': '/'});
            let ret = JSON.parse(body);
            let expire = moment().add(ret.expires_in, 's').format('YYYY-MM-DD HH:mm:ss');
            db.query('INSERT INTO test_code (platform, access_token, edate) VALUES (?, ?, ?)',
                ['onestore', ret.access_token, expire],
                function(err, rows, fields) {
                    if(err) return res.render('error.ejs', {'message': 'retry!', 'location': '/'});
                    return res.send('success');
                }
            );
        });
    });

    return router;
}
