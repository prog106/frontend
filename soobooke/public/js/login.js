function Login() {
    init();
    function init() {
        login_view();
        social_login();
    }
    function login_view() {
        document.querySelector('.loginbtn').addEventListener('click', function() {
            login_form();
        });
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
}

new Login();