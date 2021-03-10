const db = require('../../modules/common.js').db();
const bodyParser = require('body-parser'); // post 전송용
const moment = require('moment');
moment.locale('ko');

module.exports = function(app) {
    const express = require('express');
    let router = express.Router();

    const request = require('request');
    const google = require('googleapis');

    // google 영수증 검증 & token 갱신
    router.post('/google', function(req, res) {
        if(!req.body.receipt) return render('error.ejs', {'message': 'retry!', 'location': '/'});
        let rec = JSON.parse(req.body.receipt);
        // 검증 요청
        let packageName = rec.packageName;
        let productId = rec.productId;
        let purchaseToken = rec.purchaseToken;
        // 결제 처리
        let orderId = rec.orderId;
        let purchaseTime = rec.purchaseTime;
        let purchaseState = rec.purchaseState;

        db.query('SELECT * FROM test_code WHERE platform = \'google\'', [], function(err, rows, fields) {
            if(err) return render('error.ejs', {'message': 'retry!', 'location': '/'});
            let row = rows[0];
            let access_token = row.access_token;
            // token 유효기간 확인 & 갱신
            if(row.edate < moment().add(60, 's').format('YYYY-MM-DD HH:mm:ss')) {
                let url = `https://accounts.google.com/o/oauth2/token`;
                request.post(url, {form: {
                    grant_type: 'refresh_token',
                    client_id: process.env.GOOGLE_ID,
                    client_secret: process.env.GOOGLE_SECRET,
                    refresh_token: row.refresh_token,
                }}, function(err, response, body) {
                    if(err) return render('error.ejs', {'message': 'retry!', 'location': '/'});
                    let ret = JSON.parse(body);
                    // console.log(body);
                    // {
                    //     access_token: 'ya29.a0AfH6SMCjznpijyIvx-qy9MqUt0diGny0eD62B1yei9oahaOAZ7ik77x0xIh86AD_1xk25ygU13G4Ut8QNHGwxR02K8irM5gZNJFK0DuJcES5ej7cwJ64N5LNVaILO-qNvuD6otbxXm5kprC6ex0Uo6RL92Qh',
                    //     expires_in: 3599,
                    //     scope: 'https://www.googleapis.com/auth/androidpublisher',
                    //     token_type: 'Bearer'
                    // }
                    if(ret.access_token) {
                        access_token = ret.access_token;
                        let expire = moment().add(ret.expires_in, 's').format('YYYY-MM-DD HH:mm:ss');
                        db.query('UPDATE test_code SET access_token = ?, edate = ? WHERE platform = ?',
                            [ret.access_token, expire, 'google'],
                            function(err, rows, fields) {
                                if(err) return render('error.ejs', {'message': 'retry!', 'location': '/'});
                            }
                        );
                    } else return render('error.ejs', {'message': 'retry!', 'location': '/'});
                });
            }
            // 영수증 검증
            const promise = new Promise(function(resolve, reject) {
                let url = `https://www.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}/?access_token=${access_token}`;
                request.get(url, function(err, response, body) {
                    let rep = JSON.parse(body);
                    if(rep.purchaseState === 0) resolve(true);
                    else reject(false);
                });
            });
            promise()
            .then(function() {
                // 영수증 결제 성공 & DB 처리
                console.log(orderId);
                console.log(purchaseState);
                console.log(purchaseTime);
            })
            .catch(function(err) {
                // 영수증 결제 실패 & DB 처리
                console.log(err);
            });
        });
    });

    // apple 영수증 검증
    router.post('/apple', function(req, res) {
        if(!req.body.receipt) return render('error.ejs', {'message': 'retry!', 'location': '/'});
        let receipt = req.body.receipt;
        const promise = new Promise(function(resolve, reject) {
            let url = `https://${process.env.NODE_ENV !== undefined ? 'buy' : 'sandbox'}.itunes.apple.com/verifyReceipt`;
            request.post(url, {form: {
                'receipt-data': receipt
            }}, function(err, response, body) {
                if(err) reject(false);
                let rep = JSON.parse(body);
                console.log(rep);
                if(rep.status === 0) resolve(rep.receipt.in_app[0].original_transaction_id);
                else reject(false); // error 메시지 처리 필요
            });
        });
        promise()
        .then(function(orderId) {
            // 영수증 결제 성공 & DB 처리
            console.log(orderId);
        })
        .catch(function(err) {
            // 영수증 결제 실패 & DB 처리
            console.log(err);
        });
    });

    // onestore 영수증 검증 & token 갱신
    router.get('/onestore', function(req, res) {
        if(!req.body.receipt) return render('error.ejs', {'message': 'retry!', 'location': '/'});
        let rec = JSON.parse(req.body.receipt);
        let purchaseId = rec.purchaseId;
        let packageName = rec.packageName;
        let productId = rec.productId;
        let orderId = rec.orderId;

        db.query('SELECT * FROM test_code WHERE platform = \'onestore\'', [], function(err, rows, fields) {
            if(err) return render('error.ejs', {'message': 'retry!', 'location': '/'});
            let row = rows[0];
            let access_token = row.access_token;
            // token 유효기간 확인 & 갱신
            if(row.edate < moment().add(60, 's').format('YYYY-MM-DD HH:mm:ss')) {
                let url = `https://${process.env.NODE_ENV !== undefined ? 'apis' : 'sbpp'}.onestore.co.kr/v2/oauth/token`;
                request.post(url, {form: {
                    client_id: process.env.ONESTORE_ID,
                    client_secret: process.env.ONESTORE_SECRET,
                    grant_type: 'client_credentials',
                }}, function(err, response, body) {
                    if(err) return render('error.ejs', {'message': 'retry!', 'location': '/'});
                    let ret = JSON.parse(body);
                    let expire = moment().add(ret.expires_in, 's').format('YYYY-MM-DD HH:mm:ss');
                    db.query('UPDATE test_code SET access_token = ?, edate = ? WHERE platform = ?',
                        [ret.access_token, expire, 'onestore'],
                        function(err, rows, fields) {
                            if(err) return render('error.ejs', {'message': 'retry!', 'location': '/'});
                            let access_token = ret.access_token;
                        }
                    );
                });
            }
            // 영수증 검증
            const promise = new Promise(function(resolve, reject) {
                let options = {
                    url: `https://${process.env.NODE_ENV !== undefined ? 'apis' : 'sbpp'}.onestore.co.kr/v2/purchase/details-by-productid/${purchaseId}/${packageName}/${productId}`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + access_token,
                    },
                    // encoding: 'binary'
                }
                request(options, function(err, response, body) {
                    let rep = JSON.parse(body);
                    console.log(rep);
                    if(rep.purchaseStatus === 0) resolve(true);
                    else reject(false); // error 메시지 처리 필요
                });
            });
            promise()
            .then(function() {
                // 영수증 결제 성공 & DB 처리
                console.log(orderId);
                console.log(productId);
                console.log(packageName);
                console.log(purchaseId);
            })
            .catch(function(err) {
                // 영수증 결제 실패 & DB 처리
                console.log(err);
            });
        });
    });

    return router;
}
