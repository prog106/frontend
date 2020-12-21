// ES6 ( 2015 )

{
    // Shorthand property names
    const person1 = {
        name: 'lsk',
        age: 20,
    }

    const name = 'lsk';
    const age = 21;

    const person2 = {
        name: name,
        age: age,
    }

    const person3 = {
        name,
        age,
    }
    console.log(person1, person2, person3);
}

{
    // Destructuring Assignment
    const student = {
        name: 'Anna',
        level: 1,
    }

    {
        const name = student.name;
        const level = student.level;
        console.log(name, level);
    }

    {
        const { name, level } = student;
        console.log(name, level);
    }

    {
        const { name: studentName, level: studentLevel } = student;
        console.log(studentName, studentLevel);
    }

    const animals = ['dog', 'cat']; // Array
    {
        const first = animals[0];
        const second = animals[1];
        console.log(first, second);
    }

    {
        const [ first, second ] = animals; // Array은 [], Object는 {}
        console.log(first, second);
    }
}

{
    // Spread Syntax
    {
        const obj1 = { key: 'key1' };
        const obj2 = { key: 'key2' };
        const array = [ obj1, obj2 ];

        // array copy
        const arrayCopy = [...array];
        console.log(array, arrayCopy);

        const arrayCopy2 = [...array, { key: 'key3' }];
        console.log(array, arrayCopy, arrayCopy2);

        obj1.key = 'newKey';
        console.log(array, arrayCopy, arrayCopy2); // Object의 특성상 obj1.key 값이 모두 바뀜. Object 특성 유지

        const obj3 = {...obj1}; // Array은 [], Object는 {}
        console.log(obj3);
    }

    {
        // array concatenation
        const fruit1 = [ 1, 2 ];
        const fruit2 = [ 3, 4 ];
        const fruits = [...fruit1, ...fruit2];
        console.log(fruits);

        // object concatenation
        const dog1 = { dog: 1 };
        const dog2 = { dog: 2 };
        const dog = {...dog1, ...dog2};
        console.log(dog); // key 가 같을 경우 마지막 데이터로 덮어 씌움.
    }
}

{
    // Default parameters
    function print(message = 'default message') {
        console.log(message);
    }
    print('hello');
}

{
    // Ternary Operator
    const isCat = true;
    let component = isCat ? 'cat' : 'dog';
    console.log(component);
}

{
    // Template Literals : ``
    const num1 = 10;
    const num2 = 20;
    console.log(`A는 ${num1}살, B는 ${num2}살 입니다.`);
}

// ES11 ( 2020 )

{
    // Optional Chaining (ES11)
    const person1 = {
        name: 'lsk',
        job: {
            title: 'S/W Engineer',
            manager: {
                name: 'Bob',
            },
        },
    };
    const person2 = {
        name: 'Bob',
    }

    {
        function printManager(person) {
            console.log(person.job.manager.name);
        }
        printManager(person1);
        // printManager(person2); // error
    }

    {
        function printManager(person) {
            console.log(person.job?.manager?.name);
        }
        printManager(person1);
        printManager(person2);
    }
}

{
    // Nullish Coalescing Operator (ES11)
    {
        // Logical OR operator 1
        const name = 'lsk';
        const userName = name || 'Guest';
        console.log(userName); // lsk
    }
    {
        // Logical OR operator 2
        const name = null;
        const userName = name || 'Guest';
        console.log(userName); // Guest
    }
    {
        // Logical OR operator 3
        const name = '';
        const userName = name || 'Guest';
        console.log(userName); // ''을 표현하고 싶지만, Guest 결과 도출
    }
    {
        // Logical OR operator 4
        const num = 0;
        const message = num || 'undefined';
        console.log(message); // 0을 표현하고 싶지만, undefined 결과 도출
    }
    {
        // Nullish Coalescing Operator (ES11) : ??
        const name = '';
        const userName = name ?? 'Guest';
        console.log(userName); // ''을 표현
        const num = 0;
        const message = num ?? 'undefined';
        console.log(message); // 0을 표현
    }
}