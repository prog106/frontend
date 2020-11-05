'use strict';

// Object

// 1. Literals and properties
const prog106 = {name: 'lsk', age: 4};
const obj1 = {}; // object literal
const obj2 = new Object(); // object constructor

console.log(prog106.name);

prog106.hasJob = true;
console.log(prog106.hasJob);

delete prog106.hasJob;
console.log(prog106.hasJob);

// 2. Computed properties
console.log(prog106.name);
console.log(prog106['name']);

prog106['hasJob'] = true;
console.log(prog106.hasJob);

function printv(obj, key) {
    console.log(obj[key]);
}
printv(prog106, 'name');
printv(prog106, 'age');

// 3. Property value shorthand
const person1 = { name: 'bob', age: 2};
const person2 = { name: 'steve', age: 3};
const person3 = { name: 'dave', age: 4};
const person4 = makePerson('prog106', 5);
console.log(person4);
function makePerson(name, age) {
    return {
        name,
        age,
    }
}

// 4. Constructor Function
const person5 = new Person('tester', 6);
console.log(person5);
function Person(name, age) {
    this.name = name;
    this.age = age;
}

// 5. in operator
console.log('name' in prog106);
console.log('age' in prog106);
console.log('random' in prog106);

// 6. for..in VS for..of
console.log(prog106);
for(let key in prog106) {
    console.log(key);
}

const ar = [1, 2, 4, 5];
for(let key of ar) {
    console.log(key);
}

// 7. cloning
const user = {name: 'lsk', age: 5};
const user2 = user;
user2.name = 'coder';
console.log(user);

const user3 = {};
for(let key in user) {
    user3[key] = user[key];
}
user.name = 'lsk';
console.log(user3);
console.log(user);

const user4 = {};
Object.assign(user4, user);
console.log(user4);

const user5 = Object.assign({}, user);
console.log(user5);

const fruit1 = {color: 'red'};
const fruit2 = {color: 'blue', size: 'big'};
const mixed = Object.assign({}, fruit1, fruit2);
console.log(mixed);