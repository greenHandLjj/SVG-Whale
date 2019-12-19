/*             第一代图形绘制测试 start            */

let wrap = document.querySelector('#wrap'),
    content = wrap.querySelector('#content'),
    background = wrap.querySelector('#background');

// 父类对象
class Shape{

}

// 矩形
class Rect {
    constructor({el, x, y, width, height} = {}) {
        // 默认填充
        this.fill = 'red';
        // 默认描边
        this.stroke = '#000';
        // 默认描边大小
        this.strokeWidth = 1;
        // rect
        this.rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

        // 可视化操作元素实体
        this.eleG; // g 元素
        this.posiRect; // 可视化位置信息 
        this.sizeRectArr; // 可视化大小信息

        // 用户设置 x, y, width, height
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.el = el;

        // start start start
        this.init();
    }
    // 初始化
    init() {
        // 工作内容，svg元素设置，辅助设置元素生成
        // 1. SVG RECT  设置
        this.elementInit();
        // 2. 虚拟元素  设置
        this.virtualBoxInit();
    }
    elementInit() {
        let rect = this.rect,
            // 函数简化
            setAttr = rect.setAttribute.bind(rect);
        
        setAttr('x', this.x);
        setAttr('y', this.y);
        setAttr('width', this.width);
        setAttr('height', this.height);
        setAttr('fill', this.fill);
        
        // 节点插入
        this.el.appendChild(rect);
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
            for(let i = 0; i < sizeRectArr.length; i ++) {
                for(let j = 0; j < sizeRectArr[i].length; j ++) {
                    if(!sizeRectArr[i][j]) { // null 值
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
    virtualBoxSetPosition(){
        let rect = this.rect, // 实际元素
            posiRect = this.posiRect, // 拖拽改变位置
            sizeRectArr = this.sizeRectArr, // 拖拽改变大小
            {left: l, top: t, width: w, height: h} = rect.getBoundingClientRect(),
            // 暂定
            {left: l1, top: t2} = wrap.getBoundingClientRect();

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
            for(let j = 0; j < sizeRectArr[i].length; j ++){
                if(!sizeRectArr[i][j]){ // null 值处理
                    continue;
                }
                // 计算简化分支
                let newH = h/2;
                let newW = w/2;

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
    // 虚拟元素事件绑定
    virtualBoxBindEvent() {
        /* 元素分布图
            [0,0] [0,1] [0,2]
            [1,0] [1,1] [1,2]
            [2,0] [2,1] [2,2]
        */
        let rect = this.rect, // originX 鼠标按下x， originY 鼠标按下点y
            posiRect = this.posiRect,
            sizeRectArr = this.sizeRectArr,
            x, y, width, height, originX, originY;

        for(let i = 0; i < sizeRectArr.length; i ++) {
            for(let j = 0; j < sizeRectArr[i].length; j ++) {
                if(!sizeRectArr[i][j]) { // null
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
                    if( el.getAttribute('change').indexOf('x') >= 0 || el.getAttribute('change').indexOf('all') >= 0 ) {
                    
                        if(j === 0) { // 第一列的元素
                            // x 越过 width 边界 公式化简 (x - w >= width + x) -> (x - w - x >= width) -> (-w >= width) 
                            if(-w >= width) {
                                // 这一行不是必须的，但是为了防止用户移动过快，导致监听不及时，有必要加上
                                // 将 x 固定
                                rect.setAttribute('x', x + width);
                            }else{ // 普通情况
                                rect.setAttribute('x', x - w);
                            }

                            rect.setAttribute('width', Math.abs(width + w));
                        }else{
                            // width 越过 x 边界 width实际值 < x实际值 x + width <= x
                            if(width - w <= 0) {
                                rect.setAttribute('x', x - (w - width));
                            }else{
                                rect.setAttribute('x', x);
                            }
                            rect.setAttribute('width', Math.abs(width - w));
                        }
                        
                    }

                    if( el.getAttribute('change').indexOf('y') >= 0 || el.getAttribute('change').indexOf('all') >= 0 ) {
                        if(i === 0) { // 位于第一行，对y值的操作
                            // y 越过 height 边界 同理 (y - h >= height + y) -> ....
                            if(-h >= height) {
                                // 这一行不是必须的，但是为了防止用户移动过快，导致监听不及时，有必要加上
                                // 将 y 固定
                                rect.setAttribute('y', y + height);
                            }else{
                                rect.setAttribute('y', y - h);
                            }

                            rect.setAttribute('height', Math.abs(height + h));
                        }else{ // 位于最后一行，对height的操作
                            if(height - h <= 0) {
                                rect.setAttribute('y', y - (h - height));
                            }else{
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
        posiRect.addEventListener('mousedown', function(e) {
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

        // leftCenterEle.addEventListener('mousedown', function(e) {
        //     origin = e.clientX;
        //     x = parseInt(rect.getAttribute('x'));
        //     width = parseInt(rect.getAttribute('width'));

        //     document.addEventListener('mousemove', move, false);
        //     document.addEventListener('mouseup', up, false);
        // })

        // function move(e) {
        //     let target = e.clientX,
        //         s = origin - target; // 路程
            
        //     if(x - s < width + x) { // 左移动
        //         rect.setAttribute('x', x - s);                
        //     }else{ // 右移动
        //         rect.setAttribute('x', x + width);
        //     }
            
        //     rect.setAttribute('width', Math.abs(width + s));
        //     self.virtualBoxSetPosition();
        // }

    }
    // 重置函数， 会将自身的虚拟元素清空，回到初始化前的状态
    reset() {
        // 直接将父节点删除
        this.eleG.remove();
    }
}

// Circle 类
class Circle{
    constructor() {

    }
    init() {

    }
    elementInit() {

    }
}

let resize = () => {
    let width = window.innerWidth,
        height = window.innerHeight;

    background.setAttribute('width', width);
    content.setAttribute('width', width);
    wrap.setAttribute('width', width);

    background.setAttribute('height', height);
    content.setAttribute('height', height);
    wrap.setAttribute('height', height);
}
resize();
window.onresize = resize;


// 假定元素测试
let rect = new Rect({
    // 插入至
    el: content,
    x: 200,
    y: 200,
    width: 200,
    height: 200,
})


/*             第一代图形绘制测试 end            */
