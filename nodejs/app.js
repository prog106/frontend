const express = require('express');
const app = express();

const bodyParser = require('body-parser');
// const mysql = require('mysql');
const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
// const db = mysql.createConnection({
//     host: 'localhost',
//     port: '3306',
//     user: 'test',
//     password: '1004',
//     database: 'testDB',
// });
const redisClient = redis.createClient({
    host: '...',
    port: '6379',
    //password: '',
    // prefix: '',
});
redisClient.on('error', function(err) { console.log('Redis error: ' + err); });
app.use(session({ // session
    secret: '1234',
    resave: false,
    saveUninitialized: true,
    store: new RedisStore({ client: redisClient, ttl: 60*30 }),
}));

app.use(express.static('public')); // static
app.use(bodyParser.urlencoded({extended: false})); // post

app.set('view engine', 'ejs'); // ejs template
app.set('views', './views');

app.use('/', require('./routes/index.js')(app));
app.use('/forms', require('./routes/forms.js')());
app.use('/user', require('./routes/user.js')());
app.use('/ax', require('./routes/ax.js')(app));

app.use((req, res) => {
    res.status(404).send('Page Not Found!')
});

app.listen(3000, function() { // 서버 실행
    console.log(`Server running at :3000`);
});
