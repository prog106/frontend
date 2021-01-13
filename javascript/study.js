let Study = {};

Study.Api = {
    home: '/home/',
    about: '/about/',
    locale: localStorage.getItem('study'),
}

console.log(Study.Api.home);
console.log(Study.Api.locale);
