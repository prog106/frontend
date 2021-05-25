let Recommend = function() {
    let recommend_data = [];
    function getrecommend() {
        common.ax_fetch_get('/recommend/info', function(res) {
            recommend_data = res.data;
            let search_txt = Hangul.disassemble(document.querySelector('input[name=recommend]').value.replace(/ /g,"")).join('');
            let rhtml = recommend_data.filter(function(item) {
                return (Hangul.disassemble(item.message.replace(/ /g,"")).join('').toLowerCase().indexOf(search_txt.toLowerCase()) != -1);
            }).map(item => recommendhtml(item)).join('');
            setTimeout(function() {
                document.querySelector('.list').innerHTML = rhtml;
            }, 200);
        });
    }
    function search_txt() {
        document.querySelector('.search_recommend').addEventListener('click', function() {
            getrecommend();
        });
    }
    function recommendhtml(item) {
        return `<div class="usercode" onclick="Recommend.search_user('${item.user_code}')">${item.message}</div>`;
    }
    function save_message() {
        document.querySelector('.save').addEventListener('click', function() {
            let form_data = new FormData();
            form_data.append('message', document.querySelector('textarea[name=message]').value);
            common.ax_fetch_post('/recommend/info', form_data, function(res) {
                if(res.success) {
                    if(res.message) alert(res.message);
                    getrecommend();
                } else {
                    if(res.message) alert(res.message);
                    if(res.code == 'logout') common.logout();
                    if(res.code == 'choose') common.choose();
                }
            });
        });
    }
    function search_user(usercode) {
        common.ax_fetch_get('/recommend/info/@'+usercode, function(res) {
            recommend_data = res.data;
            let rhtml = recommend_data.map(item => recommendhtml(item)).join('');
            document.querySelector('.list').innerHTML = rhtml;
        });
    }
    return {
        init: function() {
            getrecommend();
            search_txt();
            save_message();
        }(),
        search_user: search_user,
    }
}();
