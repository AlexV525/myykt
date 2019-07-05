/*
 *  Author: AlexV
 *  Created: 2018-3-27 027
 */
$(function() {
    FastClick.attach(document.body);
});
(function($) {
    "use strict";
    var $swiper,  // 卡片轮播控件
        cardIndex      = 0,  // 默认卡片索引
        $errorRefresh  = $(".error-refresh"),  // 加载错误刷新控件
        $failedReason  = $(".loader-errormsg").find("b"),  // 错误信息节点
        $switch = {  // 切换卡片控件
            main: $(".switch"),
            confirm: $(".switch-btn.switch-confirm"),
            cancel: $(".switch-btn.switch-cancel")
        },
        $help = {  // 帮助类
            el: {
                main: $(".help"),  // 帮助主节点
                open: $("button[name=question]"),  // 帮助展开按钮
                fold: $(".help-control-btn.fold")  // 帮助折叠按钮
            },
            proof: $(".help-proof"),  // 帮助遮罩层
            content: $(".help-content"),  // 帮助内容节点
            control: {  // 方法类
                open: function() {  // 展开帮助
                    var $wrapper = $(".wrapper");
                    $wrapper.addClass("no-scroll");
                    $help.proof.fadeIn();
                    $help.el.main.slideDown();
                },
                fold: function() {  // 折叠帮助
                    var $wrapper = $(".wrapper");
                    $wrapper.removeClass("no-scroll");
                    $help.proof.fadeOut();
                    $help.el.main.slideUp();
                }
            }
        },
        $loader = {  /*** 齿轮转动动画 匹配方法 ***/
            show: function() {  // 显示
                var $loading   = $("#loading"),
                    $container = $(".container");
                $container.addClass("op-0");
                $loading.fadeIn("normal");
            },
            error: {  // 错误类方法
                show: function() {  // 显示错误
                    var $errormsg = $(".loader-errormsg"),
                        $overlay  = $(".loader-overlay"),
                        $cogs     = $(".loader-cogs");
                    setTimeout(function() {
                        $overlay.animate({top:-150}, "fast");
                        $cogs.animate({top:-270}, "fast");
                        $errormsg.fadeIn("slow");
                    }, 500);
                },
                clear: function() {  // 清空错误信息并隐藏
                    var $errormsg = $(".loader-errormsg"),
                        $overlay  = $(".loader-overlay"),
                        $cogs     = $(".loader-cogs");
                    $overlay.animate({top:0}, "fast");
                    $cogs.animate({top:-120}, "fast");
                    $errormsg.hide();
                    $failedReason.text("");
                },
                append: function(reason) {  // 添加错误信息（行）
                    if ($failedReason.text().length !== 0) {
                        reason = "<br>" + reason
                    }
                    $failedReason.append(reason);
                }
            },
            hide: function() {  // 隐藏loader
                var $loading   = $("#loading"),
                    $container = $(".container");
                setTimeout(function() {
                    $container.removeClass("op-0");
                }, 500);
                $loading.fadeOut("normal");
            },
            resize: function() {  // 重置大小
                var $spinner      = $(".spinner");
                var screenHeight  = $(window).height();
                var spinnerHeight = $spinner.height();
                var spinnerMargin = ((screenHeight - spinnerHeight) / 2) + "px";
                $spinner.css("margin", spinnerMargin + " auto");
            }
        };

    $(document).ready(function() {  // DOM节点就绪后加载方法
        $loader.show();
        $loader.resize();
        dataInit();
    });

    $(window).resize(function() {  // 屏幕尺寸变化时重置大小
        $loader.resize();
    });

    $errorRefresh.on("click", function() {  // 错误时点击重新加载
        $loader.error.clear();
        dataInit();
    });

    $switch.confirm.on("click", function() {  // 确认切换卡片
        var id = $swiper.activeIndex;
        $loader.show();
        $apis.switch.post({id:id})
            .done(function(response) {
                if (responseStatus(response)) {
                    alert("卡片切换成功");
                    window.location.reload();
                } else {
                    $swiper.slideTo(cardIndex);
                    $loader.error.append("卡片切换失败 ("+response["message"]+")");
                    $loader.error.show();
                    console.log("Failed in switch-card: ", response["message"]);
                }
            })
            .fail(function(xhr, status) {
                $swiper.slideTo(cardIndex);
                $loader.error.append("卡片切换失败 ("+xhr.status+" "+status+")");
                $loader.error.show();
                console.log("Failed in switch-card: ", xhr.status, status);
            });
    });

    $switch.cancel.on("click", function() {  // 取消切换卡片
        $swiper.slideTo(cardIndex);
        $switch.main.slideUp();
    });

    // 控制帮助内容开关 //
    $help.proof.on("click scroll touchmove", function() {
        $help.control.fold();
    });
    $help.el.open.on("click", function() {
        $help.control.open();
    });
    $help.el.fold.on("click", function() {
        $help.control.fold();
    });

    /* 接口类： [get]获取请求，[handler]回调方法 */
    var $apis = {
        cards: {  // 卡片
            get: function () {
                return $.getJSON("get-cards");
            },
            handler: function(response) {
                var $cards = response["data"]["cards"],
                    cards = [],
                    $cardContainer = $("#cards-container");
                $.each($cards, function(i, card) {
                    var content = '<div class="card swiper-slide" id="card-'+card["name"]+'">'+
                        '<div class="card-header">'+
                            '<img class="logo pull-right" src="assets/images/logo.png" alt="校园卡">'+
                            '<span class="user-name">'+card["name"]+'</span>'+
                        '</div>'+
                        '<div class="card-number">'+
                            '<span class="card-number" data-for="card-'+card["name"]+'">'+card["outid"]+'</span>'+
                        '</div>'+
                        '<div class="card-info">'+
                            '<div class="card-info-left pull-left">'+
                                '<span class="card-info-name">卡内余额</span>'+
                                '<span class="card-info-value card-balance" data-for="card-'+card["name"]+'">'+card["balance"]+'</span>'+
                            '</div>'+
                            '<div class="card-info-right pull-right">'+
                                '<span class="card-info-name">开卡日期</span>'+
                                '<span class="card-info-value" data-for="card-'+card["name"]+'">'+card["open_at"]+'</span>'+
                            '</div>'+
                        '</div>'+
                    '</div>';
                    cards.push(content);
                });
                $cardContainer.html(cards.join(""));
            }
        },
        cardInfo: {  // 当前卡信息
            get: function() {
                return $.getJSON("get-card-info");
            },
            handler: function(response) {
                var $cardBalance = $(".count-card-balance"),
                    $receiptsIn  = $(".count-card-receipts-in"),
                    $receiptsOut = $(".count-card-receipts-out"),
                    $receiptsLast = $(".count-card-receipts-last");
                var data = response["data"]["info"];
                cardIndex = parseInt(data["id"]) - 1;
                $cardBalance.text(data["balance"]);
                $receiptsIn.text(data["receipts_in"]);
                $receiptsOut.text(data["receipts_out"]);
                $receiptsLast.text(data["receipts_last"]);
            }
        },
        recents: {  // 近期消费记录
            get: function() {
                return $.getJSON("get-recent-records");
            },
            handler: function(response) {
                var details  = response["data"]["details"],
                    $details = $(".details"),
                    list = [];
                if (details.length === 0) {
                    $(".nomore-wrap").show();
                } else {
                    $.each(details, function(i, detail) {
                        var icon;
                        if (detail["receipt"] === "in") {
                            icon = "receipt";
                        } else if (detail["receipt"] === "out") {
                            icon = "fukuan";
                        }
                        var content = '<li class="detail" data-index="'+detail["id"]+'">'+
                                '<div class="detail-type">'+
                                    '<i class="iconfont icon-'+icon+'"></i>'+
                                '</div>'+
                                '<div class="detail-info">'+
                                    '<span class="detail-info-location">'+detail["location"]+'</span>'+
                                    '<span class="detail-info-date">'+detail["time"]+'</span>'+
                                    '<span class="detail-info-type">'+detail["type"]+'</span>'+
                                    '<span class="detail-info-receipt '+detail["receipt"]+'">'+detail["payment"]+' '+
                                        '<p>'+detail["balance"]+'</p>'+
                                    '</span>'+
                                '</div>'+
                            '</li>';
                        list.push(content);
                    });
                    setTimeout(function() {
                        $details.html(list.join(""));
                        if (response["data"]["isTeacher"]) $details.addClass("is-teacher");
                        else $details.removeClass("is-teacher");
                    }, 0);
                }
            }
        },
        switch: {  // 切换卡片
            pre: function(index) {
                var $scrollToTop = $(".scrollTop");
                if (index !== cardIndex) {
                    $switch.main.slideDown();
                    $scrollToTop.animate({bottom: "70px"});
                } else {
                    $switch.main.slideUp();
                    $scrollToTop.animate({bottom: "20px"});
                }
            },
            post: function(data) {
                return $.ajax({
                    type: "post",
                    url: "switch-card",
                    data: JSON.stringify(data),
                    contentType: "application/json;charset=UTF-8"
                });
            }
        }
    };

    // 卡片轮播方法 //
    var $swiperAction = {
        init: function() {  // 初始化
            return new Swiper('.swiper-container', {
                centeredSlides: true,  // 是否居中
                coverflowEffect: {  // 效果
                    rotate: 30,
                    stretch: 20,
                    depth: 80,
                    modifier: 2
                },
                effect : 'coverflow',
                freeMode: false,  // 是否自由滚动
                slidesPerView: 'auto',
                spaceBetween: 25,
                pagination: {  // 分页节点
                    el: '.swiper-pagination',
                    clickable: true
                },
                on: {  // 事件拦截
                    slideChange: function() {
                        $apis.switch.pre(this.activeIndex);
                    }
                }
            });
        },
        update: function() {  // 更新轮播
            return $swiper.update();
        }
    };

    // 主加载方法 //
    function dataInit() {
        $loader.error.clear();
        $.when(  // 等待所有请求完成后统一回调
            $apis.cards.get()
                .done(function(response) {
                    if (responseStatus(response)) {
                        $apis.cards.handler(response);
                        if (typeof $swiper !== "undefined") {
                            $swiper.update();
                        } else {
                            $swiper = $swiperAction.init();
                        }
                        var cardsSum = response["data"]["cards"].length;
                        if (cardsSum <= 1) {
                            var $container = $(".swiper-container"),
                                $pagination = $(".swiper-pagination");
                            $container.addClass("swiper-no-swiping");
                            $pagination.hide();
                        }
                    } else {
                        $loader.error.append("获取卡片列表失败 ("+response["message"]+")");
                    }
                })
                .fail(function(xhr, status) {
                    $loader.error.append("获取卡片列表失败 ("+xhr.status+" "+status+")");
                    console.log("Failed in get-cards: ", xhr.status, status);
                })
            ,
            $apis.cardInfo.get()
                .done(function(response) {
                    if (responseStatus(response)) {
                        $apis.cardInfo.handler(response);
                    } else {
                        $loader.error.append("获取卡片信息失败 ("+response["message"]+")");
                    }
                })
                .fail(function(xhr, status) {
                    $loader.error.append("获取卡片信息失败 ("+xhr.status+" "+status+")");
                    console.log("Failed in get-card-info: ", xhr.status, status);
                })
            ,
            $apis.recents.get()
                .done(function(response) {
                    if (responseStatus(response)) {
                        $apis.recents.handler(response);
                    } else {
                        $loader.error.append("获取最近消费失败 ("+response["message"]+")");
                    }
                })
                .fail(function(xhr, status) {
                    $loader.error.append("获取最近消费失败 ("+xhr.status+" "+status+")");
                    console.log("Failed in get-recent-records: ", xhr.status, status);
                })
        )
            .always(function() {  // 无论是否有失败的请求，都进入此处进行判断
                if ($failedReason.text() !== "") {
                    $loader.error.show();
                } else {
                    setTimeout(function() {
                        $swiper.slideTo(cardIndex);
                    }, 200);
                    $loader.hide();
                }
            });
    }

    // 判断请求是否成功 //
    function responseStatus(response) {
        return response["status"] === "success";
    }

})(jQuery);
