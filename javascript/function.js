// Function
// 1. Function declaration
// 2. Parameters
// 3. Default parameters ( added in ES6 )
function dp(a, b=1) {
    console.log(`a: ${a}, b:{b}`);
}
dp(2);
// 4. Rest parameters ( added in ES6 )
function rp(...args) {
    for(let i = 0;i < args.length;i++) {
        console.log(args[i]);
    }
    for(const arg of args) {
        console.log(arg);
    }
}
rp('a', 'b', 'c');
// 5. Local scope
// 6. Return a value
// 7. Early return , early exit


// First-class Function
// 1. Function expression ( not hoist )
// print(); // Error - because not hoist
const print = function() {
    console.log('print');
}
print();
const printAgain = print;
printAgain();

// 2. Callback
function quiz(answer, py, pn) {
    if(answer == 'hi') {
        py();
    } else {
        pn();
    }
}
// anonymous function
const py = function() {
    console.log('Yes');
}
// named function
const pn = function p() {
    console.log('No');
    // p(); // call stack Error
}
quiz('hi', py, pn);
quiz('hello', py, pn);
// Arrow function
// example 1
const simple = function() {
    console.log('simple');
}
const simpleA = () => console.log('simpleA');
// example 2
const sum = function(a, b) {
    return a + b;
}
const sumA = (a, b) => a + b;
// IIFE : Immediately Invoked Function Expression ( 즉시 실행 )
(function hello() {
    console.log('IIFE1');
})();

(function() {
    console.log('IIFE2');
})();