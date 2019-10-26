/**
 * 绘制参考线
 *  关键值:
 *      刻度:
 *          大数值50
 *          小数值10
 *  10进制
 * 
 *  需要实现功能:
 *      x/y轴的绘制
 *      x/y轴的缩放（刻度拉伸）
 *      x/y轴的鼠标位置监听
 *      能告诉外界 当前缩放比值
 *      提供极值提示
 * 
 *  实现思路:
 *      绘制一个静态坐标轴并不难, 处理一点边缘柔化的问题其实就差不多了
 *      根据刻度将当前canvas的宽等分, 获取画布的左侧或上侧距离, 其实就是
 *      坐标轴的原点, 根据原点向两侧循环每隔 该刻度的一个周期, 也就是默认的
 *      -50 0 50 100 150
 *      绘制一条线, 在加上文字即可
 * 
 *      但是一旦涉及动态坐标轴, 响应式处理, 交互事件, 就会变得异常棘手
 *      1 需要监听鼠标移动事件
 *      2 需要不停的在canvas上进行绘制
 *      3 当刻度值变化, 对应的坐标点应根据刻度的大小来进行更新
 * 
*/
{
    let config = {
        get(target, key) {
            return target[key];
        },
        set(target, key, value) {
            target[key] = value;

            if(key === 'isSleep' && value === false){
                // 唤醒
                loop()
            }

            return true;
        }
    }

    // 与外界进行通信的对象 
    const LINEDETAILS = new Proxy({
        // 坐标原点
        originPointX: 240,
        originPointY: 240,
        //画布宽, 因为是等比例缩放, 所以没必要再有一个高 svgWidth应该由外界获取
        svgWidth: 500,
        // 坐标轴是否处于休眠状态
        isSleep: false,
        // 缩放
        zoom() {
            return this.svgWidth / 500;
        },
        // 极值处理
        zoomMax(fn) {

        },
        zoomMin(fn) {

        }
    }, config);

    let canvas = document.getElementById('axis-x'),
        canvas2 = document.getElementById('axis-y'),
        arrX = [],
        arrY = [];
        
    // ReferLineX, ReferLineY的父类, 减少一部分重复代码
    class ReferLine {
        constructor() {
            // 线段缩放
            this.scaleWidth = 10;
            // 默认坐标轴线段长
            this.initialW = 100 * LINEDETAILS.zoom();
        }

        zoom() {
            let zoom = LINEDETAILS.zoom();

            if (zoom >= 1 && zoom < 1.2) {
                this.scaleWidth = 10;
            } else if (zoom >= 1.2 && zoom < 1.6) {
                this.scaleWidth = 9;
            } else if (zoom >= 1.6 && zoom < 2) {
                this.scaleWidth = 8;
            } else if (zoom >= 2 && zoom < 2.4) {
                this.scaleWidth = 7;
            } else if (zoom >= 2.4 && zoom < 2.8) {
                this.scaleWidth = 6;
            } else if (zoom >= 2.8 && zoom < 3.2) {
                this.scaleWidth = 5;
            } else if (zoom >= 3.2 && zoom < 3.6) {
                this.scaleWidth = 4;
            } else if (zoom >= 3.6 && zoom < 4) {
                this.scaleWidth = 3;
            } else if (zoom >= 4 && zoom < 4.4) {
                this.scaleWidth = 2;
            } else if (zoom >= 4.4) {
                this.scaleWidth = 1;
            }
        }

        update() {
            let zoom = LINEDETAILS.zoom();
            if (!this.isMove) {
                this.initialW = 100 * zoom;
            }
        }
    }

    class ReferLineX extends ReferLine {
        constructor({ el, n }) {
            super();
            // 元素
            this.el = el;
            // 获取上下文绘图环境
            this.ctx = el.getContext('2d');
            // 以顶点决定两侧值
            this.n = n;
            // 线高
            this.lineHeight = el.height;
            this.isMove = false;
            this.moveX = 0;
        }
        render() {
            // 修改后源码
            let ctx = this.ctx,
                scaleWidth = this.scaleWidth,
                originPointX = LINEDETAILS.originPointX,
                zoom = LINEDETAILS.zoom();
            // 开始路径
            ctx.beginPath();

            // 样式设置
            if (this.n === 0) {
                ctx.fillStyle = ctx.strokeStyle = 'hsl(152, 90%, 50%)';
            } else {
                ctx.fillStyle = ctx.strokeStyle = 'rgb(130, 130, 130)';
            }
            ctx.lineWidth = 0.5;
            ctx.font = '9px 微软雅黑';

            if (!this.isMove) {

                // 缩放 this.n === 0, 目的是为了 减少函数执行没必要的次数
                this.n === 0 && this.zoom();
                // 交换
                // this.scaleWidth = scaleWidth;

                let n = originPointX + this.n * (this.initialW / 10 * scaleWidth);

                // start
                ctx.moveTo(n - 0.5, 0);
                ctx.lineTo(n - 0.5, this.lineHeight);

                // ctx.moveTo(originPointX + this.n * this.initialW - 10 - 0.5, 0);
                // ctx.lineTo(originPointX + this.n * this.initialW - 10 - 0.5, this.lineHeight);
                // console.log(this.initialW)
                for (let i = 1; i <= 5; i++) {

                    // 左侧
                    ctx.moveTo(n - i * scaleWidth * zoom - 0.5, i % 2 === 0 ? this.lineHeight / 1.8 : this.lineHeight / 1.3);
                    ctx.lineTo(n - i * scaleWidth * zoom - 0.5, this.lineHeight);
                    // 右侧
                    ctx.moveTo(n + i * scaleWidth * zoom - 0.5, i % 2 === 0 ? this.lineHeight / 1.8 : this.lineHeight / 1.3);
                    ctx.lineTo(n + i * scaleWidth * zoom - 0.5, this.lineHeight);
                }
                // 绘制
                ctx.stroke();
                // 显示的数值和缩放比有何关系? 0 - 50 zoom:1 || 0 - 10 zoom:?
                ctx.fillText(this.n * scaleWidth * 10, n + 1.5, 9);
                // 关闭路径
                ctx.closePath();
            } else { // 特殊线段, 跟随鼠标移动
                ctx.fillStyle = 'hsl(152, 90%, 50%)';
                ctx.stroke();
                // 绘制三角形
                ctx.beginPath();
                ctx.moveTo(this.moveX, 0);
                ctx.lineTo(this.moveX + 6, 0);
                ctx.lineTo(this.moveX + 3, this.lineHeight / 8);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(this.moveX, this.lineHeight);
                ctx.lineTo(this.moveX + 6, this.lineHeight);
                ctx.lineTo(this.moveX + 3, this.lineHeight - this.lineHeight / 8);
                ctx.fill();

            }

        }
    }

    class ReferLineY extends ReferLine {
        constructor({ el, n }) {
            super();
            // 元素
            this.el = el;
            // 获取上下文绘图环境
            this.ctx = el.getContext('2d');
            // 以顶点决定两侧值
            this.n = n;
            // 线宽
            this.lineWidth = el.width;
            this.isMove = false;
            this.moveY = 0;
        }

        render() {
            // 修改后源码
            let ctx = this.ctx,
                scaleWidth = this.scaleWidth,
                originPointY = LINEDETAILS.originPointY,
                zoom = LINEDETAILS.zoom();

            // 开始路径
            ctx.beginPath();
            // 样式设置
            if (this.n === 0) {
                ctx.fillStyle = ctx.strokeStyle = 'hsl(152, 90%, 50%)';
            } else {
                ctx.fillStyle = ctx.strokeStyle = 'rgb(130, 130, 130)';
            }
            ctx.lineWidth = 0.5;
            ctx.font = '9px 微软雅黑';

            if (!this.isMove) {

                // 缩放
                this.n === 0 && this.zoom();

                // 核心计算公式!!!!!!!
                let n = originPointY + this.n * (this.initialW / 10 * scaleWidth);

                // start
                ctx.moveTo(0, n - 0.5);
                ctx.lineTo(this.lineWidth, n - 0.5);

                for (let i = 1; i <= 5; i++) {

                    // 左侧
                    ctx.moveTo(this.lineWidth, n - i * scaleWidth * zoom - 0.5);
                    ctx.lineTo(i % 2 === 0 ? this.lineWidth / 1.8 : this.lineWidth / 1.3, n - i * scaleWidth * zoom - 0.5);
                    // 右侧
                    ctx.moveTo(this.lineWidth, n + i * scaleWidth * zoom - 0.5);
                    ctx.lineTo(i % 2 === 0 ? this.lineWidth / 1.8 : this.lineWidth / 1.3, n + i * scaleWidth * zoom - 0.5);
                }
                ctx.stroke();
                // 处理文字超出问题
                (this.n * scaleWidth * 10 + '').split('').forEach((item, index) => {
                    ctx.fillText(item, 3, n - 0.5 + 9 * index + 9);
                })
                ctx.closePath();
            } else {
                ctx.fillStyle = 'hsl(152, 90%, 50%)';
                ctx.stroke();
                // 绘制三角形
                ctx.beginPath();
                ctx.moveTo(0, this.moveY - 3);
                ctx.lineTo(0, this.moveY + 3);
                ctx.lineTo(this.lineWidth / 8, this.moveY);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(this.lineWidth, this.moveY - 3);
                ctx.lineTo(this.lineWidth, this.moveY + 3);
                ctx.lineTo(this.lineWidth - this.lineWidth / 8, this.moveY);
                ctx.fill();
            }

        }
    }

    init();
    function init() {

        for (let i = -5; i < 31; i++) {
            arrX[i + 5] = new ReferLineX({
                el: canvas,
                n: i
            });
            arrY[i + 5] = new ReferLineY({
                el: canvas2,
                n: i
            });
        }
        // 光标定位点
        arrX[30].isMove = true;
        arrY[30].isMove = true;

        // 开始绘制
        loop();
    }

    function loop() {
        let ctx = canvas.getContext('2d');
        let ctx2 = canvas2.getContext('2d');
        ctx.clearRect(0, 0, 2000, 2000);
        ctx2.clearRect(0, 0, 2000, 2000);

        arrX.forEach((item, index) => {
            item.render();
            arrY[index] && arrY[index].render();

            if(index === 0){
                // 减少执行
                item.update();
                arrY[index] && arrY[index].update();
            }
        })

        // 后续需要提供可停止条件, 比方说当坐标轴被隐藏时, 当被唤醒时如何再次开始?
        if (!LINEDETAILS.isSleep) {
            requestAnimationFrame(loop);
        }
    }

    // 交互代码
    let flag = false,
        core = document.getElementById('core');
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Control') {
            flag = true;
        }
    })
    document.addEventListener('keyup', () => {
        flag = false
    })
    core.addEventListener('mousewheel', (e) => {
        // 达到最大值, 应该有通知外界
        if (flag) {
            // 上滚动 放大
            if (e.deltaY <= 0) {
                LINEDETAILS.svgWidth += 20;
                // if (LINEDETAILS.svgWidth > 11) { // 极值 - MAX
                //     LINEDETAILS.svgWidth = 11;
                // }
            } else if (e.deltaY > 0) { // 下滚动
                LINEDETAILS.svgWidth -= 20;
                // if (LINEDETAILS.svgWidth < 0.4) { // 极值 - MIN
                //     LINEDETAILS.svgWidth = 0.4;
                // }
            }
        }
        e.preventDefault();
    })

    document.addEventListener('mousemove', (e) => {
        let clientX = e.clientX - 50,
            clientY = e.clientY - 30;

        arrX[30].moveX = clientX;
        arrY[30].moveY = clientY;
    })

    // 暴露成员
    window.LINEDETAILS = LINEDETAILS;
}

window.LINEDETAILS.zoomMax()

window.LINEDETAILS.zoomMin = function(){
    console.log('MIN')
}

/**
 *
 *      修改前源码
        let ctx = this.ctx;
        开启新路径
        ctx.beginPath();
        定义样式
        if(this.origin === originPointX){
            ctx.fillStyle = ctx.strokeStyle = 'hsl(152, 90%, 50%)';
        }else{
            ctx.fillStyle = ctx.strokeStyle = 'rgb(130, 130, 130)';
        }
        ctx.lineWidth = 0.5;
        长线
        移动到(start), 边缘柔化
        ctx.moveTo(this.origin * zoom - 0.5, 0);
        ctx.lineTo(this.origin * zoom - 0.5, this.lineHeight);
        短线 50 / 10  与 1cm = 10mm 一样的单位转换
        for(let i = 1; i <= 5; i ++){
            // i = 1 ? 因为0位已经存在, 就是长线 左右均分
            // 左侧
            ctx.moveTo(this.origin - 0.5 - (scale / scaleMM) * i, i % 2 === 0 ? this.lineHeight / 1.8 : this.lineHeight / 1.3);
            ctx.lineTo(this.origin - 0.5 - (scale / scaleMM) * i, this.lineHeight);
            // 右侧
            ctx.moveTo(this.origin - 0.5 + (scale / scaleMM) * i, i % 2 === 0 ? this.lineHeight / 1.8 : this.lineHeight / 1.3);
            ctx.lineTo(this.origin - 0.5 + (scale / scaleMM) * i, this.lineHeight);
        }
        绘制
        ctx.stroke();

        绘制文字
        ctx.font = '9px 微软雅黑'
        ctx.fillText(this.origin - originPointX, this.origin * zoom + 1.5, 9);



        2019.10.25 21:33
            坐标轴设计基本完成
            余下难点:
                以后可能会开发隐藏坐标轴功能
                隐藏意味着不需要进行鼠标移动监听, canvas绘制, 这个状态应该由谁来给


 */