let Userbadge = function() {
    function getinfo() {
        let url = '/user/badge/info';
        common.ax_fetch_get(url, function(res) {
            console.log(res);
            if(res.success) {
            } else {
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
                if(res.code == 'choose') common.choose();
            }
        });
    }
    return {
        init: function() {
            getinfo();
        }(),
    }
}();
