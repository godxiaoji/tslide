# tSlide.js

PC端滑动插件

可用于实现幻灯片

### Usage

##### new tSlide(wrapper, options)

eg:
    
    var wrapper = document.getElementById('slide');
        slide = new tSlide(wrapper, {
            autoPlay: true
        });

##### $(elem).tSlide(options)

支持jQuery，会在元素中绑定一个elem.slide

### Options

插件提供可配置的选项：

* `listClass`: 列表className，尽量使用没有任何样式的钩子，默认`J_List`
* `itemClass`: 列表项className，默认`J_Item`，可update
* `prevClass`: 上一页className，默认`J_Prev`，查询到改元素自动加入事件
* `nextClass`: 下一页className，默认`J_Next`，查询到改元素自动加入事件
* `autoPlay`: 是否自动滑动，默认`false`，可update
* `interval`: 两次滑动之间的间隔时间，默认`6000`s，可update
* `easing`: 动画曲线，有`linear`, `swing`，默认`swing`，可update
* `duration`: 动画时间，默认`400`ms，可update
* `index`: 初始定位指定项，默认`0`，可update
* `onBeforeSlide`: 滑动前回调函数，调用后传入当前索引和上一次索引作为参数，`this`指向`slide`自身，可update
* `onSlide`: 滑动后回调函数，调用后传入当前索引和上一次索引作为参数，`this`指向`slide`自身，可update

### Method

##### .to(index)

滑动到指定项（已做边界处理），如滑动到第6项（0开始），eg:

    slide.to(5);

##### .prev(circle)

滑动到上一项（circle为true则循环）

##### .next(circle)

滑动到上一项（circle为true则循环）

##### .update()

重新设定一些配置，具体参见`Options`

### Author

[Travis](http://travisup.com/)