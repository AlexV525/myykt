(function () {
    "use strict";
    var ua = navigator.userAgent.toLowerCase();
    var isIE        = ua.indexOf('msie') !== -1,
        isOpera     = ua.indexOf('OPR') !== -1,
        isChrome    = ua.indexOf('chrome') !== -1,
        isFirefox   = ua.indexOf('firefox') !== -1,
        isWP        = ua.indexOf('windows phone') !== -1;
    var string;

    if (isIE) {
        var ieVersion = ua.match(/msie\s\d+/)[0].match(/\d+/)[0];
        if (ieVersion < 10) {
            string = "Internet Explorer " + ieVersion;
            stopLoading();
        } else {
            alert("您正在使用的浏览器不支持本应用部分特性，请使用集大通APP或常用浏览器访问此应用。");
        }
    } else if (isOpera) {
        alert("您正在使用的浏览器不支持本应用部分特性，请使用集大通APP或常用浏览器访问此应用。");
    } else if (isFirefox) {
        var ffVersion = ua.match(/firefox\/\d+/)[0].match(/\d+/)[0];
        if (ffVersion < 35) {
            string = "Firefox " + ffVersion;
            stopLoading();
        }
    } else if (isChrome) {
        var crVersion = ua.match(/chrome\/\d+/)[0].match(/\d+/)[0];
        if (crVersion < 35) {
            string = "Chrome " + crVersion;
            stopLoading();
        }
    } else if (isWP) {
        string = "Windows Phone 浏览器";
        stopLoading();
    }

    function stopLoading() {
        //停止ajax请求
        var xmlhttp;
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.abort();

        //停止继续加载页面，相当于点击stop按钮。
        if (!!(window.attachEvent && !window.opera)) {
            document.execCommand("stop");// code for IE
        } else {
            /*
             * stops window loading
             * code for  Firefox, Chrome, Opera, Safari
             */
            if (window.stop) {
                window.stop();
            } else {
                document.execCommand("Stop");
            }
        }
        document.body.style.background = "#fff";
        document.body.innerHTML =
            '<div class="page_msg"'+
                ' style="padding-left:23px;'+
                'padding-right:23px;'+
                'font-size:16px;'+
                'text-align:center">'+
                '<div class="inner"'+
                    ' style="padding-top:40px;'+
                        ' padding-bottom:40px">'+
                    '<span class="msg_icon_wrp"'+
                        ' style="display:block;padding-bottom:22px">'+
                        '<i class="icon81_wrong" '+
                            ' style="'+
                            'width:80px;'+
                            'height:80px;'+
                            'display:inline-block;'+
                            'vertical-align:middle;'+
                            'background:transparent url(assets/images/icon81_wrong.png) no-repeat 0 0;">'+
                        '</i>'+
                    '</span>'+
                    '<div class="msg_content">'+
                        '<p style="color:#000">您的浏览器：<strong>'+string+'</strong></p>'+
                        '<p style="color:#000">此页面包含的特性不兼容当前浏览器，请使用其他浏览器访问。</p>'+
                        '<hr style="width:100%;display:inline-block" />'+
                        '<p style="color:#000">若您正在使用兼容模式，请切换到极速模式再访问。</p>'+
                        '<p style="color:#000">推荐使用以下浏览器</p>'+
                        '<a target="_blank" href="http://www.chromeliulanqi.com/">Chrome浏览器</a> / '+
                        '<a target="_blank" href="https://download-ssl.firefox.com.cn/releases-sha2/stub/official/zh-CN/Firefox-latest.exe">FireFox浏览器</a> / '+
                        '<a target="_blank" href="http://chrome.360.cn/">360极速浏览器</a>'+
                        '<p style="color:#000">Internet Explorer 10 以上版本</p> '+
                    '</div>'+
                '</div>'+
            '</div>';
    }

})();