// number, string, boolean, null, undefined
let number = 2;
let number2 = number;

console.log(number); // 2
console.log(number2); // 2

number2 = 3;

console.log(number); // 2
console.log(number2); // 3

const num = 2;
//num = 3; // error


// object
// const 와 let 의 차이가 발생하는 이유를 알아야 됨.
// const object는 레퍼런스(일종의 위치값)만 저장하고 있고 변경이 불가능 하지만, (1depth)
// 레퍼런스 위치에 저장되어 있는 각 항목의 값은 별도로 저장되어 있어 변경이 가능하다. (2depth)
let obj = {
    name: 'lsk',
    age: 5,
}
console.log(obj.name); // lsk

let obj2 = obj;

console.log(obj2.name); // lsk

obj.name = 'james';

console.log(obj.name); // james
console.log(obj2.name); // james

const o = {
    name: 'ljy',
    age: 11,
}

//o = { name: 'james', age: 9 } // error
o.name = 'james';
o.age = 10;

console.log(o.name);
console.log(o.age);

// 연산자
// true : 1, -1, 't', [], {}, 'false'
// false : 0, -0, '', null, undefined, NaN
let nums; // undefined > false
if(nums) {
    console.log(nums);
}
nums && console.log(nums);


// class 예제
class Counter {
    constructor(callback) {
        this.counter = 0;
        this.callback = callback;
    }

    increase() { // function increase() { } 로 작성하면 error
        this.counter++;
        if(this.counter % 5 === 0) {
            this.callback && this.callback(this.counter); // 콜백함수가 없을 경우에 대한 대처
        } else {
            console.log(this.counter);
        }
    }
}

function print(num) {
    console.log(`yo! ${num}`);
}

function alertnum(num) {
    alert(`yo! ${num}`);
}

const printCounter = new Counter(print);
const alertCounter = new Counter(alertnum);