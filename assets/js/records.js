/*
 *  Author: AlexV
 *  Created: 2018-3-27 027
 */
$(function() {
    FastClick.attach(document.body);
});
(function($) {
    "use strict";

    var $pickDate = {  // 返回当前月份
        now: function() {
            var $date = new Date();
            return $date.getFullYear() + "-" + ($date.getMonth()+1);
        }
    };
    var $failedReason = $(".loader-errormsg").find("b"),
        $errorRefresh = $(".error-refresh"),
        $datepicker = {  // 日期选择节点及方法
            button: $("button[name=datepicker]"),
            input: $("input[name=date]"),
            date: $pickDate.now()
        },
        $records = $("#records"),  // 记录列表
        $type = {  // 类型切换组件
            dropdown: $(".type-dropdown"),
            control: {  // 控制方法
                el: $("span.type-select-type"),
                open: function() {
                    $type.control.el.addClass("hover");
                    $type.dropdown.show();
                    $type.cover.show();
                    window.requestAnimationFrame(function() {
                        $type.dropdown.addClass("expand");
                    });
                },
                close: function() {
                    $type.control.el.removeClass("hover");
                    $type.dropdown.removeClass("expand");
                    setTimeout(function() {
                        $type.dropdown.hide();
                        $type.cover.hide();
                    }, 150);
                }
            },
            ulist: $("ul.type-dropdown-menu"),
            cover: $(".type-select-cover"),  // 遮罩层
            type: "all",  // 类型（默认）
            getTypeName: function() {
                var name = $type.type;
                switch (name) {
                    case "all":
                        name = "全部";
                        break;
                    case "eating":
                        name = "餐费";
                        break;
                    case "electric":
                        name = "水电";
                        break;
                    case "in":
                        name = "收入";
                        break;
                }
                return name;
            }
        },
        $help = {
            el: {
                main: $(".help"),
                open: $("button[name=question]"),
                fold: $(".help-control-btn.fold")
            },
            proof: $(".help-proof"),
            content: $(".help-content"),
            control: {
                open: function() {
                    var $wrapper = $(".wrapper");
                    $wrapper.addClass("no-scroll");
                    $help.proof.fadeIn();
                    $help.el.main.slideDown();
                },
                fold: function() {
                    var $wrapper = $(".wrapper");
                    $wrapper.removeClass("no-scroll");
                    $help.proof.fadeOut();
                    $help.el.main.slideUp();
                }
            }
        },
        $loader = {  /*** 齿轮转动动画 匹配方法 ***/
            show: function() {
                var $loading   = $("#loading"),
                    $container = $(".container");
                $container.addClass("op-0");
                $loading.fadeIn("normal");
            },
            error: {
                show: function() {
                    var $errormsg = $(".loader-errormsg"),
                        $overlay  = $(".loader-overlay"),
                        $cogs     = $(".loader-cogs");
                    setTimeout(function() {
                        $overlay.animate({top:-150}, "fast");
                        $cogs.animate({top:-270}, "fast");
                        $errormsg.fadeIn("slow");
                    }, 500);
                },
                clear: function() {
                    var $errormsg = $(".loader-errormsg"),
                        $overlay  = $(".loader-overlay"),
                        $cogs     = $(".loader-cogs");
                    $overlay.animate({top:0}, "fast");
                    $cogs.animate({top:-120}, "fast");
                    $errormsg.fadeOut("fast");
                    $failedReason.text("");
                },
                append: function(reason) {
                    if ($failedReason.text().length !== 0) {
                        reason = "<br>" + reason
                    }
                    $failedReason.append(reason);
                }
            },
            hide: function() {
                var $loading   = $("#loading"),
                    $container = $(".container");
                setTimeout(function() {
                    $container.removeClass("op-0");
                }, 500);
                $loading.fadeOut("normal");
            },
            resize: function() {
                var $spinner      = $(".spinner");
                var screenHeight  = $(window).height();
                var spinnerHeight = $spinner.height();
                var spinnerMargin = ((screenHeight - spinnerHeight) / 2) + "px";
                $spinner.css("margin", spinnerMargin + " auto");
            }
        };

    // 使用图表的相关操作 //
    var $echarts = {
        get: function(date) {
            return $.getJSON("get-monthly-summary", {date:date, type:$type.type});
        },
        responseHandler: function(response) {
            if (response["status"] === "success") {
                var options = $echarts.options(response["data"]["summary"]);
                $echarts.loaded(options);
            } else {
                $loader.error.append("获取图表失败 ("+response["message"]+")");
            }
        },
        options: function(response) {  // 配置项
            var year  = $datepicker.input.val().split("-")[0],
                month = $datepicker.input.val().split("-")[1];
            return {
                title: {
                    show: true,
                    text: year+"年"+month+"月 每日"+$type.getTypeName()+"流水金额",
                    textStyle: {
                        align: "center",
                        color: "#999",
                        fontSize: 16
                    },
                    left: "center"
                },
                textStyle: {
                    fontFamily: "-apple-system, PingFang SC, Microsoft Yahei UI, sans-serif, Arial"
                },
                tooltip : {
                    trigger: "axis",
                    axisPointer : {
                        type : "shadow"
                    },
                    formatter: "{b}日<br>{a}: ￥{c}"
                },
                grid: {
                    left: 0,
                    right: 0,
                    top: 50,
                    bottom: 50
                },
                xAxis: {
                    type: "category",
                    position: "top",
                    axisTick: {
                        lineStyle: { color: "#474856" },
                        length: "230"
                    },
                    axisLabel: {
                        color: "#999",
                        fontSize: 14,
                        formatter: "{value}日"
                    },
                    axisLine: {
                        show: true,
                        lineStyle: { color: "#474856" }
                    },
                    axisPointer : {
                        type : "shadow"
                    },
                    data: response["date"]
                },
                yAxis: {
                    type: "value",
                    show: false
                },
                barCategoryGap: 0,
                series: [{
                    name: "流水金额",
                    type: "bar",
                    itemStyle: { color: "#676876" },
                    data: response["value"]
                }]
            }
        },
        loaded: function(options) {
            chart.setOption(options, true);
        },
        resize: function() {
            chart.resize();
        }
    };
    var chart = echarts.init($("#echarts")[0]);

    var $countUp = {  // 数字动画增加配置
        options: {
            useEasing: true,
            useGrouping: true,
            separator: ',',
            decimal: '.'
        },
        init: function(el, start, end, demicals, duration, options) {
            return new CountUp(el, start, end, demicals, duration, options);
        }
    };

    // 滑动组件相关方法 //
    var $scroll = {
        currentHeight: 0,
        get: function(url, page) {
            page.type  = $type.type;
            page.month = $datepicker.date;
            return $.getJSON(url, page);
        },
        clear: function() {
            $records.empty();
        },
        append: function(response) {
            var records = [];
            $.each(response, function(i, record) {
                var content = '<li class="record" data-index="'+record["id"]+'">'+
                    '<i class="iconfont icon-circledown"></i>'+
                    '<div class="record-info">'+
                    '<span class="record-info-location">'+record["location"]+'</span>'+
                    '<span class="record-info-date">'+record["time"]+'</span>'+
                    '<span class="record-info-type">'+record["type"]+'</span>' +
                    '<span class="record-info-receipt '+record["receipt"]+'">'+record["payment"]+' '+
                    '<p>'+record["balance"]+'</p>'+
                    '</span>'+
                    '</div>'+
                    /*+'<div class="record-detail">' +
                        '<span class="record-detail-time">消费时间: '+record["time"]+'</span>'+
                    '</div>'+*/
                    '</li>';
                records.push(content);
            });
            setTimeout(function() {
                var $end = $(".mescroll-upwarp");
                $records.append(records.join(""));
                if (records.length === 0) {
                    $end
                        .html("<p class=\"upwarp-nodata\">———— 没有数据(╯︵╰) ————</p>")
                        .stop().css("visibility", "visible");
                } else {
                    $end
                        .html("<p class=\"upwarp-nodata\">———— 没有更多数据(╯︵╰) ————</p>")
                        .stop().css("visibility", "visible");
                }
            }, 0);
        },
        /*iconRotate: function(e) {
            if (targetReturn(e, "i")) {
                var target = e.target || e.srcElement;
                var $i = $(target),
                    $list = $(target).parent();
                var $detail = $list.find(".record-detail");
                if ($detail.hasClass("expanded")) {
                    $i.removeClass("reverse");
                    $list.animate({height: "70px"});
                    $detail.removeClass("expanded");
                } else {
                    $i.addClass("reverse");
                    $list.animate({height: "100px"});
                    $detail.addClass("expanded");
                }
                $detail.slideToggle();
            }
        },*/
        upCallBack: function(page) {
            return $scroll.get("get-monthly-records", page)
                .done(function(response) {
                    if (response["status"] === "success") {
                        var data = response["data"];
                        $scroller.endSuccess(data["records"].length, data["hasNext"]);
                        $scroll.append(data["records"]);
                        console.log(data);
                        if (data["isTeacher"]) $records.addClass("is-teacher");
                        else $records.removeClass("is-teacher");
                    } else {
                        $loader.error.append("获取记录失败 ("+response["message"]+")");
                    }
                })
                .fail(function(xhr, status) {
                    $loader.error.append("获取记录失败 ("+xhr.status+" "+status+")");
                })
        }
    };

    // 滑动组件配置项 //
    var $scroller = new MeScroll("wrapper", {
        up: {
            callback: $scroll.upCallBack,
            offset: 200,
            auto: false,
            noMoreSize: 0,
            scrollbar: {
                use: false,
                barClass: "mescroll-bar"
            }
        },
        down: {
            use: false
        }
    });


    $(document).ready(function() {
        $loader.resize();
        $loader.show();
        $datepicker.input.val($datepicker.date);
        $datepicker.button.datepicker({
            autoclose: true,
            format: "yyyy-m",
            startView: 1,
            endDate: $datepicker.date,
            minViewMode: 1,
            maxViewMode: 3,
            language: "zh-CN",
            orientation: "bottom right"
        });
        dataInit($datepicker.date);
    });

    $(window).resize(function() {
        $echarts.resize(chart);
    });

    $errorRefresh.on("click", function() {
        $loader.error.clear();
        dataInit($datepicker.input.val());
    });

    $datepicker.input.on("change", function() {
        $datepicker.date = this.value;
        $loader.show();
        dataInit($datepicker.date);
    });

    $type.control.el.on("click", function() {
        if ($(this).hasClass("hover")) {
            $type.control.close();
        } else {
            $type.control.open();
        }
    });

    $type.cover.on("click scroll touchmove mousedown", function() {
        $type.control.close();
    });

    $type.ulist.on("click", function(e) {
        if (targetReturn(e, "a")) {
            var $list  = $(e.target).parent(),
                $lists = $type.ulist.find("li");
            if (!$list.hasClass("selected")) {
                $type.type = $(e.target).attr("data-type");
                $lists.removeClass("selected");
                $list.addClass("selected");
                $loader.show();
                dataInit($datepicker.date);
                $type.control.el.text($(e.target).text());
            }
            $type.control.close();
        }
    });

    $help.proof.on("click scroll touchmove", function() {
        $help.control.fold();
    });
    $help.el.open.on("click", function() {
        $help.control.open();
    });
    $help.el.fold.on("click", function() {
        $help.control.fold();
    });

    /*$records.on("click", function(e) {
        $scroll.iconRotate(e);
    });*/

    function targetReturn(e, el) {
        var target = e.target || e.srcElement;
        return target.nodeName.toLowerCase() === el;
    }

    function dataInit(date) {
        $failedReason.empty();
        $scroller.options.up.page.num = 1;
        $.when(
            $echarts.get(date)
                .done(function(response) {
                    var countEl = $countUp.init("amount", 0, response["data"]["summary"]["sum"], 2, 3, $countUp.options);
                    countEl.start();
                    $echarts.responseHandler(response);
                })
                .fail(function(xhr, status) {
                    $loader.error.append("获取图表失败 ("+xhr.status+" "+status+")");
                })
            ,
            $scroll.upCallBack({
                num: 1,
                size: 10,
                time: ""
            })
        )
            .always(function() {
                if ($failedReason.text() !== "") {
                    $loader.error.show();
                } else {
                    $records.empty();
                    var dateTemp = date.split("-"),
                        $date    = $(".summary-date"),
                        $typeEl  = $(".summary-type > strong");
                    $date.html(dateTemp[0]+'年，'+dateTemp[1]+'月');
                    $typeEl.text($type.getTypeName());
                    $loader.hide();
                }
            })
    }

})(jQuery);
