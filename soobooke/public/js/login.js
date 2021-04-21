let common = {
    validateEmail: function (email) {
        const rgx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return rgx.test(email);
    },
    ax_fetch_post: function(url, data, callback) {
        fetch(url, {
            method: 'POST',
            body: data,
        })
        .then(response => response.json())
        .then(response => callback(response))
        .catch(error => console.error(error));
    },
};

function Login() {
    init();
    function init() {
        login_view();
        social_login();
        search_pwd();
    }
    function login_view() {
        document.querySelector('.loginbtn').addEventListener('click', function() {
            login_form();
        });
    }
    function login_noti(msg, el) {
        if(document.querySelector('.notification')) {
            document.querySelector('.notification').remove();
        }
        const notif = document.createElement('div');
        notif.classList.add('notification');
        notif.innerText = msg;
        document.querySelector('.login_wrap').appendChild(notif);
        el.focus();
        setTimeout(function() {
            notif.remove();
        }, 2000);
    }
    function login_form() {
        let user_email = document.querySelector('#login_form input[name=user_email]');
        let user_pwd = document.querySelector('#login_form input[name=user_pwd]');
        if(!user_email.value || !common.validateEmail(user_email.value)) {
            login_noti('Please Login Email!', user_email);
            return false;
        }
        if(!user_pwd.value) {
            login_noti('Please Login Password!', user_pwd);
            return false;
        }
        let form_element = document.querySelector('#login_form');
        let form_data = new FormData(form_element);
        common.ax_fetch_post(form_element.action, form_data, function(res) {
            console.log(res);
            if(res.success) {
                // document.querySelector('.login_wrap').style.display = 'none';
                window.location.reload();
            } else {
                login_noti(res.message, user_email);
            }
        });
    }
    function search_pwd_noti(msg, el) {
        if(document.querySelector('.notification')) {
            document.querySelector('.notification').remove();
        }
        const notif = document.createElement('div');
        notif.classList.add('notification');
        notif.innerText = msg;
        document.querySelector('.search_pwd_wrap').appendChild(notif);
        el.focus();
        setTimeout(function() {
            notif.remove();
        }, 2000);
    }
    function social_login() {
        document.querySelector('.kakaobtn').addEventListener('click', function() {
            setTimeout(function() {
                window.location.href = '/auth/kakao';
            }, 200);
        });
        document.querySelector('.googlebtn').addEventListener('click', function() {
            setTimeout(function() {
                window.location.href = '/auth/google';
            }, 200);
        });
    }
    function search_pwd() {
        let search_pwd_wrap = document.querySelector('.search_pwd_wrap');
        document.querySelector('#search_pwd_btn').addEventListener('click', function() {
            setTimeout(function() {
                search_pwd_wrap.style.display = 'flex';
            }, 200);
        });
        document.querySelector('.searchpwdbtn').addEventListener('click', function() {
            search_pwd_form();
        });
        document.querySelector('#search_pwd_cancelbtn').addEventListener('click', function() {
            search_pwd_wrap.style.display = 'none';
        });
    }
    function search_pwd_form() {
        let user_email = document.querySelector('#search_pwd_form input[name=user_email]');
        if(!user_email.value || !common.validateEmail(user_email.value)) {
            search_pwd_noti('Please Email!', user_email);
            return false;
        }
        let form_element = document.querySelector('#search_pwd_form');
        let form_data = new FormData(form_element);
        common.ax_fetch_post(form_element.action, form_data, function(res) {
            if(res.success) {
                search_pwd_wrap.style.display = 'none';
            } else {
                search_pwd_noti(res.message, user_email);
            }
        });
    }
}

function Signup() {
    init();
    function init() {
        signup_view();
    }
    function signup_view() {
        let signup_wrap = document.querySelector('.signup_wrap');
        let search_pwd_wrap = document.querySelector('.search_pwd_wrap');
        document.querySelector('#signup_view').addEventListener('click', function() {
            setTimeout(function() {
                signup_wrap.style.display = 'flex';
            }, 200);
        });
        document.querySelector('.signupbtn').addEventListener('click', function() {
            signup_form();
        });
        document.querySelector('#signup_cancelbtn').addEventListener('click', function() {
            signup_wrap.style.display = 'none';
        });
        window.onclick = function(event) {
            if(event.target == signup_wrap) {
                signup_wrap.style.display = 'none';
            } else if(event.target == search_pwd_wrap) {
                search_pwd_wrap.style.display = 'none';
            }
        }
    }
    function signup_noti(msg, el) {
        if(document.querySelector('.notification')) {
            document.querySelector('.notification').remove();
        }
        const notif = document.createElement('div');
        notif.classList.add('notification');
        notif.innerText = msg;
        document.querySelector('.signup_wrap').appendChild(notif);
        if(el) el.focus();
        setTimeout(function() {
            notif.remove();
        }, 2000);
    }
    function signup_form() {
        let user_email = document.querySelector('#signup_form input[name=user_email]');
        let user_nick = document.querySelector('#signup_form input[name=user_nick]');
        let user_pwd = document.querySelector('#signup_form input[name=user_pwd]');
        let user_pwd_re = document.querySelector('#signup_form input[name=user_pwd_re]');
        if(!user_email.value || !common.validateEmail(user_email.value)) {
            signup_noti('Please Email!', user_email);
            return false;
        }
        if(!user_nick.value) {
            signup_noti('Please Nickname', user_nick);
            return false;
        }
        if(!user_pwd.value) {
            signup_noti('Please Password!', user_pwd);
            return false;
        }
        if(!user_pwd_re.value) {
            signup_noti('Please Repeat Password!', user_pwd_re);
            return false;
        }
        if(user_pwd.value !== user_pwd_re.value) {
            signup_noti('No Match Password!', user_pwd_re);
            return false;
        }
        let form_element = document.querySelector('#signup_form');
        let form_data = new FormData(form_element);
        common.ax_fetch_post(form_element.action, form_data, function(res) {
            if(res.success) {
                window.location.reload();
            } else {
                signup_noti(res.message);
            }
        });
    }
}
