'use strict';

// Array

// 1. Declaration 배열 선언
const arr1 = new Array();
const arr2 = [1, 2];

// 2. Index position
const fruit = ['사과', '바나나'];
console.log(fruit);
console.log(fruit.length);
console.log(fruit[0]);
console.log(fruit[1]);

// 3. Looping over an array
for(let key in fruit) {
    console.log(fruit[key]);
}

for(let key of fruit) {
    console.log(key);
}

fruit.forEach(function(v, k, ar) {
    console.log(k);
    console.log(v);
    console.log(ar);
});

// 4. Addtion, deletion, copy
// push : 뒤에서 부터 입력 - faster
fruit.push('tomato', 'grape');
console.log(fruit);

// pop : 뒤에서 부터 삭제 - faster
fruit.pop();
console.log(fruit);

// unshift : 앞에서 부터 입력 - slow
fruit.unshift('딸기');
console.log(fruit);

// shift : 앞에서 부터 삭제 - slow
fruit.shift();
console.log(fruit);

// splice
//fruit.splice(1);
//console.log(fruit);
fruit.splice(1, 1);
console.log(fruit);
fruit.splice(1, 1, '수박');
console.log(fruit);

// concat - combine
const fruit2 = ['사과', '망고', '코코넛'];
const newFruit = fruit.concat(fruit2);
console.log(newFruit);

// 5. Searching - indexOf, includes, lastIndexOf
// indexOf
console.log(fruit.indexOf('사과')); // 0
console.log(fruit.indexOf('수박')); // 1
console.log(fruit.indexOf('코코넛')); // -1
// includes
console.log(fruit.includes('사과')); // true
console.log(fruit.includes('코코넛')); // false
// lastIndexOf
fruit.push('사과');
// console.log(fruit);
console.log(fruit.lastIndexOf('사과')); // 2
