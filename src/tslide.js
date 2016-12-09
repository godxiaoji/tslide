/**
 * tScroll
 * @Author  Travis
 * @Contact http://travisup.com/
 * @Version 1.0.0
 * @date    2016-10-23
 */
(function() {

    var kss = {};

    kss.now = function() {
        return (new Date()).getTime();
    };

    var timers = [],
        timerId = null;

    // 动画模块(update at 2013.03.27)
    kss.fx = function(elem, prop, options) {
        options = options || {};
        options.speed = options.speed || 200;
        options.easing = options.easing || 'swing';
        options.callback = options.callback || function() {};
        this.elem = elem;
        this.options = options;
        this.name = prop.name;
        this.start(prop.from, prop.to);
    };

    kss.fx.prototype = {
        start: function(from, to) {
            this.start = kss.now();
            this.end = this.start + this.options.speed;
            this.from = from;
            this.to = to;

            timers.push(this);
            kss.fx.start();
        },

        step: function(t) {
            var p,
                pos;
            if (t >= this.end) {
                pos = this.to;
                this.stop();

                // 结束后回调
                this.options.callback.call(this.elem);
            } else {
                p = kss.easing[this.options.easing]((t - this.start) / this.options.speed);
                pos = this.from + ((this.to - this.from) * p);
            }
            this.update(pos);
        },

        update: function(value) {
            this.elem.style[this.name] = value + "px";
        },

        stop: function() {
            var i = timers.length - 1;

            for (; i >= 0; i--) {
                if (timers[i] === this) {
                    timers.splice(i, 1);
                    break;
                }
            }
        }
    };

    kss.fx.tick = function() {
        var i = 0,
            fxNow = kss.now();
        for (; i < timers.length; i++) {
            timers[i].step(fxNow);
        }
        if (timers.length === 0) {
            kss.fx.stop();
        }
        fxNow = undefined;
    };

    kss.fx.start = function() {
        if (!timerId) {
            timerId = setInterval(kss.fx.tick, 13);
        }
    };

    kss.fx.stop = function() {
        clearInterval(timerId);
        timerId = null;
    };

    kss.fx.elemStop = function(elem) {
        var i = timers.length - 1;
        for (; i >= 0; i--) {
            if (timers[i].elem === elem) {
                timers[i].stop();
            }
        }
    };

    kss.easing = {
        linear: function(p) {
            return p;
        },
        swing: function(p) {
            return 0.5 - Math.cos(p * Math.PI) / 2;
        }
    };

    window.KssAnimate = kss;
})();

(function() {
    function noop() {}

    // 事件绑定
    function addEvent(elem, type, fn) {
        if (elem.addEventListener) {
            elem.addEventListener(type, fn, false);
        } else if (elem.attachEvent) {
            elem.attachEvent('on' + type, function() {
                var event = window.event;

                fn.call(elem, event);
            });
        }
    }

    // 查找元素
    function querySelectorAll(selector, parentNode) {
        if (!parentNode) {
            parentNode = document;
        }
        if (parentNode.querySelectorAll) {
            return parentNode.querySelectorAll(selector);
        }
        var rTagClass = /^\.([\w-]+)$/,
            match = rTagClass.exec(selector),
            elems, rets = [], i;

        if (match && match[1]) {
            elems = parentNode.getElementsByTagName("*");
            for (i = 0; i < elems.length; i++) {
                if (hasClass(elems[i], match[1])) {
                    rets.push(elems[i]);
                }
            }
        }
        return rets;
    }

    function querySelector(selector, parentNode) {
        var elems = querySelectorAll(selector, parentNode);
        return elems[0] || null;
    }

    // 样式操作
    function hasClass(elem, className) {
        return (' ' + elem.className + ' ').indexOf(' ' + className + ' ') >= 0;
    }

    function Init(wrapper, options) {
        var self = this;

        if (!wrapper || wrapper.nodeType !== 1) {
            return false;
        }

        if (typeof options !== 'object') {
            options = {};
        }

        // 获取节点
        this.$wrapper = wrapper;
        this.$list = querySelector('.' + (options.listClass || 'J_List'), wrapper);
        this.$prev = querySelector('.' + (options.prevClass || 'J_Prev'), wrapper);
        this.$next = querySelector('.' + (options.nextClass || 'J_Next'), wrapper);

        // 绑定hover暂停事件
        addEvent(this.$wrapper, 'mouseover', function(e) {
            self.stop();
        });
        addEvent(this.$wrapper, 'mouseout', function(e) {
            if (self.autoPlay) {
                self.start();
            }
        });

        // 绑定上一页/下一页按钮
        if (this.$prev) {
            addEvent(this.$prev, 'click', function(e) {
                self.prev(true);
            });
        }
        if (this.$next) {
            addEvent(this.$next, 'click', function(e) {
                self.next(true);
            });
        }

        // 更新实时设定
        this.update(options);
    }

    Init.prototype = {
        autoPlay: false, // 是否自动播放
        interval: 6000, // 每次滑动间隔时间
        duration: 400, // 滑动过程中所需时间
        slideTimer: null, // 自动滑动定时器
        running: false, // 自动滑动状态
        playing: false, // 滑动过程状态
        easing: 'swing', // 动画曲线
        index: 0, // 当前索引
        onBeforeSlide: noop, // 滑动前调用事件
        onSlide: noop, // 滑动后回调事件
        getLastIndex: function() {
            return this.$items.length - 1;
        },
        // 获取循环的索引
        getCircleIndex: function(step) {
            var len = this.$items.length;
            return (this.index + len + step % len) % len;
        },
        // 更新实时设定
        update: function(options) {
            if (typeof options !== 'object') {
                options = {};
            }

            this.options = options;

            // 设置方向
            if (options.direction === 'y') {
                this.direction = 'y';
                this.directionGroup = ['top', 'Height'];
            } else {
                this.direction = 'x';
                this.directionGroup = ['left', 'Width'];
            }

            // 自定义设置
            var cusMap = ['easing', 'onBeforeSlide', 'onSlide', 'autoPlay', 'interval', 'duration'],
                i = 0,
                len = cusMap.length,
                cusName;
            for (; i < len; i++) {
                cusName = cusMap[i];
                if (options[cusName] != null) {
                    this[cusName] = options[cusName];
                }
            }

            // 重设列表
            this.wrapSize = this.$wrapper['offset' + this.directionGroup[1]];
            this.$items = querySelectorAll('.' + (options.itemClass || 'J_Item'), this.$list);

            // 设置宽度
            this.$list.style[this.directionGroup[1].toLowerCase()] = (this.wrapSize * this.$items.length) + 'px';

            // 滑动到指定位置
            this.to(options.index || this.index);

            this.stop();
            if (this.autoPlay) {
                this.start();
            }
        },
        // 跳转到上一项
        prev: function(circle) {
            this.to(circle ? this.getCircleIndex(-1) : this.index - 1);
        },
        // 跳转到下一项
        next: function(circle) {
            this.to(circle ? this.getCircleIndex(1) : this.index + 1);
        },
        // 到指定项
        to: function(toIndex) {
            var active = this.index;
            if (toIndex >= 0 && toIndex <= this.getLastIndex() && toIndex != active) {
                this.slide(toIndex);
            } else {
                this.slide(active);
            }
        },
        // 滑动
        slide: function(toIndex) {
            var self = this,
                fromIndex = this.index;

            this.playing = true;
            this.index = toIndex;

            this.onBeforeSlide(toIndex, fromIndex);

            var elem = this.$list,
                from = parseInt(elem.style[this.directionGroup[0]] || 0),
                to = -this.index * this.wrapSize;

            // 停止运动
            KssAnimate.fx.elemStop(elem);
            new KssAnimate.fx(elem, {
                name: this.directionGroup[0],
                from: from,
                to: to
            }, {
                easing: this.easing,
                speed: this.duration,
                callback: function() {
                    self.playing = false;
                    self.onSlide(toIndex, fromIndex);
                }
            });
        },
        // 开始幻灯片
        start: function() {
            if (!this.running) {
                this.running = true;
                this.clear();
                this.run();
            }
        },
        // 结束幻灯片
        stop: function() {
            this.running = false;
            this.clear();
        },
        // 清除滑动状态
        clear: function() {
            clearTimeout(this.slideTimer);
            this.slideTimer = null;
        },
        // 启动自动滑动
        run: function() {
            var self = this;
            if (!this.slideTimer) {
                this.slideTimer = setInterval(function() {
                    self.to(self.getCircleIndex(1));
                }, this.interval);
            }
        }
    };

    window.tSlide = Init;

    // 支持jQuery
    if(window.jQuery) {
        jQuery.fn.extend({
            tSlide: function(options) {
                this.each(function() {
                    this.slide = new Init(this, options);
                });
            }
        })
    }
})();