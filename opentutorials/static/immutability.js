// 객체
var o1 = {name: 'kim', score:[1, 2]};
Object.freeze(o1); // 객체 정보를 얼림.
o1.name = 'lee';
o1.city = 'seoul'; // freeze 때문에 불가
o1.score.push(3); // 값은 얼리지만, 객체는 변경 가능
Object.freeze(o1.score);
//o1.score.push(4); // 위의 freeze 때문에 오류를 발생시킴
console.log(o1); // {name: "kim", score: Array(3)}

// const VS freeze 차이점 이해하기

// const : 변수 이름을 통제
const a1 = {name: 'kim'};
a1.name = 'lee';
console.log(a1); // {name: "lee"}
const a2 = {name: 'park'};
// a1 = a2; // Error Assignment to constant variable.

// freeze : 변수 값을 통제