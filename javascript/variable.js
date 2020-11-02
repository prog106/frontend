// 1. Use strict
'use strict';

// 2. Variable, RW(read/write), mutable
// let (added in ES6)
let globalName = 'global name';
{
    let name = 'prog106';
    console.log(name);
    name = 'hello';
    console.log(name);
    console.log(globalName);
}
console.log(name);
console.log(globalName);

// var (don't ever use this!)
// var hoisting : 선언을 항상 제일 상위로 올림
console.log(age);
age = 4;
console.log(age);
var age;
// has no block scope
{
    age = 4
    var age;
}
console.log(age);

// 3. Constants ( 상수 ), R(read only), immutable
const daysInWeek = 7;

// 4. Variable types
// number
const count = 17;
const size = 12.1;
console.log(`value : ${count}, type : ${typeof count}`);
console.log(`value : ${size}, type : ${typeof size}`);
// string
const char = 'c';
const brendan = 'brendan';
const greeting = 'hello' + brendan;
const helloBob = `hi ${brendan}!`;
console.log(`value: ${greeting}, type: ${typeof greeting}`); // 추천
console.log('value: ' + greeting + ', type: ' + typeof greeting); // 비추천
// boolean
// null
// undefined
// symbol
const symbol1 = Symbol('id');
const symbol2 = Symbol('id');
console.log(symbol1 === symbol2); // false
const gsymbol1 = Symbol.for('id');
const gsymbol2 = Symbol.for('id');
console.log(gsymbol1 === gsymbol2); // true
console.log(`value: ${gsymbol1.description}, type : ${typeof gsymbol1}`);

// 5. Dynamic typing : 형변환
let text = 'hello';
console.log(text.charAt(0));
console.log(`value: ${text}, type: ${typeof text}`);
text = 1;
console.log(`value: ${text}, type: ${typeof text}`);
text = '7' + 5;
console.log(`value: ${text}, type: ${typeof text}`);
text = '8' / '2';
console.log(`value: ${text}, type: ${typeof text}`);
// console.log(text.charAt(0)); // TypeError 발생 >> TypeScript 사용

// 6. object
const prog106 = { name: 'lsk', age: 20};
console.log(prog106.age);
prog106.age = 21;
console.log(prog106.age);
