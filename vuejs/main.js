'use strict';

// 기본
var app = new Vue({
    el: '#app',
    data: {
        message: '안녕',
    }
});
app.message = '새로운 메시지';

// 속성 처리
var app2 = new Vue({
    el: '#app2',
    data: {
        message: 'over time ' + new Date(), // ``오버시간 ${new Date()} `
    }
});
app2.message = 'hi';

// toggle 처리 ( show / hide )
var app3 = new Vue({
    el: '#app3',
    data: {
        seen: true,
    }
});
app3.seen = false;

// for , push javascript 문법 동일
var app4 = new Vue({
    el: '#app4',
    data: {
        todos: [
            { text: '1번' },
            { text: '2번' },
            { text: '3번' },
            { text: '4번' },
        ]
    }
});
app4.todos.push({text:'5번'});


var app5 = new Vue({
    el: '#app5',
    data: {
        message: '텍스트입니다.',
    },
    methods: {
        reserveMethod: function() {
            this.message = this.message.split('').reverse().join('');
        }
    }
});