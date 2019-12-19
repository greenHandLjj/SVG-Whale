{
    // 事件列表，全局配置
    const EVENTS = {
        colorchange: []
    }
    // ColorPickerComponent 列表
    const CPC = new Map();

    // 初始化
    function init() {
        // 获取所有 ColorPickerComponent 元素
        let cp = [...document.querySelectorAll('colorComponent')];

        cp.forEach(el => {
            // 类创建
            CPC.set(el, new ColorPickerComponent({ el }));
            // 导航栏事件绑定
            navBindEvent(CPC.get(el), el.querySelectorAll('.colorNavBar span'));
        })
    }

    function navBindEvent(colorClass, els) {
        let i = 0;
        els[0].onclick = function () {
            publicCode.call(this, 0);
        }
        els[1].onclick = function () {
            publicCode.call(this, 1);
        }
        els[2].onclick = function () {
            publicCode.call(this, 2);
        }

        function publicCode(n) {
            if (i === n) {
                return;
            }
            // 清除带有active 类名的元素
            els[i].classList.remove('active');
            this.classList.add('active');
            i = n;
            switch (n) {
                case 0:
                    // 切换至色相选择
                    colorClass.changeStatus('h');
                    break;
                case 1:
                    // 切换至饱和度选择
                    colorClass.changeStatus('s');
                    break;
                case 2:
                    // 切换至亮度选择
                    colorClass.changeStatus('l');
                    break;
            }
        }
    }

    class ColorPickerComponent {
        constructor({ el }) {
            // 组件容器
            this.el = el;
            // 画布大小
            this.size = 300;
            // 可复用的canvas 图形。一次绘制多次使用 会在初始化时赋值
            this.colorImage;
            // 当前绘制状态， 可在 [H, S, L] 中切换
            this.status = 'H';
            // 外环宽度
            this.weight = 20;
            // hsl 颜色数据值， 每一个类应该自己管理一份独立的hsl
            this.HSL = {
                h: 0,
                s: 70,
                l: 50
            }
            // 初始化
            this.init(el);
        }

        init(el) {
            // 包装类
            this.packing(el);
            // 渲染视图
            this.render();
            // 事件绑定
            this.bindEvent();
        }
        // 对el元素进行一层包装，让其拥有特殊的属性和方法
        packing(el) {
            // 可检测事件属性添加
            el._events = {};
            for (let prop in EVENTS) {
                el._events[prop] = [];
            }
            // 事件绑定
            el.on = function (type, fn) {
                let arr;

                if (typeof type !== 'string') {
                    throw new TypeError('first argument is must be a string');
                }
                if (typeof fn !== 'function') {
                    throw new TypeError('second argument is must be a function');
                }

                arr = this._events[type];
                // 检查事件名称是否正确
                if (arr instanceof Array) {
                    // 注册函数
                    arr.push(fn);
                } else {
                    throw new Error('event name is Non-existent');
                }
            }
            // 事件触发
            // el.trigger = function(type) {
            //     let arr;
            //     if (typeof type !== 'string') {
            //         throw new TypeError('first argument is must be a string');
            //     }
            //     arr = this._events[type];
            //     arr.forEach(item => item.call(this, HSL));
            // }
            // 事件解绑
            el.off = function (type, fn) {
                let arr, index;

                if (typeof type !== 'string') {
                    throw new TypeError('first argument is must be a string');
                }
                if (typeof fn !== 'function') {
                    throw new TypeError('second argument is must be a function');
                }
                arr = this._events[type];
                if (arr instanceof Array) {
                    index = arr.findIndex(item => item === fn);
                } else {
                    throw new Error('event name is Non-existent');
                }

                if (index !== undefined) {
                    arr.splice(index, 1);
                }
            }
            // 清除指定事件列表
            el.clear = function (type) {
                let arr;
                if (typeof type !== 'string') {
                    throw new TypeError('first argument is must be a string');
                }

                arr = this._events[type];
                if (arr instanceof Array) {
                    // 注意 arr = [], 那只是改了引用地址， 并不会对原数组产生影响
                    arr.splice(0, arr.length);
                }
            }
        }
        // 渲染UI界面
        render() {
            // DOM 生成
            this.createUi();
            // canvas界面绘制
            this.renderStatic();
            this.renderDynamic();
        }
        // 创建 UI
        createUi() {
            // 元素生成
            let el = this.el,
                can = this.can = document.createElement('canvas'),
                colorNavBar = document.createElement('div'),
                // 元素节点
                navHtml = `
                        <span class="hue active">色相环</span>
                        <span class="saturation">饱和度</span>
                        <span class="light">亮度</span>
                        `;
            colorNavBar.className = 'colorNavBar';
            colorNavBar.innerHTML = navHtml;
            can.width = can.height = this.size;
            can.id = 'colorPicker';

            el.appendChild(can);
            el.appendChild(colorNavBar);

        }
        // 绘制静态图
        renderStatic() {
            let status = this.status;
            // 状态分流
            switch (status) {
                case 'H':
                    // 进入色相选择面板
                    this.renderHue();
                    break;
                case 'S':
                    // 进入饱和度选择面板
                    this.renderSaturation();
                    break;
                case 'L':
                    // 进入亮度选择面板
                    this.renderLight();
                    break;
            }
        }
        // 选择色相
        renderHue() {
            let r = this.size / 2, // 半径
                weight = this.weight, // 外环宽
                angleArr = [], // 文字角度
                HSL = this.HSL,
                can = this.can,
                ctx = can.getContext('2d');

            // if (!this.colorImage) {
            // 渐变色
            let gradient = ctx.createLinearGradient(0, 0, r * 2, r * 2);
            gradient.addColorStop(0, 'hsl(240, 50%, 50%)');
            gradient.addColorStop(1, 'hsl(322, 50%, 50%)');

            // 外环
            ctx.beginPath();
            // 原始状态保存
            ctx.save();
            ctx.fillStyle = '#fff';
            // ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = gradient;
            ctx.lineWidth = weight * 2;
            ctx.arc(r, r, r - weight + 2, 0, Math.PI * 2, false);
            ctx.stroke();
            ctx.fill();
            // 原始状态恢复 
            ctx.restore();

            // 生成色谱
            for (let i = 0; i < 360; i++) {
                ctx.beginPath();
                ctx.fillStyle = `hsl(${i}, ${HSL.s}%, ${HSL.l}%)`;
                ctx.moveTo(r, r);
                ctx.arc(r, r, r - weight, Math.PI / 180 * i, Math.PI / 180 * (i + 1.6), false);
                ctx.closePath();
                ctx.fill();

                if (i % 60 === 0) {
                    angleArr.push(i);
                }
            }

            // 内环
            ctx.beginPath();
            ctx.fillStyle = ctx.strokeStyle = '#fff';
            // ctx.moveTo(r, r);
            ctx.arc(r, r, (r - weight) / 1.4, 0, Math.PI * 2, false);
            ctx.stroke();

            // 角度坐标
            angleArr.forEach(angle => {
                let radius = (r - weight),
                    // 高中数学, 已知角度，半径，圆心坐标，求边上一点
                    cos = Math.cos(angle * Math.PI / 180),
                    sin = Math.sin(angle * Math.PI / 180);

                let x1 = r + radius / 1.4 * cos;
                let y1 = r + radius / 1.4 * sin;
                let x2 = r + radius / 1.6 * cos;
                let y2 = r + radius / 1.6 * sin;
                let x3 = r + (r - weight / 2) * cos;
                let y3 = r + (r - weight / 2) * sin;

                // 坐标轻微调整
                if (angle === 180 || angle === 240) {
                    x3 -= 4;
                }
                angle === 240 ? y3 -= 2 : '';

                ctx.beginPath();
                ctx.fillStyle = ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.textBaseline = 'alphabetic';
                ctx.font = '12px 微软雅黑';
                ctx.fillText(angle + '°', x3 - 6, y3 + 8);
                ctx.stroke();
            })

            // IE 不支持 toBolb
            // can.toBlob((bold) => {
            //     this.colorImage = new Image();
            //     this.colorImage.src = URL.createObjectURL(bold);
            // });
            // } else {
            // ctx.drawImage(this.colorImage, 0, 0);
            // }
        }
        // 选择饱和度
        renderSaturation() {
            let r = this.size / 2, // 半径
                weight = this.weight, // 外环宽
                HSL = this.HSL,
                can = this.can,
                ctx = can.getContext('2d');

            // 渐变色
            let gradient = ctx.createLinearGradient(0, 0, r * 2, r * 2);
            gradient.addColorStop(0, 'hsl(240, 50%, 50%)');
            gradient.addColorStop(1, 'hsl(322, 50%, 50%)');

            // 外环
            ctx.beginPath();
            // 原始状态保存
            ctx.save();
            ctx.fillStyle = '#fff';
            // ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = gradient;
            ctx.lineWidth = weight * 2;
            ctx.arc(r, r, r - weight + 2, 0, Math.PI * 2, false);
            ctx.stroke();
            ctx.fill();
            // 原始状态恢复 
            ctx.restore();

            // 根据色相亮度绘制饱和度
            ctx.save();
            for (let i = 0; i <= 100; i++) {
                ctx.beginPath();
                // 默认色值
                ctx.fillStyle = `hsl(${HSL.h}, ${100 - i}%, ${HSL.l}%)`;
                // ctx.globalCompositeOperation = 'destination-atop';
                ctx.moveTo(r, r);
                ctx.arc(r, r, r - weight, 0, Math.PI / 180 * ((100 - i) * 3.6), false);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();

            // 内环 轨迹路线图
            ctx.beginPath();
            ctx.fillStyle = ctx.strokeStyle = '#fff';
            ctx.arc(r, r, (r - weight) / 1.4, 0, Math.PI * 2, false);
            ctx.stroke();

            // 文字绘制
            ctx.beginPath();
            ctx.fillStyle = '#fff';
            ctx.font = '20px 微软雅黑';
            ctx.fillText('+', r * 2 - 15, r + 6);
            ctx.font = '24px 微软雅黑';
            ctx.fillText('-', 5, r + 8);

        }
        // 选择亮度
        renderLight() {
            let r = this.size / 2, // 半径
                weight = this.weight, // 外环宽
                HSL = this.HSL,
                can = this.can,
                ctx = can.getContext('2d');

            // 渐变色
            let gradient = ctx.createLinearGradient(0, 0, r * 2, r * 2);
            gradient.addColorStop(0, 'hsl(240, 50%, 50%)');
            gradient.addColorStop(1, 'hsl(322, 50%, 50%)');

            // 外环
            ctx.beginPath();
            // 原始状态保存
            ctx.save();
            ctx.fillStyle = '#fff';
            // ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = gradient;
            ctx.lineWidth = weight * 2;
            ctx.arc(r, r, r - weight + 2, 0, Math.PI * 2, false);
            ctx.stroke();
            ctx.fill();
            // 原始状态恢复 
            ctx.restore();

            // 根据色相饱和度绘制亮度
            ctx.save();
            for (let i = 0; i <= 100; i++) {
                ctx.beginPath();
                // 默认色值
                ctx.fillStyle = `hsl(${HSL.h}, ${HSL.s}%, ${100 - i}%)`;
                // ctx.globalCompositeOperation = 'destination-atop';
                ctx.moveTo(r, r);
                ctx.arc(r, r, r - weight, 0, Math.PI / 180 * ((100 - i) * 3.6), false);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();

            // 内环 轨迹路线图
            ctx.beginPath();
            ctx.fillStyle = ctx.strokeStyle = '#fff';
            ctx.arc(r, r, (r - weight) / 1.4, 0, Math.PI * 2, false);
            ctx.stroke();

        }
        // 绘制动态图
        renderDynamic() {
            let r = this.size / 2, // 半径
                status = this.status,
                weight = this.weight, // 外环边框粗细
                HSL = this.HSL,
                can = this.can,
                ctx = can.getContext('2d');

            // x, y 坐标计算
            let x1,
                y1;
            // 根据当前状态决定取值
            switch (status) {
                case 'H':
                    x1 = r + (r - weight) / 1.4 * Math.cos(HSL.h * Math.PI / 180);
                    y1 = r + (r - weight) / 1.4 * Math.sin(HSL.h * Math.PI / 180);
                    break;
                case 'S':
                    x1 = r + (r - weight) / 1.4 * Math.cos(HSL.s * 3.6 * Math.PI / 180);
                    y1 = r + (r - weight) / 1.4 * Math.sin(HSL.s * 3.6 * Math.PI / 180);
                    break;
                case 'L':
                    x1 = r + (r - weight) / 1.4 * Math.cos(HSL.l * 3.6 * Math.PI / 180);
                    y1 = r + (r - weight) / 1.4 * Math.sin(HSL.l * 3.6 * Math.PI / 180);
                    break;
            }

            // 颜色预览
            ctx.beginPath();
            ctx.save();
            ctx.fillStyle = `hsl(${HSL.h}, ${HSL.s}%, ${HSL.l}%)`;
            ctx.strokeStyle = '#fff';
            ctx.shadowColor = "rgba(0, 0, 0, .4)";
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowBlur = 4;
            ctx.lineWidth = 3;
            ctx.arc(r, r, r / 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fill();
            ctx.restore();

            // 可视化拖拽原点
            ctx.beginPath();
            ctx.fillStyle = `rgba(50, 50, 50, .7)`;
            ctx.strokeStyle = '#fff';
            ctx.arc(x1, y1, 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fill();
        }
        // 切换绘画状态
        changeStatus(status) {
            status = status.toUpperCase();
            if (typeof status === 'string' && status.length === 1) {
                this.status = status;
                // 绘制
                this.renderStatic();
                this.renderDynamic();
            } else {
                throw new TypeError("State value optional [H, S, L]");
            }
        }
        // canvas 元素默认行为定义
        bindEvent() {
            let can = this.can,
                HSL = this.HSL,
                ctx = can.getContext('2d');
            // 抽离公共代码
            let publicCode = (e) => {
                let angle,
                    status = this.status, // 颜色选择信息
                    // canvas 距离上 距离左 的位置信息 
                    { left: canLeft, top: canTop } = can.getBoundingClientRect(),
                    cx = canLeft + this.size / 2, // 圆心x
                    cy = canTop + this.size / 2, // 圆心y
                    cursorX = e.clientX, // 鼠标点 x
                    cursorY = e.clientY; // 鼠标点 y

                // angle = Math.asin( (cy - cursorY) / Math.sqrt(Math.pow(cy - cursorY, 2) + Math.pow(cx - cursorX, 2)) )
                /*
                    夹角计算方式
                        angle = Math.atan2((cursorY - cy), (cursorX - cx))
                    弧度转角度
                        angle = angle * (180/Math.PI)
                */
                angle = Math.atan2((cursorY - cy), (cursorX - cx)) * (180 / Math.PI);

                if (angle < 0) {
                    angle = Math.round(180 + (180 - Math.abs(angle)));
                } else {
                    angle = Math.round(angle);
                }

                // 赋值
                switch (status) {
                    case 'H':
                        HSL.h = angle;
                        break;
                    case 'S':
                        HSL.s = Math.round(angle / 3.6);
                        break;
                    case 'L':
                        HSL.l = Math.round(angle / 3.6);
                        break;
                }
                // console.log(HSL.s, HSL.h)
                // 清除画布
                ctx.clearRect(0, 0, this.size, this.size);
                // 视图更新
                this.renderStatic();
                this.renderDynamic();

                // oncolorchange事件触发
                this.trigger('colorchange');
            }
            // canvas down
            can.addEventListener("mousedown", (e) => {
                publicCode(e);

                document.addEventListener('mousemove', move, false);
                document.addEventListener('mouseup', up, false);
            })
            // document move
            let move = (e) => {
                publicCode(e);
                // 让其更加平滑
                e.preventDefault();
            }
            // document up
            let up = (e) => {
                // 取绑
                document.removeEventListener('mousemove', move, false);
                document.removeEventListener('mouseup', up, false);
            }
        }
        // 触发容器元素上的自定义事件
        trigger(type) {
            let arr,
                HSL = this.HSL,
                el = this.el;
            if (typeof type !== 'string') {
                throw new TypeError('first argument is must be a string');
            }
            arr = el._events[type];
            arr.forEach(item => item.call(el, HSL));
        }
        // 设置hsl
        setHsl({ s, h, l }) {
            let HSL = this.HSL;
            // 自己传入的数据还需要校验吗
            s && (HSL.s = s);
            h && (HSL.h = h);
            l && (HSL.l = l);

            // 视图更新
            this.renderStatic();
            this.renderDynamic();
        }
        setRgb({ r, g, b }) {

        }
        // return [h, s, l]
        getHsl() {

        }
        // return [r, g, b]
        getRgb() {

        }
    }

    // important!!!
    init();
}