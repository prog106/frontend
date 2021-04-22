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
        let user_login_code = document.querySelector('#login_form input[name=user_login_code]');
        if(!user_login_code.value) {
            user_login_code.focus();
            return false;
        }
        let form_element = document.querySelector('#login_form');
        let form_data = new FormData(form_element);
        common.ax_fetch_post(form_element.action, form_data, function(res) {
            if(res.success) {
                window.location.reload();
            } else {
                login_noti(res.message, user_email);
            }
        });
    }
    function kakao_login() {
        window.location.href = '/auth/kakao';
        // let kakao_auth_popup = '';
        // if (!kakao_auth_popup.closed && kakao_auth_popup) {
        //     kakao_auth_popup.focus();
        //     return false;
        // }
        // let url = '/auth/kakao';
        // kakao_auth_popup = window.open(url, 'kakao_login', 'width=400, height=680, top=100, left=100, fullscreen=no, menubar=no, status=no, toolbar=no, titlebar=yes, scrollbar=no');
    }
    function social_login() {
        document.querySelector('.kakaobtn').addEventListener('click', function() {
            setTimeout(function() {
                kakao_login();
            }, 200);
        });
        // document.querySelector('.googlebtn').addEventListener('click', function() {
        //     setTimeout(function() {
        //         window.location.href = '/auth/google';
        //     }, 200);
        // });
    }
}
new Login();
