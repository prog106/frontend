'use strict';

// JSON

// 1. Object to JSON
// stringify(obj)
{
    let json = JSON.stringify(true);
    console.log(json);

    json = JSON.stringify(['apple', 'banana']);
    console.log(json);

    const rabbit = {
        name: 'tori',
        color: 'white',
        size: null,
        birth: new Date(),
        jump: () => {
            console.log(`${this.name} can jump!`);
        },
    };

    // 기본 문법
    json = JSON.stringify(rabbit);
    console.log(json);

    // 배열의 일부 데이터만 가져올 때 사용
    json = JSON.stringify(rabbit, ['name', 'color', 'size']);
    console.log(json);

    // 배열의 세부 정보 치환할 때 사용하면 좋을듯.
    json = JSON.stringify(rabbit, (key, value) => {
        console.log(`${key} : ${value}`);
        return key === 'name' ? 'prog106' : value;
    });
    console.log(json); // {"name":"prog106","color":"white","size":null,"birth":"2020-11-05T01:42:11.647Z"}
}

// 2. JSON to Object
// parse(json)
{
    const rabbits = {
        name: 'tori',
        color: 'white',
        size: null,
        birth: new Date(),
        jump: () => {
            console.log(`${this.name} can jump!`);
        },
    };
    const rabbit = JSON.stringify(rabbits); // Object to JSON

    const json = JSON.parse(rabbit);
    console.log(json);
    rabbits.jump();
    // json.jump(); // Error
    console.log(rabbits.birth.getDate());
    console.log(json.birth);

    // 굳이 이걸로 안해도 될 듯.
    const obj = JSON.parse(rabbit, (key, value) => {        
        console.log(`${key} : ${value}`);
        return key === 'birth' ? new Date(value) : value;
    });
    console.log(obj);
    console.log(obj.birth.getDate());
}