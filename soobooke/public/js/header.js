let Header = function() {
    return {
        init: function() {
            let user = common.get_user();
            let nav = document.querySelector('.nav_login');
            if(user.idx) {
                nav.setAttribute('onclick', 'common.logout();');
                nav.textContent = user.name;
            } else {
                nav.setAttribute('onclick', 'common.login();');
                nav.textContent = '로그인 해주세요.';
            }
        }(),
    }
}();
