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
        ],
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

var app6 = new Vue({
    el: '#app6',
    data: {
        message: 'hi vue!',
    }
});

var test1 = new Vue({
    el: '#test1',
    data: {
        choose: true,
        btn_name: '바꾸기',
        pants: '/shopping/img/blue_p.png',
        skirt: '/shopping/img/blue_s.png',
    },
    methods: {
        chooseMethod: function() {
            this.choose = !this.choose; // this === test1
        }
    },
});

var test2 = new Vue({
    el: '#test2',
    data: {
        blog_name: '거위의 꿈',
    },
    methods: {
        blog_link() {
            return 'http://color106.egloos.com/' + '#' + this.blog_name;
        },
    }
});

var test3 = new Vue({
    el: '#test3',
    data: {
        year: 2018,
    },
    methods: {
        plus() {
            this.year++;
        },
        minus() {
            this.year--;
        }
    }
});

var test4 = new Vue({
    el: '#test4',
    data: {
        text1: 'hi',
        text2: 'hello',
    },
    methods: {
        submit() {
            alert('submit!');
        },
        keyup1(e) {
            console.log(e.target.value);
            this.text = e.target.value;
        },
    }
});

var test5 = new Vue({
    el: '#test5',
    data: {
        number: 1,
        message: '안녕하세요'
    },
    methods: { // 캐싱되지 않음
        m_reversedMessage() { // 호출 m_reversedMessage()
            this.message = '헬로우';
            // return this.message.split('').reverse().join('');
        }
    },
    computed: { // 캐싱됨
        reversedMessage() { // 호출 reversedMessage
            return this.message.split('').reverse().join('');
        }
    }
});

var test6 = new Vue({
    el: '#test6',
    data: {
        message: '안녕하세요',
        updated: 'no',
    },
    methods: { // 캐싱되지 않음
        changeMessage() {
            this.message = '헬로우';
        }
    },
    computed: { // 캐싱됨
    },
    watch: { // data.field 값 변경되는 과정 확인
        message(newval, oldval) { // 변수와 method 이름이 같아야 됨
            console.log(newval, oldval);
            this.updated = 'yes'
        }
    }
});

var test7 = new Vue({
    el: '#test7',
    data: {
        isRed: false,
        isBold: false,
        red: 'red',
        size: '20px',
    },
    methods: {
        update() {
            this.isRed = !this.isRed;
            this.isBold = !this.isBold;
        }
    },
    computed: {

    },
    watch: {

    }
});