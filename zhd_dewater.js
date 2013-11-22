function banner_path() {
    return 'div#main';
}

function extract_floor_info(info) {
    var re = new Object;
    re["poster"] = info.find('td.floot_left div a').eq(0).text();
    re["time"] = info.find('div.tipTop.s6 span').eq(1).text().replace('发表于: ','');
    re["id"] = info.find('a.s1.b.cp').text().replace(/\[(\d+)\D.*/,'$1');
    re["content"] = info.find('div.f14.mb10').html().
    replace(/<\/?font[^>]*>/g, '');
    re["word_num"] = re["content"].replace('<[^>]+>','').length;
    return re;
}

function floor_path() {
    return 'div.read_t';
}

function page_charset() {
    return 'gb2312';
}

function get_topic_name() {
    return $('h1#subject_tpc').text();
}

function get_page_num() {
    var num = $('div.pages').html();
    var num_m = num.match(/var page=\(value>(\d+)\) \?/);
    //var num = $('div.pages input').text();
    //var num_m = num.match(/\.\.\.(\d+)下一页/);
    if(!num_m) return;
    return num_m[1];
}

function format_thread_url_1st(url) {
    url = url.replace(/#.*$/, '').replace(/&page=\d+/, '&page=1');

    if(! url.match(/&page=\d+/)){
        url = url.concat('&page=1');
    }

    return url;
}

function format_thread_url_ith(url,i)  {
    var j = i.toString();
    var n_url = url.replace(/&page=\d+/, '&page='+ j);
    return n_url;
}
