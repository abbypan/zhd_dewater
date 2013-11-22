if(!window.jQuery)
{
   var script = document.createElement('script');
   script.type = "text/javascript";
   script.src = "http://code.jquery.com/jquery-latest.min.js";
   document.getElementsByTagName('head')[0].appendChild(script);
}

var $ = jQuery || window.jQuery || $;

add_dewater_banner();

function add_dewater_banner() {
$dewater_div = $('\
                 <div id="dewater_div_form" style="align:center;background: #cad6e1;">\
                 前<input id="max_page_num" name="max_page_num" size="5"/>页,\
                 前<input id="max_floor_num" name="max_floor_num" size="5"/>楼, \
                 每楼最少<input id="min_word_num" name="min_word_num" size="5"/>字,\
                 <input type="checkbox" id="only_poster" name="only_poster">只看楼主,\
                 <input type="checkbox" id="with_toc" name="with_toc" checked />生成目录, \
                 <input type="submit" value="脱水" onclick="dewater_thread()" />\
                 </div>');
                 $('div#main').before($dewater_div);

                 $main_floors = $('\
                                  <div id="dewater_div">\
                                  <div id="dewater_title"></div>\
                                  <div id="dewater_toc"></div>\
                                  <div id="dewater_floors"></div></div>');
                                  $('div#main').before($main_floors);
}



function get_dewater_option() {
	return {
		max_page_num: parseInt($("#max_page_num")[0].value),
		max_floor_num: parseInt($("#max_floor_num")[0].value),
		only_poster: $("#only_poster")[0].checked,
		with_toc: $("#with_toc")[0].checked,
		min_word_num: parseInt($("#min_word_num")[0].value)
	};

}

// get_page_floors  {
function extract_floor_info(info) {
    //--- 4
    var re = new Object;
    re["poster"] = info.find('td.floot_left div a').eq(0).text();
    re["time"] = info.find('div.tipTop.s6 span').eq(1).text().replace('发表于: ','');
    re["id"] = info.find('a.s1.b.cp').text().replace(/\[(\d+)\D.*/,'$1');
    re["content"] = info.find('div.f14.mb10').html().
        replace(/<\/?font[^>]*>/g, '');
    re["word_num"] = re["content"].replace('<[^>]+>','').length;
    return re;
}

function get_page_floors(u) {
    $('#dewater_title').html("正在取 ：" + u);
    var floors_info = new Array();
    $.ajax({
        type: "get",
        url: u,
        cache: false,
        async: false,
        beforeSend: function(jqXHR) {
            jqXHR.overrideMimeType('text/html; charset=gb2312');
        },
        success: function(data) {
            var $resp = $(data);

            //--- 3
            $resp.find('div.read_t').each(function() {
                //var bot = $(this).parent();
                var bot = $(this);
                var f_i = extract_floor_info(bot);
                floors_info.push(f_i);
            });

        }
    });

    return floors_info;
}

// }
// set_topic {
function get_topic_url() {
    return window.location.href;
}

function get_topic_name() {
    //--- 6
    return $('h1#subject_tpc').text();
}

function set_topic(dst) {
    var tp = get_topic_name() ;
    var c = '<a href="' + get_topic_url() + '">' + tp + '</a>';
    $(dst).html(c);
    $('head').html('<meta content="text/html; charset=utf-8" http-equiv="Content-Type">' +
                   '<title>' + tp + '</title>');

    //$('title').html(tp);
}
//  }
// get_page_urls {
function get_page_num() {
//--- 1
    var num = $('div.pages').html();
    var num_m = num.match(/var page=\(value>(\d+)\) \?/);
    //var num = $('div.pages input').text();
    //var num_m = num.match(/\.\.\.(\d+)下一页/);
    if(!num_m) return;
    return num_m[1];
}

function get_page_urls() {
    var num = get_page_num();
   
    var url = get_topic_url();

//--- 2
    url = url.replace(/#.*$/, '').replace(/&page=\d+/, '&page=1');

    if(! url.match(/&page=\d+/)){
        url = url.concat('&page=1');
    }

    if (!num) return [url];

    var url_list = new Array();
    for (var i = 1; i < num; i++) {
        var j = i.toString();
        var n_url = url.replace(/&page=\d+/, '&page='+ j);
        url_list.push(n_url);
    }
    return url_list;
}
// }
// get_thread_floors {
function select_page_urls(option) {
    var page_urls = get_page_urls();

    if (!option.max_page_num) return page_urls;

    var urls = new Array();
    var n = 1;
    for (var i in page_urls) {
        if (n > option.max_page_num) break;
        var u = page_urls[i];
        urls.push(u); ++n;
    }
    return urls;
}

function is_floor_overflow(id, option) {
    if (!option.max_floor_num) return 0;
    if (id <= option.max_floor_num) return 0;
    return 1;
}

function get_thread_floors(option) {
    var main_floors = new Array();
    var select_urls = select_page_urls(option);
    for (var i in select_urls) {
        var u = select_urls[i];
        var f = get_page_floors(u);
        var flen = f.length;
        for (var j = 0; j < flen; j++) {
            var id = f[j].id;
            if (is_floor_overflow(id, option)) return main_floors;
            main_floors[id] = f[j];
        }
    }
    return main_floors;
}
// }
// dewater_thread {
function is_skip_floor(f, opt) {
    if (opt.only_poster && (f.poster != opt.poster)) return 1;
    if (opt.min_word_num && (f.word_num < opt.min_word_num)) return 1;
    return;
}

function add_floor_toc(dst, f) {
    var html = '<p>' + f.id + '# <a href="#toc' + f.id + '">' + f.time + ' ' + f.poster + '</a></p>';
    $floor = $(html);
    $(dst).append($floor);
}

function add_floor_content(dst, f) {
    var html = '<div class="floor" id="floor' + f.id + '">' + '<div class="flcontent">' + f.content + '</div>' + '<div class="fltitle"><a name="toc' + f.id + '">№' + f.id + '<span class="star">☆☆☆</span>' + f.poster + '<span class="star">于☆☆☆</span>' + f.time + '<span class="star">留言☆☆☆</span></a></div>' + '</div>';
    $floor = $(html);
    $(dst).append($floor);
}

function set_dewater_css() {

    $('body').css({
        'font-size': 'medium',
        'font-family': 'Verdana, Arial, Helvetica, sans-serif',
        'margin': '1em 8em 1em 8em',
        'text-indent': '2em',
    });

    $('#dewater_title,.fltitle,#dewater_toc').css({
        'border-bottom': '0.1em solid #99cc00',
        'margin': '0.8em 0.2em 2.8em 0.2em',
        'text-indent': '0em',
        'padding-bottom': '0.25em',
    });

    $('#dewater_title').css({
        'text-align': 'center',
        'font-size': 'large',
    });

    $('.flcontent').css({
        'line-height': '125%'
    });

    $('.star').css({
        'color': '#99cc00',
    });

}

function dewater_thread() {
    var option = get_dewater_option();
    var main_floors = get_thread_floors(option);

    //--- 5
    option.poster = main_floors[0].poster;

    set_topic('#dewater_title');

    $('#dewater_toc').html('');
    $('#dewater_floors').html('');

    for (var i in main_floors) {
        var f = main_floors[i];
        if (is_skip_floor(f, option)) continue;

        if (option.with_toc) add_floor_toc('#dewater_toc', f);
        add_floor_content('#dewater_floors', f);
    }

    $('body').html($('#dewater_div').html());
    set_dewater_css();
}

// }