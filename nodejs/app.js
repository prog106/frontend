const express = require('express');
const app = express();

require('dotenv').config();
const session = require('express-session');

const redisClient = require('./modules/common.js').redis();
redisClient.on('error', function(err) { console.log('Redis error: ' + err); });
const RedisStore = require('connect-redis')(session);
app.use(session({ // session
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new RedisStore({ client: redisClient, ttl: 60*30 }),
}));

app.use(express.static('public'));

app.set('view engine', 'ejs'); // ejs template
app.set('views', './views');

app.use('/', require('./routes/index.js')());
app.use('/forms', require('./routes/forms.js')());
app.use('/user', require('./routes/user.js')());
app.use('/ax', require('./routes/ax.js')());

app.use((req, res) => {
    return res.status(404).send('Page Not Found!')
});

app.listen(3000, function() { // 서버 실행
    console.log(`Server running at :3000`);
});
