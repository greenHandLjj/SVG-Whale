/*             第一代画布生成测试 start            */

/*
    1. 画布可以全屏 full screen
    2. 画布大小指的是 content 区和 background 区
    3. 可以对画布元素实行操控
    4. 可以记录操作
    5. 可以被保存

     new Canvas({
         width: 
     })
*/
// let wrap = document.querySelector('.wrap');

// class Canvas{
//     constructor({el, width, height}) {
//          // 父容器
//         this.el = el;
//         // 父容器宽高
//         this.elW = el.clientWidth;
//         this.elH = el.clientHeight;
//         // 实际画布区域尺寸 viewBox 坐标系实际值， 自动缩放以适配容器计算后的尺寸
//         this.width = width;
//         this.height = height;
//         // 计算后的画布尺寸 可视区大小
//         this.calcWidth;
//         this.calcHeight;
//         // 元素位置对象， 保存有X，Y轴偏移 监听X， Y
//         this.posi = new Proxy({x:0, y:0}, {
//             get: (target, key) => {
//                 return Reflect.get(target, key);
//             },
//             set: (target, key, value) => {
//                 // 在更新数据时，同时将值修改，响应视图
//                 if(key === 'x' || key === 'y') {
//                     this.SVGContent.setAttribute(key, value);
//                 }
//                 return Reflect.set(target, key, value);
//             }
//         })
//         // svg元素生成 一个控制背景， 一个控制内容， 一个负责包裹
//         /*
//             <svg class="wrap">
//                 <svg class="content"></svg>
//                 <svg class="background"></svg>
//             </svg>
//         */
//         this.SVGWrap;
//         this.SVGContent;
//         this.SVGBackground
//         // 画布区默认缩放比
//         this.ratio = 0.5;
//         // 初始化
//         this.init();
//     }
//     // 初始化
//     init() {
//         // 创建元素 
//         this.createSvg();
//         // 计算元素宽高缩放比
//         this.calcRatio();
//         // 定义元素尺寸 初始化
//         this.initialSize();
//         // 定义元素位置信息 初始化
//         this.initialPosi();
//         // 事件绑定
//         this.bindEvent();
//     }
//     // 创建所需元素
//     createSvg() {
//         let cloneEl = this.SVGWrap = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
//         this.SVGContent = cloneEl.cloneNode();
//         this.SVGBackground = cloneEl.cloneNode();
        
//         // 元素插入， 为什么不用appendChild 这是一款纯练习ES6 和新 DOM API的开源项目
//         cloneEl.insertAdjacentElement('afterbegin', this.SVGContent);
//         // cloneEl.insertAdjacentElement('afterbegin', this.SVGBackground);

//         // 元素测试
//         this.SVGContent.insertAdjacentHTML('afterbegin', '<rect x="20" y="20" width="200" height="300"></rect><rect width="100%" height="100%" opacity="0"></rect>')

//         this.el.insertAdjacentElement('afterbegin', cloneEl);
//     }
//     // 定义最初尺寸
//     initialSize() {
//         // 获取变量
//         let {SVGWrap, SVGContent, SVGBackground, width, height} = this;

//         SVGWrap.setAttribute('width', '100%');
//         SVGWrap.setAttribute('height', '100%');

//         SVGWrap.style.outline = '1px solid red';

//         // 设置尺寸
//         this.setSize();
//         SVGContent.style.outline = '1px solid blue';

//         // viewBox 初始设置
//         SVGContent.setAttribute('viewBox', `0 0 ${width} ${height}`);
//     }
//     // 计算缩放比
//     calcRatio() {
//         let {width, height, elW, elH, ratio: defautlRatio} = this,
//             widthRatio = elW / width,
//             heightRatio = elH / height,
//             // 缩放比
//             ratio = widthRatio > heightRatio ? heightRatio : widthRatio;

//             // 如果当前计算缩放比 比 默认值还要小才使用，保留两位有限小数
//             ratio = ratio < defautlRatio ? ratio : defautlRatio;

//             // 缩放后的尺寸赋值
//             this.calcWidth = width * this.ratio;
//             this.calcHeight = height * this.ratio;
//             // 比例赋值
//             this.ratio = ratio;
//     }
//     // 初始化位置信息
//     initialPosi(coordinate) { // coordinate x, y坐标信息
//         let {elW, elH, calcWidth, calcHeight, posi} = this;
//         // 属性赋值， 会被监听到，元素会被更新
//         if(coordinate === undefined){ // 默认居中
//             posi.x = (elW - calcWidth) / 2;
//             posi.y = (elH - calcHeight) / 2;
//         }else{
//             // 遍历对象
//             for(let [key, value] of Object.entries(coordinate)){
//                 if(typeof value === 'number' && isFinite(value)) {
//                     posi[key] = value;
//                 }
//             }
//         }   

//     }
//     // 事件绑定
//     bindEvent() {
//         let {SVGWrap, SVGContent, posi} = this,
//             calcWidth, calcHeight;
//         // !important 使用 deltaY 来判断滚动方向并不准确 据MDN所说，标准未定义滚轮事件会产生什么样的行为, 引发的行为是浏览器自定义的，即使滚轮事件引发了页面滚动，也不代表
//         // 滚动方向于文档内容的滚动方向一致，但据我简单测试(火狐，IE，Chorme)，向上滚动滚轮，deltaY值为负数， 向下滚动滚轮deltaY 为正数

//         addWheelListener(SVGWrap, (e) => {
//             // 以任意一点A缩放的基本原理， A为鼠标位置，放大是以原点放大，那么会出现新的点A1, 将A1于A的相差值，重新于元素本身的x,y进行计算，得到新值（建议查看图解）
//             let {clientX, clientY} = e, // 获取鼠标点 
//                 {left: l, top: t} = SVGContent.getBoundingClientRect(), // 获取元素相对坐标，用于坐标矫正
//                 x1, y1, x2, y2, n; // n 为扩大倍数

//             if(e.deltaY < 0) { // 放大
//                 n = +(this.ratio + 0.05).toFixed(2);
//             }else{ // 缩小
//                 n = +(this.ratio - 0.05).toFixed(2);
//             }

//             // 对n进行判断， 规定放大倍数最大不大于5，最小不小于0.1
//             n = n < 5 ? (n >= 0.1 ? n : 0.1) : 5;
//             // 求出A点坐标
//             x1 = clientX - l;
//             y1 = clientY - t;
//             // 求出扩大倍数 0.55 / 0.5 = 1.1;
//             // 求出A1点坐标
//             x2 = x1 * (n / this.ratio);
//             y2 = y1 * (n / this.ratio);

//             // 属性赋值
//             this.ratio = n;
//             // 宽高赋值
//             calcWidth = this.width * n;
//             calcHeight = this.height * n;
//             // 尺寸设置
//             this.setSize({
//                 width: calcWidth,
//                 height: calcHeight
//             });
//             // 位置信息赋值
//             this.initialPosi({
//                 x: posi.x + Math.round(x1 - x2),
//                 y: posi.y + Math.round(y1 - y2)
//             });

//             e.preventDefault();
//         })

//     }
//     // 设置尺寸
//     setSize({viewBox = false, width = this.calcWidth, height = this.calcHeight} = {}) {
//         let {SVGBackground, SVGContent} = this;

//         if(viewBox) { // viewBox 坐标尺寸
//             SVGContent.setAttribute('viewBox', `0 0 ${width} ${height}`);
//             SVGBackground.setAttribute('viewBox', `0 0 ${width} ${height}`);
//         }

//         // 容器大小设置
//         SVGContent.setAttribute('width', width);
//         SVGContent.setAttribute('height', height);
//         SVGBackground.setAttribute('width', width);
//         SVGBackground.setAttribute('height', height);
//     }

// }

// // 因为原先的mousewheel 事件为非标准，已被废弃，许多浏览器不支持，但其作为核心功能之一，有必要兼容，所以借用 MDN 的兼容方法
// (function(window,document) {

//     let prefix = "", _addEventListener, onwheel, support;

//     // detect event model
//     if ( window.addEventListener ) {
//         _addEventListener = "addEventListener";
//     } else {
//         _addEventListener = "attachEvent";
//         prefix = "on";
//     }

//     // detect available wheel event
//     support = "onwheel" in document.createElement("div") ? "wheel" : // 各个厂商的高版本浏览器都支持"wheel"
//               document.onmousewheel !== undefined ? "mousewheel" : // Webkit 和 IE一定支持"mousewheel"
//               "DOMMouseScroll"; // 低版本firefox

//     window.addWheelListener = function( elem, callback, useCapture ) {
//         _addWheelListener( elem, support, callback, useCapture );

//         // 处理老版本火狐
//         if( support == "DOMMouseScroll" ) {
//             _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
//         }
//     };

//     function _addWheelListener( elem, eventName, callback, useCapture ) {
//         elem[ _addEventListener ]( prefix + eventName, support == "wheel" ? callback : function( originalEvent ) {
//             !originalEvent && ( originalEvent = window.event );

//             // create a normalized event object
//             let event = {
//                 // keep a ref to the original event object
//                 originalEvent: originalEvent,
//                 target: originalEvent.target || originalEvent.srcElement,
//                 type: "wheel",
//                 deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
//                 deltaX: 0,
//                 deltaZ: 0,
//                 preventDefault: function() {
//                     originalEvent.preventDefault ?
//                         originalEvent.preventDefault() :
//                         originalEvent.returnValue = false;
//                 }
//             };
//             // calculate deltaY (and deltaX) according to the event
//             if ( support == "mousewheel" ) {
//                 event.deltaY = - 1/40 * originalEvent.wheelDelta;
//                 // Webkit also support wheelDeltaX
//                 originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
//             } else {
//                 event.deltaY = originalEvent.detail;
//             }

//             // it's time to fire the callback
//             return callback( event );

//         }, useCapture || false );
//     }

// })(window,document);

// // 生成画布实例
// let canvas =  new Canvas({
//     el: wrap, // 选择父元素
//     width: 800, // 元素宽
//     height: 1000, // 元素高
// })

// canvas.setSize({
//     viewBox: true,
//     width: 1000,
//     height: 800
// })

/*             第一代画布生成测试 end            */






/*             第二代画布生成测试 start            */

// 第一代为何被废弃，代码渐渐变得有混乱，思路已经被拧成了麻花，在情况变得更遭前，有必要重新设计，前期花费大量时间去设计程序，
// 尽可能考虑更全面，这样利于后续代码的编写

/*
    Canvas 画布
    Pen    画笔
        Rect        矩形
        Ellipse     圆
        ...
    
    目前设计流程：
        new Canvas({el: wrap, width: 100, height: 100}) 发生了什么？
        el: 父容器
        width: 画布宽（指的是content和background）
        height: 画布高（指的是content和background）

        init() 执行
            画布元素被创建并插入父容器中 （el）（3个svg）
            画布大小需要被定义，除开最外层包裹的svg容器宽高要与父容器一致，另外两个子容器需根据用户传入参数来决定大小，同时决定了svg的viewBox
                1) 大小可能会被后面更改，比方在绘制图形时发现画布宽高不够，需要临时添加额外的尺寸，
                    所以需要一个能修改画布宽高的方法 修改画布宽高分两种
                        1. viewBox 不变 画布宽高改变（缩放操作）
                            1.1 难点： 参考线也需要根据放大系数来改变当前刻度尺的单位长度
                                我能不能内置参考线呢？ 将参考线作为canvas 的一个属性，这个属性的值是一个类，涉及类于类之间的包含关系

                        2. viewBox 变，画布宽高同时改变 （重置画布尺寸）
                        
            画布大小确定后，位置需要发生改变，总不能抵着容器边缘吧，位置信息被更改，都需要通知参考线
                1）垂直居中对其应该是默认情况，修改的只有两个值（x，y）
                2）按住alt键 + 鼠标滚轮， 放大缩小，根据鼠标位置，放大指定区域
                3）按住空格键拖拽
                4）按住ctrl键 + 鼠标滚轮实现水平偏移
                5）难点: 记得我们有一个东西叫参考线吗，他也是一个类，我们修改了画布的x，y，那么同样参考线的原点坐标需要发生变化
            
            事件绑定功能，需要内置于canvas中吗？
            事件绑定 要注意，在document上绑定太多的快捷键监听函数，难免会造成冲突，有没有什么好办法呢？
                1） ctrl  + wheel
                2） alt   + wheel
                3） wheel
                4） space + wheel
                5） 全屏

        init函数告一段落，画布已经被初始化完毕，接下来才是难点

            ctrl + z 撤销操作如何实现， 保存一个数组？ 数组中存放每一个绘制上去的对象？通过对象实现的back方法，调用方法，回退一级？

            画布子元素监听 -- 图层功能，每绘制一个元素，如何通知外界并可视化出来 可能可以使用 DOM 观察者，新的API，不过需要对其做些包装
                难点2， 如果需要外界的可视化元素，实现拖拽改变层级，这个如何实现，两者如何衔接

            保存到外部... 文件操作，又要构造来构造去的了....

            导入SVG 难中之难
                类似PSD导入ps般，SVG被导入svg编辑器，这下涉及DOM如何解析，如何将现有的DOM转为数据，然后通过特定的类来构建，并且新建画布，图层管理，历史记录...

            未来扩展：
                可能需要辅助对其功能
                动画功能（这个可能将作为新的编辑器诞生）
                ....




*/



// 因为原先的mousewheel 事件为非标准，已被废弃，许多浏览器不支持，但其作为核心功能之一，有必要兼容，所以借用 MDN 的兼容方法
(function(window,document) {

    let prefix = "", _addEventListener, onwheel, support;

    // detect event model
    if ( window.addEventListener ) {
        _addEventListener = "addEventListener";
    } else {
        _addEventListener = "attachEvent";
        prefix = "on";
    }

    // detect available wheel event
    support = "onwheel" in document.createElement("div") ? "wheel" : // 各个厂商的高版本浏览器都支持"wheel"
              document.onmousewheel !== undefined ? "mousewheel" : // Webkit 和 IE一定支持"mousewheel"
              "DOMMouseScroll"; // 低版本firefox

    window.addWheelListener = function( elem, callback, useCapture ) {
        _addWheelListener( elem, support, callback, useCapture );

        // 处理老版本火狐
        if( support == "DOMMouseScroll" ) {
            _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
        }
    };

    function _addWheelListener( elem, eventName, callback, useCapture ) {
        elem[ _addEventListener ]( prefix + eventName, support == "wheel" ? callback : function( originalEvent ) {
            !originalEvent && ( originalEvent = window.event );

            // create a normalized event object
            let event = {
                // keep a ref to the original event object
                originalEvent: originalEvent,
                target: originalEvent.target || originalEvent.srcElement,
                type: "wheel",
                deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
                deltaX: 0,
                deltaZ: 0,
                preventDefault: function() {
                    originalEvent.preventDefault ?
                        originalEvent.preventDefault() :
                        originalEvent.returnValue = false;
                }
            };
            // calculate deltaY (and deltaX) according to the event
            if ( support == "mousewheel" ) {
                event.deltaY = - 1/40 * originalEvent.wheelDelta;
                // Webkit also support wheelDeltaX
                originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
            } else {
                event.deltaY = originalEvent.detail;
            }

            // it's time to fire the callback
            return callback( event );

        }, useCapture || false );
    }

})(window,document);

class Canvas{
    constructor({el, width, height}) {
        // 父容器
        this.el = el;
        // 画布宽高
        this.width = width;
        this.height = height;
        // viewBox 的尺寸
        this.viewWidth = width;
        this.viewHeight = height;
        // svg 元素
        this.SVGWrap;
        this.SVGContent;
        this.SVGBackground;
        // 缩放比 计算得来
        this.zoom;
        // 历史记录
        this.history = [];

        // 初始化
        this.init();
    }
    // 初始化
    init() {
        // 元素被创建，并进行初步初始化
        this.createSVG();
        // 大小设定 viewBox true 意思是需要更改viewBox的值
        this.setSize({viewBox: true, width: this.width, height: this.height});
    }
    // 创建元素
    createSVG() {
        let SVGWrap = this.SVGWrap = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            SVGContent = this.SVGContent = SVGWrap.cloneNode(),
            SVGBackground = this.SVGBackground = SVGWrap.cloneNode();

        // 设置类名
        SVGWrap.setAttribute('class', 'svg-wrap');
        SVGContent.setAttribute('class', 'svg-content');
        SVGBackground.setAttribute('class', 'svg-background');

        // SVGWarp 需要与父容器保持一致, 他的宽高不通过外界改变，且只需要自适应父级就好
        SVGWrap.setAttribute('width', '100%');
        SVGWrap.setAttribute('height', '100%');
        
        // 元素插入， 为什么不用appendChild 这是一款纯练习ES6 和新 DOM API的开源项目
        SVGWrap.insertAdjacentElement('afterbegin', SVGContent);
        SVGWrap.insertAdjacentElement('afterbegin', SVGBackground);

        // 元素测试
        // SVGWrap.style.border = '1px solid blue';
        // SVGContent.style.outline = '1px solid red';
        // SVGContent.insertAdjacentHTML('afterbegin', '<rect x="20" y="20" width="200" height="300"></rect><rect width="100%" height="100%" opacity="0"></rect>')
        SVGBackground.insertAdjacentHTML('afterbegin', '<rect width="100%" height="100%" opacity="1" fill="#f5f5f5"></rect>')

        this.el.insertAdjacentElement('afterbegin', SVGWrap);
    }
    // 设置大小
    setSize({viewBox = false, width, height} = {}) {
        let {SVGContent, SVGBackground} = this,
            viewBoxStr; // 内在坐标系
        // 进入这里说明是外界在更改画布的真实大小
        if(viewBox) {
            // 更改了viewBox 的话是需要重新计算缩放比的
            this.calcRatio({width, height});
            // viewBox赋值
            this.viewWidth = width;
            this.viewHeight = height;
            viewBoxStr = `0 0 ${width} ${height}`;
            // 因为缩放比改变的原因，所以重新赋值
            width = this.width;
            height = this.height;

            SVGContent.setAttribute('viewBox', viewBoxStr);
            SVGBackground.setAttribute('viewBox', viewBoxStr);

            // 位置更新 什么都不传代表采用默认值，居中对齐
            this.setPosi();
        }

        // 宽高大小重置
        SVGContent.setAttribute('width', width);
        SVGContent.setAttribute('height', height);
        SVGBackground.setAttribute('width', width);
        SVGBackground.setAttribute('height', height);
    }
    // 计算缩放比
    calcRatio({width = this.width, height = this.height}) {
        let el = this.el,
            elW = el.clientWidth - 40, //  -40 为的是留有间隙
            elH = el.clientHeight - 40,
            wRatio, hRatio; // 宽高的缩放比
        // 计算两者的缩放比 保留两位有效小数
        wRatio = +(elW / width).toFixed(2);
        hRatio = +(elH / height).toFixed(2);
        
        // 取更小的那个值，作为缩放比
        this.zoom = wRatio > hRatio ? hRatio : wRatio;

        // 缩放比计算完成后，就需要对画布宽高进行更新
        this.width = width * this.zoom;
        this.height = height * this.zoom;
    }
    // 位置更新
    setPosi(posi) {
        let {el, SVGContent, SVGBackground, width, height} = this,
            elW = el.clientWidth,
            elH = el.clientHeight,
            obj = { // 位置信息， 做出对象是为了下面遍历匹配方便
                x: SVGContent.getAttribute('x') || 0,
                y: SVGContent.getAttribute('y') || 0,
            }; // 元素的值计算

        // 默认情况
        if(posi === undefined) {
            obj.x = (elW - width) / 2;
            obj.y = (elH - height) / 2;
        }else{
            // x = SVGContent.getAttribute('x');
            // y = SVGContent.getAttribute('y');
            for(let [key, value] of Object.entries(posi)){
                if(typeof value === 'string' && (value.includes('-') || value.includes('+')) ) { // +123 -123
                    // 执行此操作，如果传入 +23， 代表相对于当前坐标，再+23
                    obj[key] = eval(obj[key] + value);
                }else{
                    obj[key] = value
                }
            }
        }

        // 位置信息更新
        SVGContent.setAttribute('x', obj.x);
        SVGContent.setAttribute('y', obj.y);
        SVGBackground.setAttribute('x', obj.x);
        SVGBackground.setAttribute('y', obj.y);
    }

}



let keyCode = '', // 键盘码
    wrap = document.getElementsByClassName('wrap')[0],
    btn = document.getElementById('btn');

// 生成画布实例
let canvasArr = [
    new Canvas({
        el: wrap, // 选择父元素
        width: 1000, // 元素宽
        height: 2300, // 元素高
    })
]
// 获取激活对象
let canvas =  canvasArr[0];

// 事件绑定
document.addEventListener('keydown', keydown, false);
document.addEventListener('keyup', keyup, false);
wrap.addEventListener('mousedown', mousedown, false);

// 键盘按下
function keydown(e) {
    // 节流
    if(keyCode !== '') {
        return;
    }
    switch(e.key) {
        case ' ': // 空格
            keyCode = 'Space';
            wrap.style.cursor = 'grab';
            break;
        case 'Alt': 
            keyCode = 'Alt';
            break;
    }

    e.preventDefault();
}
// 键盘抬起
function keyup(e) {
    switch(e.key) {
        case ' ': // 空格
        case 'Alt': 
        case 'Ctrl':
            keyCode = '';
    }

}

// 鼠标按下准备拖拽
function mousedown(e) {
    // 如果没有按下空格键，不允许拖拽
    if(keyCode !== 'Space') return;

    let originX = e.clientX,
        originY = e.clientY,
        SVGContentX = parseInt(canvas.SVGContent.getAttribute('x')),
        SVGContentY = parseInt(canvas.SVGContent.getAttribute('y'));

    // 拖拽
    wrap.style.cursor = 'grabbing';

    document.onmousemove = function(e) {
        let targetX = e.clientX,
            targetY = e.clientY;
        
        canvas.setPosi({
            x: SVGContentX + (targetX - originX),
            y: SVGContentY + (targetY - originY)
        })
    }

    document.onmouseup = function() {
        document.onmousemove = null;
        document.onmouseup = null;

        // 样式恢复
        wrap.style.cursor = 'auto';
    }
}

// alt + 滚动
addWheelListener(wrap, (e) => {
    // 快捷键处理
    if(keyCode !== 'Alt') return;

    // 以任意一点A缩放的基本原理， A为鼠标位置，放大是以原点放大，那么会出现新的点A1, 将A1于A的相差值，重新于元素本身的x,y进行计算，得到新值（建议查看图解）
    let {clientX, clientY} = e, // 获取鼠标点 
        {left: l, top: t} = canvas.SVGContent.getBoundingClientRect(), // 获取元素相对坐标，用于坐标矫正
        x1, y1, x2, y2, n; // n 为扩大倍数
        

    if(e.deltaY < 0) { // 放大
        n = +(canvas.zoom + 0.06).toFixed(2);
    }else{ // 缩小
        n = +(canvas.zoom - 0.06).toFixed(2);
    }
    // 对n进行判断， 规定放大倍数最大不大于5，最小不小于0.1
    n = n < 5 ? (n >= 0.1 ? n : 0.1) : 5;
    // 求出A点坐标
    x1 = clientX - l;
    y1 = clientY - t;
    // 求出扩大倍数 0.55 / 0.5 = 1.1;
    // 求出A1点坐标
    x2 = x1 * (n / canvas.zoom);
    y2 = y1 * (n / canvas.zoom);

    // 尺寸设置
    canvas.setSize({
        width: canvas.viewWidth * n,
        height: canvas.viewHeight * n
    });
    // 位置信息赋值
    canvas.setPosi({
        x: '+' + Math.round(x1 - x2),
        y: '+' + Math.round(y1 - y2)
    });

    // 缩放系数更新
    canvas.zoom = n;

    e.preventDefault();
})

btn.onclick = function() {
    let fullScreen = wrap.requestFullscreen();
    fullScreen.then(() => {
        // canvas.setPosi();
        // document.exitFullscreen(() => {
        //     console.log(1)
        // })
        canvas.setPosi()
    })

}

document.onfullscreenchange = function(e) {
    console.log('fullscreen', e.target.fullScreen)
}

/*             第二代画布生成测试 end              */
