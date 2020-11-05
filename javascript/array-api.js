'use strict';

// 1. join : array > string
{
    const fruit = ['사과', '배', '딸기', '수박'];
    console.log(fruit.join(' & ')); // 사과 & 배 & 딸기 & 수박    
}

// 2. split : string > array
{
    const fruit = '사과,배,딸기,수박';
    console.log(fruit.split()); // ["사과,배,딸기,수박"] - fail
    console.log(fruit.split(',')); // ["사과", "배", "딸기", "수박"]
    console.log(fruit.split(',', 2)); // ["사과", "배"]
}

// 3. reverse : reverse array
{
    const array = [1, 2, 3, 4, 5];
    console.log(array);
    console.log(array.reverse());
    console.log(array);
}

// 4. splice : make new array without the first two elements ( 원 배열은 변경 안되어야 함 )
{
    const array = [1, 2, 3, 4, 5];
    //const result = array.splice(2);
    //console.log(array); // [1, 2]
    //console.log(result); // [3, 4, 5]
    const result = array.slice(2, 5);
    console.log(array); // [1, 2, 3, 4, 5]
    console.log(result); // [3, 4, 5]
}

class Student {
    constructor(name, age, enrolled, score) {
        this.name = name;
        this.age = age;
        this.enrolled = enrolled;
        this.score = score;
    }
}

const students = [
    new Student('A', 29, true, 45),
    new Student('B', 28, false, 80),
    new Student('C', 30, true, 90),
    new Student('D', 40, false, 66),
    new Student('E', 18, true, 88),
];

// 5. find : 90점인 학생 찾기 : find a student with the score 90
{
    console.log(students);
    students.forEach(function(v, k) {
        if(v.score === 90) console.log(v);
    });
    const result = students.find(function(student, index) {
        //console.log(student);
        return student.score === 90;
    });
    console.log(result);
    const result2 = students.find((student) => student.score === 90);
    console.log(result2);
}

// 6. filter : 수업에 등록된 학생 배열 만들기 : make an array of enrolled students
{
    const result = students.filter((student) => student.enrolled);
    console.log(result);
    const result2 = students.filter(function(student) {
        return student.enrolled;
    })
    console.log(result2);
}

// 7. map : 점수로만 배열 만들기
{
    const result = students.map(function (student) {
        return student.score;
    });
    console.log(result);
    const result2 = students.map((student) => student.score);
    console.log(result2);
}

// 8. some <> every : 50점 미만의 학생이 있는지 확인하기
{
    const result = students.some(function(student) {
        return student.score < 50;
    });
    console.log(result);
    const result2 = !students.every(function(student) {
        return student.score < 50;
    });
    console.log(result2);
}

// 9. reduce : 평균값 구하기 ( 이해가 안되네... )
{
    const result = students.reduce(function(prev, curr) {
        console.log('--------');
        console.log(prev);
        console.log(curr);
        return prev + curr.score;
    }, 0);
    let sum = 0;
    students.forEach(function(student) {
        sum += student.score;
    });
    console.log(sum/students.length);
}

// 10. 학생들의 점수를 String으로 변환
{
    const result = students
    .map((student) => student.score)
    .filter((score) => score >= 50) // score는 바로 위에서 리턴받은 student.score!
    .join();
    console.log(result);
}

// Bonus. sort : 학생들의 점수를 낮은 순서로 정렬
{
    const result = students
    .map((student) => student.score)
    .sort((a, b) => a - b) // a: 이전값, b: 현재값
    .join();
    console.log(result);
}