/* 
 *  Author: AlexV
 *  Created: 2018-3-31 031
 */
(function($) {
    "use strict";

    var special = jQuery.event.special,
        uid1 = "D" + (+new Date()),
        uid2 = "D" + (+new Date() + 1);

    special.scrollstart = {
        setup: function() {

            var timer,
                handler =  function(evt) {
                    var _self = this,
                        _args = arguments;
                    if (timer) {
                        clearTimeout(timer);
                    } else {
                        evt.type = "scrollstart";
                        jQuery.event.dispatch.apply(_self, _args);
                    }
                    timer = setTimeout(function(){
                        timer = null;
                    }, special.scrollstop.latency);
                };

            jQuery(this).bind("scroll", handler).data(uid1, handler);

        },
        teardown: function(){
            jQuery(this).unbind("scroll", jQuery(this).data(uid1) );
        }
    };

    special.scrollstop = {
        latency: 300,
        setup: function() {

            var timer,
                handler = function(evt) {
                    var _self = this,
                        _args = arguments;
                    if (timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(function(){
                        timer = null;
                        evt.type = "scrollstop";
                        jQuery.event.dispatch.apply(_self, _args);
                    }, special.scrollstop.latency);
                };

            jQuery(this).bind("scroll", handler).data(uid2, handler);

        },
        teardown: function() {
            jQuery(this).unbind("scroll", jQuery(this).data(uid2) );
        }
    };

    var scrolltotop = {
        setting: {
            startline: 150,
            scrollto: 0,
            scrollduration: 400,
            fadeduration: [500, 100],
            el: ".wrapper",
            controlEl: ".scrollTop"
        },
        controlattrs: {offsetx: 10,offsety: 10}, //返回按钮固定位置
        state: {
            isvisible: false,
            shouldvisible: false
        },
        scrollup: function() {
            this.$control.fadeOut();
            if (isNaN(this.setting.scrollto)) {
                var dest = this.setting.scrollto;
            } else {
                var dest = parseInt(this.setting.scrollto);
            }
            if (typeof dest === "string" && $("#"+dest).length === 1) {
                dest = $("#"+dest).offset().top;
            } else {
                dest = 0;
            }
            this.$el.animate({scrollTop:dest}, this.setting.scrollduration);
        },
        keepfixed: function(){
            var $window = $(window);
            var controlx = $window.scrollLeft() + $window.width() - this.$control.width() - this.controlattrs.offsetx;
            var controly = $window.scrollTop()+$window.height() - this.$control.height() - this.controlattrs.offsety;
            this.$control.css({
                left: controlx + "px",
                top : controly + "px"});
        },
        togglecontrol: function() {
            var scrolltop = $(this.setting.el).scrollTop();
            if (!this.cssfixedsupport) {
                this.keepfixed();
            }
            this.state.shouldvisible = (scrolltop >= this.setting.startline);
            if (this.state.shouldvisible && !this.state.isvisible){
                this.$control.stop().fadeIn(this.setting.fadeduration[0]);
                this.state.isvisible = true;
            } else {
                if(this.state.shouldvisible === false && this.state.isvisible){
                    this.$control.stop().fadeOut( this.setting.fadeduration[1]);
                    this.state.isvisible = false;
                }
            }
        },
        init: function() {
            $(document).ready(function() {
                var mainobj = scrolltotop;
                var iebrws = document.all;
                mainobj.cssfixedsupport =! iebrws || iebrws && document.compatMode === "CSS1Compat" && window.XMLHttpRequest;
                mainobj.$el = $(mainobj.setting.el);
                mainobj.$control = $(mainobj.setting.controlEl)
                    .on("click", function() {
                        mainobj.scrollup();
                        return false;
                    });
                if (document.all && !window.XMLHttpRequest && mainobj.$control.text() !== "") {
                    mainobj.$control.css({
                        width: mainobj.$control.width()
                    });
                }
                mainobj.togglecontrol();
                $(mainobj.setting.el)
                    .on("touchmove scroll resize", function() {
                        mainobj.togglecontrol();
                    })
                    .bind("scrollstop", function() {
                        mainobj.togglecontrol();
                    });
            });
        }
    };
    scrolltotop.init();
})(jQuery);