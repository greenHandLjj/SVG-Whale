{
    let wrap = canvas.SVGWrap,
        content = canvas.SVGContent,
        background = canvas.SVGBackground;

    // 坐标轴矫正准备
    let { left: contentLeft, top: contentTop } = content.getBoundingClientRect();
    let { left: wrapLeft, top: wrapTop } = wrap.getBoundingClientRect();

    // 默认公有装饰属性
    let decorateAttr = {
        fill: 'transparent',    // 填充默认透明
        stroke: '#232323',      // 描边默认黑色
        'stroke-width': 1,      // 描边默认粗细
    }

    // 工具函数

    // 颠倒坐标 传入参数 原点x， 目标的x， 原点y，目标点y
    function coordinateReverse({ originX = 0, targetX = 0, originY = 0, targetY = 0 }) {
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

    // 画笔
    class Pen {
        constructor({ canvas }) {
            // 画布
            this.canvas = canvas;
            // 绘制图形标记，默认rect代表绘制矩形
            this.drawPicture = 'path';
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
                if (this.eventStop) {
                    return;
                }
                // 坐标轴矫正
                let originX = e.clientX - contentLeft,
                    originY = e.clientY - contentTop,
                    position = { originX, originY, clientX: e.clientX, clientY: e.clientY };
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

                e.preventDefault();
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
        // 绘制路径（钢笔工具-贝塞尔曲线）
        path(posi) {
            // 元对象
            let obj = new Path(posi),
                self = this,
                x1 = posi.originX, // 默认起点控制点X
                y1 = posi.originY, // 默认起点控制点Y
                x, y, x2, y2,
                index = 0;

            // 让父元素的 down 事件暂停执行， 暂停到 当前线段绘制完毕
            this.eventStop = true;

            // 决定下一条线的开始点
            document.addEventListener('mousedown', down, false);
            // 决定当前线的两个控制点
            // document.addEventListener('mousemove', move, false);

            // 监听键盘事件
            document.addEventListener('keydown', unBindEvent, false);

            // 鼠标点击
            function down(e) {
                x = e.clientX - contentLeft,
                    y = e.clientY - contentTop;

                if (index > 0) {
                    obj.addNode({ x, y });
                    obj.update({ x, y });
                } else {
                    index++;
                }
                // 每一次点击都是结束，也是开始
                // obj.addNode({x, y});
                // 这行操作，实在是在下无能为力了，才出此下策
                // obj.index --;
                // 重点来了
                document.onmousemove = function (e) {
                    let reverseX, reverseY;
                    x2 = e.clientX - contentLeft,
                        y2 = e.clientY - contentTop;
                    // 介于主流用户操作习惯，x2和y2 要翻转
                    ({ reverseX, reverseY } = coordinateReverse({ originX: x, originY: y, targetX: x2, targetY: y2 }));

                    if (index > 1) {
                        // 更新元素
                        obj.update({ x2: reverseX, y2: reverseY });
                    } else {
                        // 更新起点控制点
                        obj.update({ x1: x2, y1: y2 });
                    }
                    // 外界的move 函数停止触发
                    // document.removeEventListener('mousemove', move, false);
                }
                document.onmouseup = function (e) {
                    x1 = e.clientX - contentLeft;
                    y1 = e.clientY - contentTop;
                    // 增加
                    index = 2;
                    // 解绑事件
                    document.onmousemove = null;
                    document.onmouseup = null;
                    // 重新绑定
                    // document.addEventListener('mousemove', move, false);
                }
            }
            // // 鼠标移动
            // function move(e) {
            //     // 终点 终点控制点和终点默认同步
            //     x2 = x = e.clientX - contentLeft,
            //     y2 = y = e.clientY - contentTop;
            //     // 更新元素
            //     obj.update({x2, y2, x, y});
            // }
            // 解绑函数
            function unBindEvent(e) {
                // 按下回车
                if (e.key === 'Enter') {
                    self.eventStop = false; // 事件监听恢复
                    // 交互完成
                    obj.done();
                    // 解绑事件
                    this.removeEventListener('mousedown', down, false);
                    // this.removeEventListener('mousemove', move, false);
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
            // 装饰属性
            this.decorateAttr = {
                // 扩展运算符, 浅拷贝
                ...decorateAttr
            };
        }
        // 虚拟盒子初始化
        virtualBoxInit() {
            // 元素生成
            this.virtualBoxCreate();
            // 位置更新
            this.virtualBoxSetPosition();
            // 事件绑定
            this.virtualBoxBindEvent();
        }
        // 虚拟元素生成
        virtualBoxCreate() {
            let g = document.createElementNS('http://www.w3.org/2000/svg', 'g'), // 最外层包裹
                posiRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect'), // 虚拟矩形框
                // 1 为占位符
                sizeRectArr = [
                    [1, 1, 1],
                    [1, null, 1],
                    [1, 1, 1]
                ] // 二维数组
            // 对应虚拟元素结构， 分别为左上 中上 右上 左中 右中 左下 中下 右下

            // 虚线框插入
            g.appendChild(posiRect);

            // 可视化拖拽矩形插入
            for (let i = 0; i < sizeRectArr.length; i++) {
                for (let j = 0; j < sizeRectArr[i].length; j++) {
                    if (!sizeRectArr[i][j]) { // null 值
                        continue;
                    }
                    sizeRectArr[i][j] = posiRect.cloneNode();
                    sizeRectArr[i][j].setAttribute('class', `vitual-resize-${i}-${j}`);
                    sizeRectArr[i][j].setAttribute('fill', 'blue');
                    sizeRectArr[i][j].setAttribute('width', 8);
                    sizeRectArr[i][j].setAttribute('height', 8);
                    g.appendChild(sizeRectArr[i][j]);
                }
            }

            // 自定义属性， 为下方绑定事件函数做铺垫 can i change ，共3种值 all/x/y
            sizeRectArr[0][0].setAttribute('change', 'all');
            sizeRectArr[0][1].setAttribute('change', 'y');
            sizeRectArr[0][2].setAttribute('change', 'all');
            sizeRectArr[1][0].setAttribute('change', 'x');
            sizeRectArr[1][2].setAttribute('change', 'x');
            sizeRectArr[2][0].setAttribute('change', 'all');
            sizeRectArr[2][1].setAttribute('change', 'y');
            sizeRectArr[2][2].setAttribute('change', 'all');

            // 暂定
            wrap.appendChild(g);

            // 元素 UI 定义 默认值
            posiRect.setAttribute('fill-opacity', 0);
            posiRect.setAttribute('stroke-dasharray', 4);
            posiRect.setAttribute('stroke-width', 1);
            posiRect.setAttribute('stroke', 'blue');

            // 挂载
            this.eleG = g;
            this.posiRect = posiRect;
            this.sizeRectArr = sizeRectArr;

        }
        // 虚拟元素位置更新
        virtualBoxSetPosition() {
            let rect = this.el, // 实际元素
                posiRect = this.posiRect, // 拖拽改变位置
                sizeRectArr = this.sizeRectArr, // 拖拽改变大小
                { left: l, top: t, width: w, height: h } = rect.getBoundingClientRect(),
                // 暂定
                { left: l1, top: t2 } = wrap.getBoundingClientRect();

            // 值更新
            l -= l1;
            t -= t2;
            // 防止0值出现
            w = w === 0 ? 1 : w;
            h = h === 0 ? 1 : h;

            // 大小位置更新

            posiRect.setAttribute('width', w);
            posiRect.setAttribute('height', h);
            posiRect.setAttribute('x', l);
            posiRect.setAttribute('y', t);

            for (let i = 0; i < sizeRectArr.length; i++) {
                for (let j = 0; j < sizeRectArr[i].length; j++) {
                    if (!sizeRectArr[i][j]) { // null 值处理
                        continue;
                    }
                    // 计算简化分支
                    let newH = h / 2;
                    let newW = w / 2;

                    /*
                    运算如下：
                        y轴分 上中下 三方
                        x轴分 左中右 三方
                        i 循环一圈为 y轴下移
                        j 循环一圈为 x轴右移
                        当 i = 0 时， 定义第一波上矩形， y轴计算为 高度 - 虚拟矩形自身高
                        当 i = 1 时， 定义第二波中矩形， y轴计算为 高度 - 虚拟矩形自身高 + 实际元素高度 / 2
                        当 i = 2 时， 定义第三波下矩形， y轴计算为 高度 - 虚拟矩形自身高 + 实际元素高度
                        关键变量 < 实际元素高度 >
                        x 轴同理
                    */
                    sizeRectArr[i][j].setAttribute('x', l - 4 + newW * j);
                    sizeRectArr[i][j].setAttribute('y', t - 4 + newH * i);
                }
            }

        }
        // 提取公共方法存放至此
        // 填充颜色
        fill(color) {
            this.el.setAttribute('fill', color);
        }
        // 填充透明度
        fillOpacity(n) {
            this.el.setAttribute('fill-opacity', n);
        }
        // 描边颜色
        stroke(color) {
            this.el.setAttribute('stroke', color);
        }
        // 描边透明度
        strokeOpacity(n) {
            this.el.setAttribute('stroke-opacity', n);
        }
        // 描边粗细
        strokeWidth(n) {
            this.el.setAttribute('stroke-width', n);
        }
        // 描边间隔
        strokeDasharray(str) {
            this.el.setAttribute('stroke-dasharray', str);
        }
        // 元素透明度,包含填充和描边
        opacity(n) {
            this.el.setAttribute('opacity', n);
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

            // 可视化操作元素实体
            this.eleG; // g 元素
            this.posiRect; // 可视化位置信息 
            this.sizeRectArr; // 可视化大小信息
        }

        init() {
            // 元素
            this.el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            // 插入元素 content 为内置， 其代表svg画布中实际可视区, 为什么不直接用appendChild呢，主要是为了练习新的DOM api
            content.insertAdjacentElement('beforeend', this.el);

        }
        update({ targetX, targetY, key = [] }) {
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

            // 装饰属性添加
            if (this.status === 'interactive') { // 只有当前处于活跃状态才会动用默认值
                for (let prop in this.decorateAttr) {
                    setAttr(prop, this.decorateAttr[prop]);
                }
            }

        }
        // 结束绘制
        done() {
            // TO DO...
            this.status = 'complete';
        }
        // 虚拟元素事件绑定
        virtualBoxBindEvent() {
            /* 元素分布图
                [0,0] [0,1] [0,2]
                [1,0] [1,1] [1,2]
                [2,0] [2,1] [2,2]
            */
            let rect = this.el, // originX 鼠标按下x， originY 鼠标按下点y
                posiRect = this.posiRect,
                sizeRectArr = this.sizeRectArr,
                x, y, width, height, originX, originY;

            for (let i = 0; i < sizeRectArr.length; i++) {
                for (let j = 0; j < sizeRectArr[i].length; j++) {
                    if (!sizeRectArr[i][j]) { // null
                        continue;
                    }

                    // 事件绑定，因为所有元素的事件都大致相同，仅在具体实现上有所区别
                    sizeRectArr[i][j].addEventListener('mousedown', (e) => {
                        // 初始化变量
                        x = parseInt(rect.getAttribute('x'));
                        y = parseInt(rect.getAttribute('y'));
                        width = parseInt(rect.getAttribute('width'));
                        height = parseInt(rect.getAttribute('height'));
                        originX = e.clientX;
                        originY = e.clientY;

                        document.addEventListener('mousemove', move, false);
                        document.addEventListener('mouseup', up, false);
                    }, false);

                    let move = (e) => {
                        let el = sizeRectArr[i][j],
                            targetX = e.clientX,
                            targetY = e.clientY,
                            w = originX - targetX, // X 轴变化距离
                            h = originY - targetY; // Y 轴变化距离

                        // 不是所有的矩形都可以同时改变宽高，有些只能改变宽度，或高度，需要加限制条件
                        if (el.getAttribute('change').indexOf('x') >= 0 || el.getAttribute('change').indexOf('all') >= 0) {

                            if (j === 0) { // 第一列的元素
                                // x 越过 width 边界 公式化简 (x - w >= width + x) -> (x - w - x >= width) -> (-w >= width) 
                                if (-w >= width) {
                                    // 这一行不是必须的，但是为了防止用户移动过快，导致监听不及时，有必要加上
                                    // 将 x 固定
                                    rect.setAttribute('x', x + width);
                                } else { // 普通情况
                                    rect.setAttribute('x', x - w);
                                }

                                rect.setAttribute('width', Math.abs(width + w));
                            } else {
                                // width 越过 x 边界 width实际值 < x实际值 x + width <= x
                                if (width - w <= 0) {
                                    rect.setAttribute('x', x - (w - width));
                                } else {
                                    rect.setAttribute('x', x);
                                }
                                rect.setAttribute('width', Math.abs(width - w));
                            }

                        }

                        if (el.getAttribute('change').indexOf('y') >= 0 || el.getAttribute('change').indexOf('all') >= 0) {
                            if (i === 0) { // 位于第一行，对y值的操作
                                // y 越过 height 边界 同理 (y - h >= height + y) -> ....
                                if (-h >= height) {
                                    // 这一行不是必须的，但是为了防止用户移动过快，导致监听不及时，有必要加上
                                    // 将 y 固定
                                    rect.setAttribute('y', y + height);
                                } else {
                                    rect.setAttribute('y', y - h);
                                }

                                rect.setAttribute('height', Math.abs(height + h));
                            } else { // 位于最后一行，对height的操作
                                if (height - h <= 0) {
                                    rect.setAttribute('y', y - (h - height));
                                } else {
                                    rect.setAttribute('y', y);
                                }
                                rect.setAttribute('height', Math.abs(height - h));
                            }
                        }

                        // 虚拟元素位置更新
                        this.virtualBoxSetPosition();
                    }

                    let up = () => {
                        document.removeEventListener('mousemove', move, false);
                        document.removeEventListener('mouseup', up, false);
                    }
                }
            }

            // 拖拽改变位置
            let posiOriginX, posiOriginY;
            posiRect.addEventListener('mousedown', function (e) {
                // 初始化
                posiOriginX = e.clientX;
                posiOriginY = e.clientY;
                x = parseInt(rect.getAttribute('x'));
                y = parseInt(rect.getAttribute('y'));

                document.addEventListener('mousemove', posiRectMove, false);
                document.addEventListener('mouseup', posiRectUp, false);
            })
            let posiRectMove = (e) => {
                let targetX = e.clientX,
                    targetY = e.clientY;

                rect.setAttribute('x', x + targetX - posiOriginX);
                rect.setAttribute('y', y + targetY - posiOriginY);

                this.virtualBoxSetPosition();
            }

            let posiRectUp = () => {
                document.removeEventListener('mousemove', posiRectMove, false);
                document.removeEventListener('mouseup', posiRectUp, false);
            }

        }
        // 重置函数， 会将自身的虚拟元素清空，回到初始化前的状态
        reset() {
            // 直接将父节点删除
            this.eleG.remove();
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
        update({ targetX, targetY, key = [] }) {
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

            // 装饰属性添加
            if (this.status === 'interactive') { // 只有当前处于活跃状态才会动用默认值
                for (let prop in this.decorateAttr) {
                    setAttr(prop, this.decorateAttr[prop]);
                }
            }
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
        update({ targetX, targetY, key = [] }) {
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

            setAttr('x1', this.x1);
            setAttr('y1', this.y1);
            setAttr('x2', this.x2);
            setAttr('y2', this.y2);

            // 装饰属性添加
            if (this.status === 'interactive') { // 只有当前处于活跃状态才会动用默认值
                for (let prop in this.decorateAttr) {
                    setAttr(prop, this.decorateAttr[prop]);
                }
            }

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

            setAttr('d', path);

            // 装饰属性添加
            if (this.status === 'interactive') { // 只有当前处于活跃状态才会动用默认值
                for (let prop in this.decorateAttr) {
                    setAttr(prop, this.decorateAttr[prop]);
                }
            }
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
            svgText.style.top = this.originY + contentTop - this.fontSize / 2 + 'px';
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
                tspan.setAttribute('y', this.originY + this.fontSize / 2 + this.fontSize * index - (index + 1)); // 暂时如此,日后更改
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
        constructor({ originX, originY, clientX = originX + contentLeft, clientY = originY + contentTop }) {
            super({ originX, originY });
            // 相对于视口的x,y
            this.clientX = clientX;
            this.clientY = clientY
            // 存储d属性坐标
            // 数组格式如下：
            // {sign: 'C', x1: 起点控制点, y1：起点控制点, x2：终点控制点, y2：终点控制点, x：终点, y：终点}
            this.d = [{ sign: 'M', x: originX, y: originY, x1: originX, y1: originY }];

            /*
                数组格式改变， 将c的起点控制点放置其前一个对象中， 当前对象保存的x1, y1是下一节点的x1, y1
                [
                    {sign: 'M', x: originX, y: originY, x1: originX, y1: originX},
                    {sign: 'C', x: downX, y: downY, x2: moveX, y2: moveX, x1: dragX, y1: dragY},
                    {sign: 'C', x: downX, y: downY, x2: moveX, y2: moveX, x1: dragX, y1: dragY}
                ]
            */

            // 记录当前时第几条线, 初始化阶段应该为1, 因为对应数组下标
            this.index = 0;
            // 记录辅助节点 - controlPoints
            this.controlPoints = [];
            // 记录端点 辅助点 - endPoints
            this.endPoints = [];
            // 辅助节点父容器
            this.assitG;
            // 初始化
            this.init();
        }
        init() {
            // 除了初始化元素外
            this.el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            // 插入画布区
            content.insertAdjacentElement('beforeend', this.el);

            // 还需要一样东西，存放辅助节点
            this.assitG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            // 插入编辑区
            wrap.insertAdjacentElement('beforeend', this.assitG);

            // 控制点 辅助节点初始化
            this.controlPonintInit();
            // 端点 辅助节点初始化
            this.endPointInit();
        }
        // 将存储d属性数据转为标准svg数据字符格式
        toDStr() {
            let str = ''
            // 遍历数组
            this.d.forEach((item, index, arr) => {
                switch (item.sign) {
                    case 'M':
                        str += `M${item.x},${item.y} `;
                        break;
                    case 'C':
                        str += `C${arr[index - 1].x1},${arr[index - 1].y1} ${item.x2},${item.y2} ${item.x},${item.y} `;
                        break;
                }
            });
            return str;
        }
        // 添加新节点（line）
        addNode({ sign = 'C', x, y }) { // 默认添加 C
            // 该语句执行两步操作，1 ++index， 2 将新的数组位赋值一个空对象
            this.d[++this.index] = { sign, x, y };

            // 默认值添加
            if (this.d[this.index].sign === 'C') {
                this.completionC(this.d[this.index]);
            }

            // 每新增一节点，都需要有辅助节点生成
            this.endPointInit();
            // 处于活跃状态中，控制点辅助节点位置更新
            this.controlPointSetPosi(this.index);
        }
        // 数据更新
        update(posi = {}) {
            let d = this.d,
                index = this.index;
            // C 要求有 6个参数 x1,y1 x2,y2 x,y
            for (let [key, value] of Object.entries(posi)) {
                // 属性赋值
                if ((key === 'x1' || key === 'y1') && index !== 0) {
                    d[index - 1][key] = value;
                } else {
                    d[index][key] = value;
                }
            }

            // 更新辅助元素位置信息
            this.controlPointSetPosi(this.index); // 告诉程序需要根据哪条线段的数据进行更新，传入索引值

            // 渲染
            this.render();
        }
        // 补全C 三次贝塞尔的参数
        completionC(obj) {
            // 处理C的属性值缺失
            // 起点控制点缺失， 默认值等于 上一个节点的x，y
            obj.x1 === undefined && (obj.x1 = this.d[this.index].x);
            obj.y1 === undefined && (obj.y1 = this.d[this.index].y);
            // 终点控制点缺失， 默认值等于 当前节点的x，y
            obj.x2 === undefined && (obj.x2 = this.d[this.index].x);
            obj.y2 === undefined && (obj.y2 = this.d[this.index].y);
        }
        // 视图渲染
        render() {
            let el = this.el,
                setAttr = el.setAttribute.bind(el);

            // 属性赋值
            setAttr('d', this.toDStr());

            // 装饰属性添加
            if (this.status === 'interactive') { // 只有当前处于活跃状态才会动用默认值
                for (let prop in this.decorateAttr) {
                    setAttr(prop, this.decorateAttr[prop]);
                }
            }

        }
        // 结束绘制
        done() {
            // TO DO...
            this.status = 'complete';

            // 清空辅助元素
            // controlPoints
            this.controlPoints = [];
            // endPoints
            this.endPoints = [];
            // 清空子元素包括自己
            this.assitG.remove();
        }

        // 端点 辅助节点初始化
        endPointInit(index = this.index) { // pintDesc dPoints: 当前节点对应的数据， index， 索引
            // 节点生成
            this.endPonitCreate(index);
            // 位置更新
            this.endPonitSetPosition(index);
            // 事件绑定
            this.endPointBindEvent(index);
        }
        // 端点 的辅助 - 节点生成
        endPonitCreate(index) {
            // 端点
            let elNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

            // 自定义属性
            elNode.setAttribute('data-index', index);

            // 样式设置
            elNode.setAttribute('fill', '#fff');
            elNode.setAttribute('stroke', 'blue');
            elNode.setAttribute('r', '4');
            // 节点插入
            this.assitG.appendChild(elNode);

            // 数据插入
            this.endPoints.push(elNode);
        }
        // 端点 的辅助节点 - 位置更新
        endPonitSetPosition(index) {
            let endPoint, // 存放辅助元素的对象
                dValue = (contentLeft - wrapLeft); // 提前计算好的坐标差值

            // 赋值
            endPoint = this.endPoints[index];

            endPoint.setAttribute('cx', this.d[index].x + dValue);
            endPoint.setAttribute('cy', this.d[index].y + dValue);

        }
        // 绑定事件
        endPointBindEvent(index) {
            let endPoint = this.endPoints[index],
                d = this.d[index],
                x1DB, // x 和 x1 的差值
                y1DB, // y 和 y1 的差值
                x2DB, y2DB, // x2 和 x的差值 y2 和 y的差值
                targetX, targetY;

            endPoint.addEventListener('mousedown', (e) => {
                // 差值计算
                x1DB = d.x - d.x1;
                y1DB = d.y - d.y1;
                if (d.sign === 'C') { // 当前属性存在
                    x2DB = d.x - d.x2;
                    y2DB = d.y - d.y2;
                }

                document.onmousemove = (e) => {
                    targetX = e.clientX - contentLeft;
                    targetY = e.clientY - contentTop;

                    // 数据更新
                    d.x = targetX;
                    d.y = targetY;
                    d.x1 = targetX - x1DB;
                    d.y1 = targetY - y1DB;
                    if (d.sign === 'C') {
                        d.x2 = targetX - x2DB;
                        d.y2 = targetY - y2DB;
                    }

                    // 控制点位置更新
                    this.controlPointSetPosi(index);
                    // 当前元素位置更新
                    this.endPonitSetPosition(index);
                    // 贝塞尔曲线更新
                    this.render();

                    e.preventDefault();
                }

                document.onmouseup = () => {
                    // 解绑事件
                    document.onmouseup = null;
                    document.onmousemove = null;
                }

                // 阻止冒泡
                e.stopPropagation();
            }, false);
        }

        // 控制点 辅助节点初始化
        controlPonintInit(index) {
            // 元素创建
            this.controlPointCreate();
            // 位置设置
            this.controlPointSetPosi(index);
            // 事件绑定
            this.controlPointBindEvent();
        }
        // 控制点 元素创建
        controlPointCreate() {
            let startControl = document.createElementNS('http://www.w3.org/2000/svg', 'circle'), // 起点控制点
                endControl = startControl.cloneNode(), // 终点控制点
                polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline') // 折线

            // 方框样式设置
            startControl.setAttribute('fill', '#fff');
            startControl.setAttribute('stroke', 'blue');
            startControl.setAttribute('r', '4');
            endControl.setAttribute('fill', '#fff');
            endControl.setAttribute('stroke', 'blue');
            endControl.setAttribute('r', '4');
            // 折线样式
            polyline.setAttribute('fill', 'transparent');
            polyline.setAttribute('stroke', 'blue');

            // 节点插入
            this.assitG.appendChild(polyline);
            this.assitG.appendChild(startControl);
            this.assitG.appendChild(endControl);

            // 数据插入
            this.controlPoints.push({
                startControl,
                endControl,
                polyline
            });

        }
        // 控制点 位置更新
        controlPointSetPosi(index = 0) {
            let points = '', // polyline points 属性值
                d = this.d,
                dO = d[index], // 读取对象
                eleNodes = this.controlPoints[0], // 需操控元素
                dValue = (contentLeft - wrapLeft), // 提前计算好的坐标差值
                reverseX, reverseY; // 翻转坐标

            if (dO.sign === 'C') {
                // 终点控制点
                eleNodes.endControl.setAttribute('cx', dO.x2 + dValue);
                eleNodes.endControl.setAttribute('cy', dO.y2 + dValue);

                // 如果起点控制点和x，y相同， 则将x2，y2反转
                if (dO.x1 === dO.x && dO.y === dO.y1) {
                    ({ reverseX, reverseY } = coordinateReverse({ originX: dO.x + dValue, originY: dO.y + dValue, targetX: dO.x2 + dValue, targetY: dO.y2 + dValue })); // 翻转坐标
                    // 起点控制点
                    eleNodes.startControl.setAttribute('cx', reverseX);
                    eleNodes.startControl.setAttribute('cy', reverseY);
                } else {
                    // 重新利用
                    reverseX = dO.x1;
                    reverseY = dO.y1;
                    // 起点控制点
                    eleNodes.startControl.setAttribute('cx', dO.x1);
                    eleNodes.startControl.setAttribute('cy', dO.y1);
                }


                // points 赋值 +4 是为了对齐
                points = `${reverseX},${reverseY} ${dO.x + dValue},${dO.y + dValue} ${dO.x2 + dValue},${dO.y2 + dValue}`;
            } else {
                eleNodes.endControl.setAttribute('cx', dO.x1 + dValue);
                eleNodes.endControl.setAttribute('cy', dO.y1 + dValue);

                ({ reverseX, reverseY } = coordinateReverse({ originX: dO.x + dValue, originY: dO.y + dValue, targetX: dO.x1 + dValue, targetY: dO.y1 + dValue })); // 翻转坐标

                // 起点控制点
                eleNodes.startControl.setAttribute('cx', reverseX);
                eleNodes.startControl.setAttribute('cy', reverseY);
                // sign 为 M 时
                points = `${dO.x1 + dValue},${dO.y1 + dValue} ${dO.x + dValue},${dO.y + dValue} ${reverseX},${reverseY}`;
            }

            // 当前元素能修改的控制点 对应this.d 的下标
            eleNodes.startControl.setAttribute('data-change-index', index);
            eleNodes.endControl.setAttribute('data-change-index', index);

            // 折线
            eleNodes.polyline.setAttribute('points', points);

        }
        // 控制点 事件绑定
        controlPointBindEvent() {
            let { startControl, endControl } = this.controlPoints[0],
                index, // 修改数组的索引位
                targetX, targetY, // 新的控制点坐标
                d = this.d; // d 属性拷贝

            // 修改终点控制点
            endControl.onmousedown = (e) => {
                index = endControl.getAttribute('data-change-index')

                document.onmousemove = (e) => {
                    targetX = e.clientX - contentLeft;
                    targetY = e.clientY - contentTop;

                    // d 属性更新
                    d[index].x2 = targetX;
                    d[index].y2 = targetY;

                    // 控制点位置更新
                    this.controlPointSetPosi(index);
                    // 视图重绘
                    this.render();
                }

                // 事件解绑
                document.onmouseup = () => {
                    document.onmousemove = document.onmouseup = null;
                }
                e.stopPropagation();
            }

            // 修改起点控制点
            startControl.onmousedown = (e) => {
                index = startControl.getAttribute('data-change-index');

                document.onmousemove = (e) => {
                    targetX = e.clientX - contentLeft;
                    targetY = e.clientY - contentTop;

                    // d 属性更新
                    d[index].x1 = targetX;
                    d[index].y1 = targetY;

                    // 控制点位置更新
                    this.controlPointSetPosi(index);
                    // 视图重绘
                    this.render();
                }

                // 事件解绑
                document.onmouseup = () => {
                    document.onmousemove = document.onmouseup = null;
                }
                e.stopPropagation();
            }


        }

    }


    window.Pen = Pen;
}