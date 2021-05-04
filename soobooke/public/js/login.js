let Login = function() {
    return {
        init: function() {
            if(common.uid()) {
                common.member();
                return false;
            }
            document.querySelector('.login_wrap').classList.remove('hide');
        }(),
    }
}();
