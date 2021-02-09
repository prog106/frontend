'use strick';

// 1. Class & Object
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    speak() { // function speak() { << Error
        console.log(`${this.name}: hello`);
    }
}

const prog106 = new Person('lsk', 20);
console.log(prog106.name);
console.log(prog106.age);
prog106.speak();

// 2. Getter && setters : 잘못된 값에 대한 방어적 코딩 형태
class User {
    constructor(firstname, lastname, age) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.age = age;
    }

    get age() { // getter
        return this._age;
    }

    set age(value) { // setter : 0이하의 값이 들어올 경우 0 리턴. this.age 로 하면 루프에 빠짐.
        this._age = value < 0 ? 0 : value;
    }
}

const user1 = new User('steve', 'jobs', -1);
console.log(user1.age); // 0

// 3. public & private : 최신 버전에서만 적용됨.
class Env {
    _public = 1; // public
    #_private = 2; // private
}

const _env = new Env();
console.log(_env._public); // 1
console.log(_env._private); // undefined

// 4. static : 최신 버전에서만 적용됨.
class St {
    static pub = 1;
    constructor(age) {
        this.age = age;
    }
    static printage() {
        console.log(St.pub);
    }
}

// const _st = new St(20);
// console.log(_st.printage()); // Error : static 함수는 그냥 가져와야 됨.
console.log(St.pub);
St.printage();

// 5. class 상속
class Shape {
    constructor(width, height, color) {
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        console.log(`draw: ${this.color} color!`);
    }

    get_area() {
        return this.width * this.height;
    }
}

class Rectangle extends Shape {}
class Triangle extends Shape {
    draw() {
        super.draw(); // 부모 함수 호출
        console.log('triangle!');
    }
    get_area() { // Overriding
        return (this.width * this.height) / 2;
    }
    toString() {
        console.log(super.toString()); // prototype
        return `this is Triangle!`
    }
}

const rectangle = new Rectangle(20, 20, 'blue');
rectangle.draw();
console.log(rectangle.get_area());

const triangle = new Triangle(20, 20, 'red');
triangle.draw();
console.log(triangle.get_area());

// 6. instanceOf : Class Checking
console.log(rectangle instanceof Rectangle); // true
console.log(triangle instanceof Object); // true
console.log(triangle.toString());
