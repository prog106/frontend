module.exports=function(app) {
    const db = require('../modules/common.js').db();
    const express = require('express');
    const request = require('request');
    const bodyParser = require('body-parser'); // post 전송용
    const multer  = require('multer');
    const upload = multer({ dest: 'uploads/' });

    let router = express.Router();

    app.use(bodyParser.urlencoded({extended: false})); // post 전송용

    // 책 찾기 - naver : 검색되는 책 수가 더 많음.
    router.put('/', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            data: [],
        };
        if(!req.body.keyword) return res.json(ret);
        let keyword = encodeURI(req.body.keyword);
        let display = 10;
        let page = (req.body.page) ? req.body.page * display : 1;
        let url = `https://openapi.naver.com/v1/search/book.json?query=${keyword}&start=${page}&display=${display}&sort=count`;
        // get
        let options = {
            url: url,
            headers: {
                'X-Naver-Client-Id': process.env.NAVER_ID,
                'X-Naver-Client-Secret': process.env.NAVER_SECRET,
            }
        };
        request.get(options, function(err, response, body) {
            let data = JSON.parse(body);
            if(data.items.length > 0) {
                data.items.forEach(function(v, k) {
                    let ex = v.isbn.split(' ');
                    let isbn10 = ex[0];
                    let isbn13 = ex[1];
                    let title = v.title;
                    let publisher = v.publisher;
                    let authors = v.author;
                    let translators = '';
                    let price = v.price;
                    let thumbnail = v.image;
                    // let contents = v.description;
                    let regdate = v.pubdate.substr(0, 4)+'-'+v.pubdate.substr(4,2)+'-'+v.pubdate.substr(6,2);
                    let link = v.link;
                    ret.data.push({
                        isbn10: isbn10,
                        isbn13: isbn13,
                        title: title,
                        publisher: publisher,
                        authors: authors, 
                        translators: translators,
                        price: price, 
                        thumbnail: thumbnail, 
                        // contents: contents, 
                        regdate: regdate, 
                        link: link,
                    });
                });
                ret.info = {
                    total_count: data.total,
                    is_end: (data.start + data.display > data.total)? true : false,
                }
                ret.success = true;
                return res.json(ret);
            } else {
                ret.message = '일치하는 데이터가 없습니다.';
                return res.json(ret);
            }
        });
    });
    // 책 찾기 - daum (사용안함)
    router.put('/daum', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            data: [],
            info: {},
        };
        return res.json(ret);
        if(!req.body.keyword) return res.json(ret);
        let keyword = encodeURI(req.body.keyword);
        let page = (req.body.page) ? req.body.page : 1;
        let url = `https://dapi.kakao.com/v3/search/book?query=${keyword}&page=${page}`;
        // get
        let options = {
            url: url,
            headers: {
                'Authorization': "KakaoAK "+process.env.KAKAO_ID,
            }
        }
        request.get(options, function(err, response, body) {
            let data = JSON.parse(body);
            if(data.documents.length > 0) {
                data.documents.forEach(function(v, k) {
                    let ex = v.isbn.split(' ');
                    let isbn10 = ex[0];
                    let isbn13 = ex[1];
                    let title = v.title;
                    let publisher = v.publisher;
                    let authors = v.authors.join(',');
                    let translators = v.translators.join(',');
                    let price = v.price;
                    let thumbnail = v.thumbnail;
                    // let contents = v.contents;
                    let regdate = v.datetime.substr(0, 10);
                    let link = v.url;
                    ret.data.push({
                        isbn10: isbn10,
                        isbn13: isbn13,
                        title: title,
                        publisher: publisher,
                        authors: authors, 
                        translators: translators, 
                        price: price,
                        thumbnail: thumbnail, 
                        // contents: contents, 
                        regdate: regdate, 
                        link: link,
                    });
                });
                ret.info = {
                    total_count: data.meta.total_count,
                    is_end: data.meta.is_end,
                }
                ret.success = true;
                return res.json(ret);
            } else {
                ret.message = '일치하는 데이터가 없습니다.';
                return res.json(ret);
            }
        });
    });
    return router;
}
