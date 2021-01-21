const express = require('express');
const app = express();

const bodyParser = require('body-parser'); // post 전송용
const cookieParser = require('cookie-parser'); // cookie
const session = require('express-session'); // session - 메모리 저장 방식 > 리스타트 시 초기화
const MysqlStore = require('express-mysql-session'); // mysql session

app.use(express.static('public')); // public 폴더는 static 선언 ( 정적파일. 이미지/HTML 등 ). 리스타트가 필요없음 ( 자동갱신 ). 라이터에서 사용하는 이름과 중복되지 않도록 사용 ( public 폴더명 생략해야 됨 ).
app.use(bodyParser.urlencoded({extended: false})); // post 전송용
app.use(cookieParser('1234')); // cookie
app.use(session({
    secret: '1234',
    resave: false,
    saveUninitialized: true,
    // store: new MysqlStore()
})); // session

app.set('view engine', 'ejs'); // 템플릿 엔진 선언. ejs/pug
// app.set('views', './views'); // views 가 기본 폴더라 선언하지 않아도 됨.

app.get('/', function(req, res) { // 기본
    res.send('Hello world!');
});

// session
app.get('/session', function(req, res) {
    req.session.count = req.session.count ? req.session.count + 1 : 1;
    res.send('count : ' + req.session.count);
});

// passport 사용
let auth = require('./routes/auth.js')(app);
app.use('/auth', auth);


// cookie
app.get('/cookie', function(req, res) {
    let count = req.signedCookies.count ? parseInt(req.signedCookies.count) + 1 : 1;
    res.cookie('count', count, {signed: true});
    res.send('count : ' + count);
});

app.get('/dynamic', function(req, res) {
    let lis = '<ul>';
    for(let i=0;i<5;i++) {
        lis += '<li>nodejs</li>';
    }
    lis += '</ul>';

    let time = Date();

    let output = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <h1>Dynamic</h1>
        ${lis}
        ${time}
    </body>
    </html>
    `;
    res.send(output);
});

app.get('/template', function(req, res) { // render 사용
    res.render('index', {data: 'Hi'}); // Data 전달. views/index.ejs 는 리스타트가 필요없음 ( 자동갱신 )
});

app.get('/topic', function(req, res) { // query string ( GET 값 ) 처리
    res.send(req.query.id?req.query.id:'no data'); // topic?id=1 >> 결과 : 1 , topic?name=prog106 >> res.send(req.query.name) >> 결과 : prog106
});

app.get('/topic/:num', function(req, res) { // semantic URL 처리
    let topics = [
        'Javascript is ...',
        'Nodejs is ...',
        'Express is ...',
    ];
    // res.json(topics); // json 처리
    res.send(topics[req.params.num]?topics[req.params.num]:'no data');
});

app.get('/semantic/:name', function(req, res) { // semantic URL 처리
    res.send(req.params.name); // semantic/prog106 >> 결과 : prog106
});

// post form
app.get('/form', function(req, res) {
    res.render('form');
});

app.post('/topic', function(req, res) {
    let name = req.body.name;
    let email = req.body.email;
    res.send(`name : ${name} , email : ${email}`);
});

// mysql

const mysql = require('mysql');

app.get('/mysql', function(req, res) {
    res.send(`mysql sample`);
    /* const dbconn = mysql.createConnection({
        host: 'localhost',
        port: '3306',
        user: 'test',
        password: '1004',
        database: 'testDB',
    }); */

    /* let sql = 'SELECT * FROM tb_user WHERE user_id = ?';
    let params = ['1234567890'];
    dbconn.query(sql, params, function(err, rows, fields) {
        if(err) res.status(500).send('<h1>Internal Server Error</h1>');
        console.log(rows);
        res.render('mysql', {'rows': rows});
        //res.send(` ${rows.length} `);
    }); */

    /* sql = 'INSERT INTO tb_user (user_id) VALUES (?)';
    params = ['1234567891'];
    dbconn.query(sql, params, function(err, rows, fields) {
        if(err) res.status(500).send('<h1>Internal Server Error</h1>');
        console.log(rows);
        res.render('mysql', {'rows': rows});
        // res.send(` ${rows.insertId} `);
    }); */

    /* dbconn.end(); */
});

// module
app.get('/module', function(req, res) {
    let sum = require('./modules/sum.js');
    console.log(sum(1, 2));

    let cal = require('./modules/cal.js');
    console.log('SUM : ' + cal.sum(1, 2));
    console.log('AVG : ' + cal.avg(1, 3));

    res.send();
});

// router1
let router1 = require('./routes/router1.js');
const { propfind } = require('./routes/router1.js');
app.use('/router1', router1);

// router2
let t = 1;
let router2 = require('./routes/router2.js')(app, t);
app.use('/router2', router2);

// multi
app.get(['/multi', '/multi/:id'], function(req, res) {
    if(req.params.id) {
        res.send(req.params.id);
    } else {
        res.send('multi');
    }
});





app.listen(3000, function() { // 서버 실행
    console.log(`Server running at :3000`);
});
