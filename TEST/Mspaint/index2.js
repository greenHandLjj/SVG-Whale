/*             第二代图形绘制测试 start            */

let wrap = document.querySelector('#wrap'),
    content = wrap.querySelector('#content'),
    background = wrap.querySelector('#background');

// 坐标轴矫正准备
let { left: contentLeft, top: contentTop } = content.getBoundingClientRect();

// 工具函数

// 颠倒坐标 传入参数 原点x， 目标的x， 原点y，目标点y
function coordinateReverse({originX = 0, targetX = 0, originY = 0, targetY = 0}) {
    // 初中数学：原点到目标点的距离反方向相等
    let xS = Math.abs(targetX - originX), // x 轴距离
        yS = Math.abs(targetY - originY); // y 轴距离
    return {
        targetX, // 原始x
        reverseX: targetX > originX ? originX - xS : originX + xS, // 翻转x
        targetY, // 原始y
        reverseY: targetY > originY ? originY - yS : originY + yS  // 翻转y       
    }
}

// 工具函数

class Pen {
    constructor({ canvas }) {
        // 画布
        this.canvas = canvas;
        // 绘制图形标记，默认rect代表绘制矩形
        this.drawPicture = 'rect';
        // 标记事件暂停与否
        this.eventStop = false;
        // 初始化
        this.init();
    }
    init() {
        // 绑定事件
        this.bindEvent();
    }

    bindEvent() {
        let canvas = this.canvas;

        canvas.addEventListener('mousedown', (e) => {
            // 因为有些特殊需求，钢笔工具执行时需要阻断画布的down事件，由其本身重写
            if(this.eventStop){
                return;
            }
            // 坐标轴矫正
            let originX = e.clientX - contentLeft,
                originY = e.clientY - contentTop,
                position = { originX, originY };
            // 分支控制
            switch (this.drawPicture) {
                case 'rect':
                    this.rect(position);
                    break;
                case 'circle':
                    this.circle(position);
                    break;
                case 'line':
                    this.line(position);
                    break;
                case 'polyline':
                    this.polyline(position);
                    break;
                case 'text':
                    this.text(position);
                    break;
                case 'path':
                    this.path(position);
                    break;
            }

        }, false);
    }

    // 绘制方形
    rect(posi) {
        // 元对象
        let obj,
            key = [];
        // 只有在移动后才会执行一系列方法, init 方法， 只执行一次
        document.addEventListener('mousemove', init, false);

        // 添加解绑函数
        document.addEventListener('mouseup', unBindEvent, false);
        // 事件绑定
        function init(e) {
            // 移动一段距离才可以绑定
            if (Math.abs(e.clientX - posi.originX) < 2 || Math.abs(e.clientY - posi.originY) < 2) {
                return;
            }

            // obj 初始化
            obj = new Rect(posi);

            // originX originY 为鼠标点击原点坐标
            document.addEventListener('mousemove', move, false);
            // 键盘事件
            document.addEventListener('keydown', keydown, false);
            document.addEventListener('keyup', keyup, false);

            // 解绑当前事件
            document.removeEventListener('mousemove', init, false);
        }

        // 鼠标移动
        function move(e) {
            // 坐标轴矫正
            let targetX = e.clientX - contentLeft,
                targetY = e.clientY - contentTop;
            // 元素状态更新
            obj.update({ targetX, targetY, key });
        }
        // 监听键盘事件，实现辅助绘制
        function keydown(e) {
            if (e.key === 'Control') {
                key[0] = 'ctrl';
            } else if (e.key === 'Shift') {
                key[1] = 'shift';
            }
            // 阻止默认事件
            e.preventDefault();
        }
        // 监听键盘事件，实现辅助绘制
        function keyup(e) {
            if (e.key === 'Control') {
                key[0] = undefined;
            } else if (e.key === 'Shift') {
                key[1] = undefined;
            }
            e.preventDefault();
        }

        function unBindEvent() {
            // 交互完成
            obj && obj.done();
            // 解绑事件
            this.removeEventListener('mousemove', move, false);
            this.removeEventListener('mouseup', unBindEvent, false);
            this.removeEventListener('keydown', keydown, false);
            this.removeEventListener('keyup', keyup, false);
            // 解绑init事件
            this.removeEventListener('mousemove', init, false);
        }
    }
    // 绘制圆形
    circle(posi) {
        // 元对象
        let obj,
            key = [];
        // 初始化
        document.addEventListener('mousemove', init, false);
        // 解绑事件
        document.addEventListener('mouseup', unBindEvent, false);
        // 事件绑定
        function init(e) {
            // 移动一段距离才可以绑定
            if (Math.abs(e.clientX - posi.originX) < 2 || Math.abs(e.clientY - posi.originY) < 2) {
                return;
            }

            // obj 初始化
            obj = new Circle(posi);

            // originX originY 为鼠标点击原点坐标
            document.addEventListener('mousemove', move, false);
            // 键盘事件
            document.addEventListener('keydown', keydown, false);
            document.addEventListener('keyup', keyup, false);

            // 解绑当前事件
            document.removeEventListener('mousemove', init, false);
        }
        // 鼠标移动
        function move(e) {
            // 坐标轴矫正
            let targetX = e.clientX - contentLeft,
                targetY = e.clientY - contentTop;
            // 元素状态更新
            obj.update({ targetX, targetY, key });
        }
        // 监听键盘事件，实现辅助绘制
        function keydown(e) {
            if (e.key === 'Control') {
                key[0] = 'ctrl';
            } else if (e.key === 'Shift') {
                key[1] = 'shift';
            }
            // 阻止默认事件
            e.preventDefault();
        }
        // 监听键盘事件，实现辅助绘制
        function keyup(e) {
            if (e.key === 'Control') {
                key[0] = undefined;
            } else if (e.key === 'Shift') {
                key[1] = undefined;
            }
            e.preventDefault();
        }

        function unBindEvent() {
            // 交互完成
            obj && obj.done();
            // 解绑事件
            this.removeEventListener('mousemove', move, false);
            this.removeEventListener('mouseup', unBindEvent, false);
            this.removeEventListener('keydown', keydown, false);
            this.removeEventListener('keyup', keyup, false);
            // 解绑init事件
            this.removeEventListener('mousemove', init, false);
        }
    }
    // 绘制线段
    line(posi) {
        // 元对象
        let obj,
            key = [];
        // 初始化
        document.addEventListener('mousemove', init, false);
        // 解绑事件
        document.addEventListener('mouseup', unBindEvent, false);
        // 事件绑定
        function init(e) {
            // 移动一段距离才可以绑定
            if (Math.abs(e.clientX - posi.originX) < 2 || Math.abs(e.clientY - posi.originY) < 2) {
                return;
            }

            // obj 初始化
            obj = new Line(posi);

            // originX originY 为鼠标点击原点坐标
            document.addEventListener('mousemove', move, false);
            // 键盘事件
            document.addEventListener('keydown', keydown, false);
            document.addEventListener('keyup', keyup, false);

            // 解绑当前事件
            document.removeEventListener('mousemove', init, false);
        }
        // 鼠标移动
        function move(e) {
            // 坐标轴矫正
            let targetX = e.clientX - contentLeft,
                targetY = e.clientY - contentTop;
            // 元素状态更新
            obj.update({ targetX, targetY, key });
        }
        // 监听键盘事件，实现辅助绘制
        function keydown(e) {
            // 因为不管按多少个键，也只有一个键会起作用所以都存在[0]中
            if (e.key === 'Control') {
                key[0] = 'ctrl';
            } else if (e.key === 'Shift') {
                key[0] = 'shift';
            } else if (e.key === 'Alt') {
                key[0] = 'alt';
            }
            // 阻止默认事件
            e.preventDefault();
        }
        // 监听键盘事件，实现辅助绘制
        function keyup(e) {
            if (e.key === 'Control' || e.key === 'Shift' || e.key === 'Alt') {
                key[0] = undefined;
            }
            e.preventDefault();
        }

        function unBindEvent() {
            // 交互完成
            obj && obj.done();
            // 解绑事件
            this.removeEventListener('mousemove', move, false);
            this.removeEventListener('mouseup', unBindEvent, false);
            this.removeEventListener('keydown', keydown, false);
            this.removeEventListener('keyup', keyup, false);
            // 解绑inti事件
            this.removeEventListener('mousemove', init, false);
        }
    }
    // 绘制线条
    polyline(posi) {
        // 元对象
        let obj;

        // 初始化
        document.addEventListener('mousemove', init, false);
        // 解绑事件
        document.addEventListener('mouseup', unBindEvent, false);

        // 事件绑定
        function init(e) {
            // 移动一段距离才可以绑定
            if (Math.abs(e.clientX - posi.originX) < 2 || Math.abs(e.clientY - posi.originY) < 2) {
                return;
            }

            // obj 初始化
            obj = new Polyline(posi);

            // originX originY 为鼠标点击原点坐标
            document.addEventListener('mousemove', move, false);

            // 解绑当前事件
            document.removeEventListener('mousemove', init, false);
        }
        // 鼠标移动
        function move(e) {
            // 坐标轴矫正
            let targetX = e.clientX - contentLeft,
                targetY = e.clientY - contentTop;
            // 元素状态更新
            obj.update({ targetX, targetY });
        }
        // 解绑函数
        function unBindEvent() {
            // 交互完成
            obj && obj.done();
            // 解绑事件
            this.removeEventListener('mousemove', move, false);
            this.removeEventListener('mouseup', unBindEvent, false);
            // 初始化函数解绑
            this.removeEventListener('mousemove', init, false);
        }
    }
    // 绘制文字
    text(posi) {
        // 元对象
        let obj = window.obj = new Text(posi);
        
    }
    // 绘制路径（包含贝塞尔曲线）
    path(posi) {
        // 元对象
        let obj = new Path(posi),
            self = this,
            x1 = posi.originX, // 默认起点控制点X
            y1 = posi.originY, // 默认起点控制点Y
            x, y, x2, y2;
        
        // 让父元素的 down 事件暂停执行， 暂停到 当前线段绘制完毕
        this.eventStop = true;
        
        // 决定下一条线的开始点
        document.addEventListener('mousedown', down, false);
        // 决定当前线的两个控制点
        document.addEventListener('mousemove', move, false);

        // 监听键盘事件
        document.addEventListener('keydown', unBindEvent, false);

        function move(e) {
            // 终点 终点控制点和终点默认同步
            x2 = x = e.clientX - contentLeft,
            y2 = y = e.clientY - contentTop;
            // 更新元素
            obj.update({x1, y1, x2, y2, x, y});
        }
        // 鼠标点击
        function down(e) {
            x = e.clientX - contentLeft,
            y = e.clientY - contentTop;
            // 重点来了
            document.onmousemove = function(e) {
                let reverseX, reverseY;
                x2 = e.clientX - contentLeft,
                y2 = e.clientY - contentTop;
                // 介于主流用户操作习惯，x2和y2 要翻转
                ({reverseX, reverseY} = coordinateReverse({originX: x, originY: y, targetX: x2, targetY: y2}));
                
                // 更新元素
                obj.update({x1, y1, x2: reverseX, y2: reverseY, x, y});
                // 外界的move 函数停止触发
                document.removeEventListener('mousemove', move, false);
            }
            document.onmouseup = function(e) {
                x1 = e.clientX - contentLeft;
                y1 = e.clientY - contentTop;
                // 每一次点击都是结束，也是开始
                obj.addNode();
                // 解绑事件
                document.onmousemove = null;
                document.onmouseup = null;
                // 重新绑定
                document.addEventListener('mousemove', move, false);
            }
        }
        // 解绑函数
        function unBindEvent(e) {
            // 按下回车
            if(e.key === 'Enter'){
                self.eventStop = false; // 事件监听恢复
                // 交互完成
                obj.done();
                // 将最后一条数据信息删除
                // obj.d.shift();
                // 解绑事件
                this.removeEventListener('mousedown', down, false);
                this.removeEventListener('mousemove', move, false);
                this.removeEventListener('keydown', this.unBindEvent, false);
            }
        }
        
    }

}

// 父类
class Shapes {
    constructor({ originX, originY }) {
        // 鼠标点击位置， 在传入的时候已经进行过坐标轴矫正 (x, y)
        this.originX = originX;
        this.originY = originY;
        // 元素状态 interactive 代表元素交互中（鼠标未抬起，还未确定元素最终状态） complete 代表交互完成（可以进行辅助节点绘制）
        this.status = 'interactive';
    }
}

// 矩形绘制
class Rect extends Shapes {
    constructor({ originX, originY }) {
        super({ originX, originY });
        // x点，y点
        this.x = originX;
        this.y = originY;
        // 宽高
        this.width = 0;
        this.height = 0;
        // 初始化
        this.init();
    }

    init() {
        // 元素
        this.el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        // 插入元素 content 为内置， 其代表svg画布中实际可视区, 为什么不直接用appendChild呢，主要是为了练习新的DOM api
        content.insertAdjacentElement('beforeend', this.el);

    }
    update({ targetX, targetY, key }) {
        // update 系列方法一般只控制数据， 这种需要监听特殊key值的update函数为分流器

        // key 为用户按键触发， 当key符合条件时，需要用不同的方式计算数据
        if (key.includes('shift') && !key.includes('ctrl')) { // 按下shift 键， 但并未按下ctrl
            this.updateShift({ targetX, targetY });
        } else if (key.includes('shift') && key.includes('ctrl')) { // 按下shift + ctrl
            this.updateShiftCtrl({ targetX, targetY });
        } else { // 默认情况
            this.updateDefault({ targetX, targetY });
        }

        // 数据更新完后渲染
        this.render();
    }
    // 默认渲染方式
    updateDefault({ targetX, targetY }) {
        // x
        if (this.originX - targetX <= 0) { // 移动方向在右侧
            this.x = this.originX;
        } else { // 移动方向在左侧
            this.x = targetX;
        }
        // y
        if (this.originY - targetY >= 0) { // 移动方向在上
            this.y = targetY;
        } else { // 移动方向在下
            this.y = this.originY;
        }

        this.width = Math.abs(this.originX - targetX);
        this.height = Math.abs(this.originY - targetY);
    }
    // 用户按住shift键，需要绘制正方形
    updateShift({ targetX, targetY }) {
        // a² + b² = c² 
        let c = Math.sqrt(Math.abs(targetX - this.originX) ** 2 + Math.abs(targetY - this.originY) ** 2);

        this.width = c;
        this.height = c;
    }
    // 用户按住shift + ctrl， 需要绘制正方形 并且以原点为正方形中心
    updateShiftCtrl({ targetX, targetY }) {
        // a² + b² = c² 
        let c = Math.sqrt(Math.abs(targetX - this.originX) ** 2 + Math.abs(targetY - this.originY) ** 2);
        // 大小放大了两倍， 所以x，y轴得减去直径c
        this.x = this.originX - c;
        this.y = this.originY - c;

        this.width = c * 2;
        this.height = c * 2;
    }
    render() {
        // render 尽量只控制视图
        let el = this.el,
            // 我的宝贝键盘啊....
            setAttr = el.setAttribute.bind(el);

        setAttr('x', this.x);
        setAttr('y', this.y);
        setAttr('width', this.width);
        setAttr('height', this.height);
    }
    // 结束绘制
    done() {
        // TO DO...
        this.status = 'complete';
    }
}

// 圆形绘制
class Circle extends Shapes {
    constructor({ originX, originY }) {
        super({ originX, originY });
        // cx, cy, rx, ry
        this.cx = originX;
        this.cy = originY;
        this.rx = 0;
        this.ry = 0;
        // 初始化
        this.init();
    }
    init() {
        this.el = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        content.insertAdjacentElement('beforeend', this.el);
    }
    update({ targetX, targetY, key }) {
        if (key.includes('shift') && !key.includes('ctrl')) {
            this.updateShift({ targetX, targetY });
        } else if (key.includes('shift') && key.includes('ctrl')) {
            this.updateShiftCtrl({ targetX, targetY });
        } else {
            this.updateDefault({ targetX, targetY });
        }

        // 渲染
        this.render();
    }
    // 默认情况
    updateDefault({ targetX, targetY }) {
        this.cx = this.originX - (this.originX - targetX) / 2;
        this.cy = this.originY - (this.originY - targetY) / 2;

        // x半径 y半径
        this.rx = Math.abs(this.originX - targetX) / 2;
        this.ry = Math.abs(this.originY - targetY) / 2;

    }
    // 用户按住shift键 需要以按下原点位置为中心，绘制圆
    updateShift({ targetX, targetY }) {
        this.rx = Math.abs(this.originX - targetX);
        this.ry = Math.abs(this.originY - targetY);
    }
    // 用户按住shift + ctrl， 需要以按下原点位置为中心，绘制正圆
    updateShiftCtrl({ targetX, targetY }) {
        // 勾股定理
        this.rx = this.ry = Math.sqrt(Math.abs(this.originX - targetX) ** 2 + Math.abs(this.originY - targetY) ** 2);
    }
    render() {
        let el = this.el,
            setAttr = el.setAttribute.bind(el);

        setAttr('cx', this.cx);
        setAttr('cy', this.cy);
        setAttr('rx', this.rx);
        setAttr('ry', this.ry);

    }
    // 结束绘制
    done() {
        // TO DO...
        this.status = 'complete';
    }
}

// 线段绘制
class Line extends Shapes {
    constructor({ originX, originY }) {
        super({ originX, originY });
        // x1, x2, y1, y2
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
        // 初始化
        this.init();
    }
    init() {
        this.el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        content.insertAdjacentElement('beforeend', this.el);
    }
    update({ targetX, targetY, key }) {
        // 分流
        if (key.includes('shift')) {
            this.updateShift({ targetX, targetY });
        } else if (key.includes('ctrl')) {
            this.updateCtrl({ targetX, targetY });
        } else if (key.includes('alt')) {
            this.updateAlt({ targetX, targetY });
        } else {
            this.updateDefault({ targetX, targetY });
        }

        this.render();
    }
    // 默认绘制
    updateDefault({ targetX, targetY }) {
        // first point
        this.x1 = this.originX;
        this.y1 = this.originY;
        // second point
        this.x2 = targetX;
        this.y2 = targetY;
    }
    // 用户按住shift键， 垂直方向不变，延水平方向绘制
    updateShift({ targetX }) {
        this.x2 = targetX;
        this.y2 = this.originY;
    }
    // 用户按住ctrl键， 水平方向不变，延垂直方向绘制
    updateCtrl({ targetX, targetY }) {
        this.y2 = targetY;
        this.x2 = this.originX;
    }
    // 用户按住alt键，只会绘制与中心点呈45°角的线
    updateAlt({ targetX, targetY }) {
        /*
            夹角计算方式
                angle = Math.atan2((cursorY - cy), (cursorX - cx))
            弧度转角度
                angle = angle * (180/Math.PI)
        */
        let n, // 记号 
            r, // 半径
            x2, y2, // 计算的坐标
            angle = Math.atan2((targetY - this.originY), (targetX - this.originX)) * (180 / Math.PI);
        // 角度处理,会出现负数和小数
        if (angle < 0) {
            angle = Math.round(180 + (180 - Math.abs(angle)));
        } else {
            angle = Math.round(angle);
        }
        n = Math.round(angle / 45);
        // 求出半径
        r = Math.sqrt(Math.abs(targetY - this.originY) ** 2 + Math.abs(targetX - this.originX) ** 2);
        // 计算坐标点
        x2 = this.x1 + r * Math.cos(45 * n * Math.PI / 180);
        y2 = this.y1 + r * Math.sin(45 * n * Math.PI / 180);
        // 赋值
        this.x2 = x2;
        this.y2 = y2;
    }
    render() {
        let el = this.el,
            setAttr = el.setAttribute.bind(el);

        setAttr('stroke', '#000');
        setAttr('x1', this.x1);
        setAttr('y1', this.y1);
        setAttr('x2', this.x2);
        setAttr('y2', this.y2);
    }
    // 结束绘制
    done() {
        // TO DO...
        this.status = 'complete';
    }
}

// 线条绘制
class Polyline extends Shapes {
    constructor({ originX, originY }) {
        super({ originX, originY });
        // points, 每一个的坐标点
        this.points = [{
            x: originX,
            y: originY
        }];
        // 初始化
        this.init();
    }

    init() {
        this.el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        content.insertAdjacentElement('beforeend', this.el);
    }
    update({ targetX, targetY }) {
        // 添加坐标点
        this.points.push({
            x: targetX,
            y: targetY
        })

        this.render();
    }
    render() {
        let points = this.points, // 坐标点合集
            len = points.length,
            path = `M${points[0].x},${points[0].y} `, // 初始化指令
            el = this.el,
            setAttr = el.setAttribute.bind(el);

        // 处理path c指令 数据格式不正确的情况， c指令必须有三个点坐标，也就是说该数组长度除开第一个M， 要是3的倍数
        let n = (len - 1) % 3;
        // 指令生成
        points.forEach(function ({ x, y }, index) {
            // M 指令已经初始化完成, 不必再来一遍 index >= this.length - n 是为了防止指令数据格式错误
            if (index === 0 || index >= len - n) {
                return
            }
            // 添加 C 指令
            if (index === 0 && len >= 4) {
                path += 'C';
            }
            path += `${x},${y} `;
        })
        setAttr('stroke', '#000');
        setAttr('fill-opacity', '0');
        setAttr('d', path);
    }
    // 结束绘制
    done() {
        // TO DO...
        this.status = 'complete';
    }
}

// 文字绘制
class Text extends Shapes {
    constructor({ originX, originY }) {
        super({ originX, originY });
        // 原点位置
        this.originX = originX;
        this.originY = originY;
        // 记录当前文本数据
        this.str = '';
        // 存放被拆分的数据 按照回车和换行拆分
        this.strArr = [];
        // 字体大小
        this.fontSize = 16;
        // 初始化
        this.init();
    }

    init() {
        this.el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        content.insertAdjacentElement('beforeend', this.el);
        // 自带元素创建
        this.inputInit();
    }
    // 输入框
    inputInit() {
        let svgText;
        // <p id="svgText" contenteditable="true">nihaoa </p>
        // 创建 p 标签 并添加可编辑属性
        svgText = this.svgText = document.createElement('p');
        svgText.contentEditable = true;
        svgText.id = 'svgText';
        document.body.insertAdjacentElement('beforeend', svgText);
        svgText.style.fontSize = this.fontSize + 'px';
        svgText.style.lineHeight = this.fontSize + 'px';
        svgText.style.left = this.originX + contentLeft + 'px';
        svgText.style.top = this.originY + contentTop - this.fontSize/2 + 'px';
        setTimeout(() => {
            svgText.focus();
        });
        // 当前文本事件监听
        this.inputBindEvent();
    }
    // 输入框事件监听
    inputBindEvent() {
        let svgText = this.svgText;
        svgText.oninput = (e) => {
            this.str = svgText.innerText;
            // 更新
            this.update();
        }
    }
    // 数据修改
    update() {
        // update 需要将数据进行整理和拆分
        let reg = /[\n]+/;
        // 得到被拆分后的数组
        this.strArr = this.str.split(reg);
        // console.log(this.str.split(reg))
        // this.render();
    }
    // 渲染
    render() {
        let el = this.el,
            setAttr = el.setAttribute.bind(el),
            strArr = this.strArr;

        setAttr('x', this.originX);
        setAttr('y', this.originY + this.fontSize);
        setAttr('fontSize', this.fontSize);
        setAttr('stroke-width', 0);


        // 子节点生成
        strArr.forEach((item, index) => {
            let tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan.setAttribute('x', this.originX);
            tspan.setAttribute('y', this.originY + this.fontSize/2 + this.fontSize * index - (index + 1)); // 暂时如此,日后更改
            tspan.innerHTML = item;
            el.appendChild(tspan);
        })
    }
    // 结束绘制
    done() {
        // TO DO...
        this.status = 'complete';

        // 最后渲染
        this.render();
        // 节点清除
        this.svgText.remove();
    }
}

// 曲线绘制
class Path extends Shapes {
    constructor({ originX, originY }) {
        super({ originX, originY });
        // 备份原点
        this.originX = originX;
        this.originY = originY;
        // 存储d属性坐标
        // 数组格式如下：
        // {x1: 起点控制点, y1：起点控制点, x2：终点控制点, y2：终点控制点, x：终点, y：终点}
        this.d = [{}];
        // 记录当前时第几条线, 初始化阶段应该为0, 因为对应数组下标
        this.index = 0;
        // 初始化
        this.init();
    }
    init() {
        this.el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        content.insertAdjacentElement('beforeend', this.el);
    }
    // 将存储d属性数据转为标准svg数据字符格式
    toDStr() {
        let str = `M${this.originX},${this.originY} `;
        // 遍历数组
        this.d.forEach(item => item.x && (str += `C${item.x1},${item.y1} ${item.x2},${item.y2} ${item.x},${item.y} `) );
        return str;
    }
    // 添加新节点（line）
    addNode() {
        // 该语句执行两步操作，1 ++index， 2 将新的数组位赋值一个空对象
        this.d[++this.index] = {};
    }
    // 数据更新, posiData 存放了6个位置数据， 通过line标记当前操纵哪条线
    update(posiData) {
        let d = this.d,
            index = this.index;

        for(let key in posiData){
            // 检测传入参数是否不全
            if(posiData[key] === undefined && key.indexOf('x') >= 0) {
                posiData[key] = posiData['x'];
            }else if(posiData[key] === undefined && key.indexOf('y') >= 0) {
                posiData[key] = posiData['y'];
            }
            // 实际赋值
            d[index][key] = posiData[key];
        }

        // 渲染
        this.render();
    }
    // 视图渲染
    render() {
        let el = this.el,
            setAttr = el.setAttribute.bind(el);
        
        setAttr('d', this.toDStr());
        setAttr('fill-opacity', 0);
        setAttr('stroke', '#000');
    }
    // 结束绘制
    done() {
        // TO DO...
        this.status = 'complete';
    }
}

// 测试中
let pen = new Pen({  
    canvas: wrap
});


// let path = new Path({originX: 92, originY: 140});
// path.update({x1:92, y1:140, x2:178, y2:61, x:228, y: 110});
// path.update({x1:92, y1:140, x2:278, y2:169, x:228, y: 110});
// path.addNode();
// path.update({x1:278, y1:159, x2:373, y2:117, x:332, y:92});

// let path2 = new Path({originX: 92, originY: 140});
// path2.update({x1:92, y1:140, x2:178, y2:61, x:228, y: 110});

// 文字测试
// let text = new Text({originX: 100, originY: 100});
// text.update('我爱你 Clannad !!!')

/*             第二代图形绘制测试 end            */