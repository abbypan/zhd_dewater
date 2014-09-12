// --------------------------------------------------------------------
//
// ==UserScript==
// @name          zhd_dewater 
// @namespace     http://abbypan.github.com/
// @version       0.1
// @author        Abby Pan (abbypan@gmail.com)
// @description   纵横道贴子脱水
// @copyright     2013, Abby Pan (http://abbypan.github.com/) 
// @grant         GM_getResourceText
// @include       http://www.zonghengdao.net/read.php*
// @resource      jquery  http://libs.baidu.com/jquery/2.0.0/jquery.min.js
// @resource      zhd_dewater https://raw.github.com/abbypan/zhd_dewater/master/zhd_dewater.js
// @resource      bbs_dewater https://raw.github.com/abbypan/bbs_dewater/master/bbs_dewater.js
// ==/UserScript==
//
// --------------------------------------------------------------------

function add_js_file(js) {
    var text = GM_getResourceText(js);
    
    var add = document.createElement('script');
    add.setAttribute('type', "text/javascript");
    add.appendChild(document.createTextNode(text));

    var ins =  document.getElementsByTagName('head')[0] || document.documentElement;
    ins.appendChild(add);
}


// Check if jQuery's loaded
function GM_wait() {
    if (typeof unsafeWindow.jQuery == 'undefined') {
        window.setTimeout(GM_wait, 100);
    } else {
        add_js_file('zhd_dewater');
        add_js_file('bbs_dewater');
    }
}

(function(){
    if (typeof unsafeWindow.jQuery == 'undefined') {
        add_js_file('jquery');
    }
    GM_wait();
})();
