let Kid_bookshelf = function() {
    function getinfo() {
        let url = '/bookshelf/info';
        common.ax_fetch_get(url, function(res) {
            console.log(res);
            return ;
            if(res.success) {
                book_data = res.data;
                shelf_name = res.info.shelf_name;
                let bhtml = book_data.map(item => bookhtml(item)).join('');
                document.querySelector('.shelf_name').innerHTML = res.info.shelf_name + ' <i class="fas fa-chevron-right"></i>';
                // document.querySelector('.shelf_list').insertAdjacentHTML('beforeend', bhtml);
                document.querySelector('.shelf_list').innerHTML = bhtml;
            } else {
                if(res.message) alert(res.message);
                if(res.code == 'logout') common.logout();
            }
        });
    }
    return {
        init: function() {
            getinfo();
        }(),
    }
}();
