{
    // 因为原先的mousewheel 事件为非标准，已被废弃，许多浏览器不支持，但其作为核心功能之一，有必要兼容，所以借用 MDN 的兼容方法
    (function (window, document) {

        let prefix = "", _addEventListener, onwheel, support;

        // detect event model
        if (window.addEventListener) {
            _addEventListener = "addEventListener";
        } else {
            _addEventListener = "attachEvent";
            prefix = "on";
        }

        // detect available wheel event
        support = "onwheel" in document.createElement("div") ? "wheel" : // 各个厂商的高版本浏览器都支持"wheel"
            document.onmousewheel !== undefined ? "mousewheel" : // Webkit 和 IE一定支持"mousewheel"
                "DOMMouseScroll"; // 低版本firefox

        window.addWheelListener = function (elem, callback, useCapture) {
            _addWheelListener(elem, support, callback, useCapture);

            // 处理老版本火狐
            if (support == "DOMMouseScroll") {
                _addWheelListener(elem, "MozMousePixelScroll", callback, useCapture);
            }
        };

        function _addWheelListener(elem, eventName, callback, useCapture) {
            elem[_addEventListener](prefix + eventName, support == "wheel" ? callback : function (originalEvent) {
                !originalEvent && (originalEvent = window.event);

                // create a normalized event object
                let event = {
                    // keep a ref to the original event object
                    originalEvent: originalEvent,
                    target: originalEvent.target || originalEvent.srcElement,
                    type: "wheel",
                    deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
                    deltaX: 0,
                    deltaZ: 0,
                    preventDefault: function () {
                        originalEvent.preventDefault ?
                            originalEvent.preventDefault() :
                            originalEvent.returnValue = false;
                    }
                };
                // calculate deltaY (and deltaX) according to the event
                if (support == "mousewheel") {
                    event.deltaY = - 1 / 40 * originalEvent.wheelDelta;
                    // Webkit also support wheelDeltaX
                    originalEvent.wheelDeltaX && (event.deltaX = - 1 / 40 * originalEvent.wheelDeltaX);
                } else {
                    event.deltaY = originalEvent.detail;
                }

                // it's time to fire the callback
                return callback(event);

            }, useCapture || false);
        }

    })(window, document);

    class Canvas {
        constructor({ el, width, height }) {
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
            // 相对视口的x，y
            this.x;
            this.y;
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
            this.setSize({ viewBox: true, width: this.width, height: this.height });
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
            SVGBackground.insertAdjacentHTML('afterbegin', '<rect width="100%" height="100%" opacity="1" fill="#fff"></rect>')

            this.el.insertAdjacentElement('afterbegin', SVGWrap);
        }
        // 设置大小
        setSize({ viewBox = false, width, height } = {}) {
            let { SVGContent, SVGBackground } = this,
                viewBoxStr; // 内在坐标系
            // 进入这里说明是外界在更改画布的真实大小
            if (viewBox) {
                // 更改了viewBox 的话是需要重新计算缩放比的
                this.calcRatio({ width, height });
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
        calcRatio({ width = this.width, height = this.height }) {
            let el = this.el,
                elW = el.clientWidth - 60, //  -40 为的是留有间隙
                elH = el.clientHeight - 60,
                wRatio, hRatio; // 宽高的缩放比
            // 计算两者的缩放比 保留两位有效小数
            wRatio = +(elW / width).toFixed(2);
            hRatio = +(elH / height).toFixed(2);

            // 说明创建画布小于容器尺寸， 无需缩放
            if(wRatio >= 1 && hRatio >= 1) {
                this.zoom = 1;
            }else{
                // 取更小的那个值，作为缩放比
                this.zoom = wRatio > hRatio ? hRatio : wRatio;
            }

            // 缩放比计算完成后，就需要对画布宽高进行更新
            this.width = width * this.zoom;
            this.height = height * this.zoom;
        }
        // 位置更新
        setPosi(posi) {
            let { el, SVGContent, SVGBackground, width, height } = this,
                elW = el.clientWidth,
                elH = el.clientHeight,
                obj = { // 位置信息， 做出对象是为了下面遍历匹配方便
                    x: SVGContent.getAttribute('x') || 0,
                    y: SVGContent.getAttribute('y') || 0,
                }; // 元素的值计算

            // 默认情况
            if (posi === undefined) {
                obj.x = (elW - width) / 2;
                obj.y = (elH - height) / 2;
            } else {
                // x = SVGContent.getAttribute('x');
                // y = SVGContent.getAttribute('y');
                for (let [key, value] of Object.entries(posi)) {
                    if (typeof value === 'string' && (value.includes('-') || value.includes('+'))) { // +123 -123
                        // 执行此操作，如果传入 +23， 代表相对于当前坐标，再+23
                        obj[key] = eval(obj[key] + value);
                    } else {
                        obj[key] = value
                    }
                }
            }

            this.x = obj.x;
            this.y = obj.y;

            // 位置信息更新
            SVGContent.setAttribute('x', obj.x);
            SVGContent.setAttribute('y', obj.y);
            SVGBackground.setAttribute('x', obj.x);
            SVGBackground.setAttribute('y', obj.y);
        }

    }

    // let keyCode = '', // 键盘码
    //     wrap = document.getElementsByClassName('wrap')[0];
    // // 生成画布实例
    // let canvasArr = [
    //     new Canvas({
    //         el: wrap, // 选择父元素
    //         width: 1000, // 元素宽
    //         height: 2300, // 元素高
    //     })
    // ]
    // // 获取激活对象
    // let canvas = canvasArr[0];

    // // 事件绑定
    // document.addEventListener('keydown', keydown, false);
    // document.addEventListener('keyup', keyup, false);
    // wrap.addEventListener('mousedown', mousedown, false);

    // // 键盘按下
    // function keydown(e) {
    //     // 节流
    //     if (keyCode !== '') {
    //         return;
    //     }
    //     switch (e.key) {
    //         case ' ': // 空格
    //             keyCode = 'Space';
    //             wrap.style.cursor = 'grab';
    //             break;
    //         case 'Alt':
    //             keyCode = 'Alt';
    //             break;
    //     }

    //     e.preventDefault();
    // }
    // // 键盘抬起
    // function keyup(e) {
    //     switch (e.key) {
    //         case ' ': // 空格
    //         case 'Alt':
    //         case 'Ctrl':
    //             keyCode = '';
    //     }

    // }

    // // 鼠标按下准备拖拽
    // function mousedown(e) {
    //     // 如果没有按下空格键，不允许拖拽
    //     if (keyCode !== 'Space') return;

    //     let originX = e.clientX,
    //         originY = e.clientY,
    //         SVGContentX = parseInt(canvas.SVGContent.getAttribute('x')),
    //         SVGContentY = parseInt(canvas.SVGContent.getAttribute('y'));

    //     // 拖拽
    //     wrap.style.cursor = 'grabbing';

    //     document.onmousemove = function (e) {
    //         let targetX = e.clientX,
    //             targetY = e.clientY;

    //         canvas.setPosi({
    //             x: SVGContentX + (targetX - originX),
    //             y: SVGContentY + (targetY - originY)
    //         })
    //     }

    //     document.onmouseup = function () {
    //         document.onmousemove = null;
    //         document.onmouseup = null;

    //         // 样式恢复
    //         wrap.style.cursor = 'auto';
    //     }
    // }

    // // alt + 滚动
    // addWheelListener(wrap, (e) => {
    //     // 快捷键处理
    //     if (keyCode !== 'Alt') return;

    //     // 以任意一点A缩放的基本原理， A为鼠标位置，放大是以原点放大，那么会出现新的点A1, 将A1于A的相差值，重新于元素本身的x,y进行计算，得到新值（建议查看图解）
    //     let { clientX, clientY } = e, // 获取鼠标点 
    //         { left: l, top: t } = canvas.SVGContent.getBoundingClientRect(), // 获取元素相对坐标，用于坐标矫正
    //         x1, y1, x2, y2, n; // n 为扩大倍数


    //     if (e.deltaY < 0) { // 放大
    //         n = +(canvas.zoom + 0.06).toFixed(2);
    //     } else { // 缩小
    //         n = +(canvas.zoom - 0.06).toFixed(2);
    //     }
    //     // 对n进行判断， 规定放大倍数最大不大于5，最小不小于0.1
    //     n = n < 5 ? (n >= 0.1 ? n : 0.1) : 5;
    //     // 求出A点坐标
    //     x1 = clientX - l;
    //     y1 = clientY - t;
    //     // 求出扩大倍数 0.55 / 0.5 = 1.1;
    //     // 求出A1点坐标
    //     x2 = x1 * (n / canvas.zoom);
    //     y2 = y1 * (n / canvas.zoom);

    //     // 尺寸设置
    //     canvas.setSize({
    //         width: canvas.viewWidth * n,
    //         height: canvas.viewHeight * n
    //     });
    //     // 位置信息赋值
    //     canvas.setPosi({
    //         x: '+' + Math.round(x1 - x2),
    //         y: '+' + Math.round(y1 - y2)
    //     });

    //     // 缩放系数更新
    //     canvas.zoom = n;

    //     e.preventDefault();
    // })


    window.Canvas = Canvas;
}