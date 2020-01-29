/*
    如果您是来试图阅读源码，那么请做好心理准备，本文件中的相关代码都是在其他类中进行单独测试最后再整合到一起
    程序逻辑上会有极大跳跃性

    文件管理脚本
        1. 当打开文件数量为空时，文件名容器隐藏
        2. 新建画布后，相对应的DOM生成，插入页面
        3. 点击关闭按钮，当前绘制画布关闭
*/

let fileWrap, // 最外层父级
    fileContain, // 存放文件名称列表的容器
    canvas, // 当前画布对象
    canvasWrap, // 存放画布的容器
    canvasArr; // 新建的画布数组
    

// 入口函数
init();

function init() {
    // 变量初始化
    fileWrap = document.getElementsByClassName('file-wrap')[0];
    fileContain = document.getElementsByClassName('file')[0];
    canvasWrap = document.getElementsByClassName('canvas')[0];
    canvasArr = [];
    

    // 绑定事件
    bindEvent();
}

// 创建画布
function createCanvas({name = '未命名', width, height} = {}) {
    // 遍历子节点，消除类名
    [...document.getElementsByClassName('file-item')].find((item, index) => {
        if(item.classList.contains('active')) {
            // 取消选中状态
            item.classList.remove('active');
            // 取消指定
            canvasWrap.children[index].classList.remove('top');
            return true;
        }
    });
    // 显示文件导航菜单
    fileWrap.classList.remove('hide');

    // 文件导航列表成员, 每新建一个画布，默认就是激活状态
    let fileItem = `<div class="file-item active">
                        <span>${name}</span>
                        <i class="close iconfont icon-guanbi"></i>
                    </div>`;
    // 画布容器
    let canvasItem = `<div class="canvas-item top"></div>`;
    // 插入节点
    fileContain.insertAdjacentHTML('beforeend', fileItem);
    canvasWrap.insertAdjacentHTML('beforeend', canvasItem);

    canvas = new Canvas({
        el: document.getElementsByClassName('canvas-item')[canvasArr.length], // 选择父元素
        width, // 元素宽
        height, // 元素高
    })
    // 此类在 canvas.js 中负责生成画布同时对画布进行管理
    canvasArr.push(canvas)
}

// 绑定事件
function bindEvent() {
    fileContain.addEventListener('mousedown', function(e) {
        let target = e.target,
            parent = target.parentNode,
            fileItems = [...document.getElementsByClassName('file-item')];
            
        // 如果点击到关闭按钮
        if(target.classList.contains('close')){
            // 清除元素信息
            fileItems.forEach((item, index) => {
                if(item === parent) { // 寻找索引位而已
                    // 判断删除后的结果
                    // 1 没有文件了
                    // 2 还有文件存在，接下来修改对应的值
                    if(fileItems.length === 1) { // 没有文件了
                        canvas = null;
                        // 隐藏文件导航菜单
                        fileWrap.classList.add('hide');
                    }else{
                        let n = index-1;

                        if(n < 0){ // 处理极值
                            n += fileItems.length;
                        }

                        fileItems[n].classList.add('active');
                        canvasWrap.children[n].classList.add('top');
                        canvas = canvasArr[n];
                    }

                    // 节点删除
                    parent.remove();
                    canvasWrap.children[index].remove();
                    // 截取
                    canvasArr.splice(index, 1);
                }
            })
        }else{ // 切换
            
            // 只有点击除本身外的其他元素才生效
            if(!parent.classList.contains('active')){
                
                fileItems.forEach((item, index) => {
                    if(parent === item){ // 添加类名
                        parent.classList.add('active');
                        canvasWrap.children[index].classList.add('top');

                        // 最重要的是
                        canvas = canvasArr[index];
                    }else{
                        item.classList.remove('active');
                        // 取消指定
                        canvasWrap.children[index].classList.remove('top');
                    }
                })

            }
        }
    }, false)
}



/* 画布相关脚本 以下代码是在测试区中提取出来的 操作画布的放大以及移动 */
let keyCode = ''; // 键盘码

// 事件绑定
document.addEventListener('keydown', keydown, false);
document.addEventListener('keyup', keyup, false);
canvasWrap.addEventListener('mousedown', mousedown, false);

// 键盘按下
function keydown(e) {
    // 节流
    if (keyCode !== '') {
        return;
    }
    switch (e.key) {
        case ' ': // 空格
            keyCode = 'Space';
            canvasWrap.style.cursor = 'grab';
            break;
        case 'Alt':
            keyCode = 'Alt';
            e.preventDefault();
            break;
    }

}
// 键盘抬起
function keyup(e) {
    switch (e.key) {
        case ' ': // 空格
        case 'Alt':
        case 'Ctrl':
            keyCode = '';
    }

}

// 鼠标按下准备拖拽
function mousedown(e) {
    // 如果没有按下空格键，不允许拖拽
    if (keyCode !== 'Space' || !canvas) return;

    let originX = e.clientX,
        originY = e.clientY,
        SVGContentX = parseInt(canvas.SVGContent.getAttribute('x')),
        SVGContentY = parseInt(canvas.SVGContent.getAttribute('y'));

    // 拖拽
    canvasWrap.style.cursor = 'grabbing';

    document.onmousemove = function (e) {
        let targetX = e.clientX,
            targetY = e.clientY;

        canvas.setPosi({
            x: SVGContentX + (targetX - originX),
            y: SVGContentY + (targetY - originY)
        })
    }

    document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;

        // 样式恢复
        canvasWrap.style.cursor = 'auto';
    }
}

// alt + 滚动
addWheelListener(canvasWrap, (e) => {
    // 快捷键处理
    if (keyCode !== 'Alt' || !canvas) return;

    // 以任意一点A缩放的基本原理， A为鼠标位置，放大是以原点放大，那么会出现新的点A1, 将A1于A的相差值，重新于元素本身的x,y进行计算，得到新值（建议查看图解）
    let { clientX, clientY } = e, // 获取鼠标点 
        { left: l, top: t } = canvas.SVGContent.getBoundingClientRect(), // 获取元素相对坐标，用于坐标矫正
        x1, y1, x2, y2, n; // n 为扩大倍数

    if (e.deltaY < 0) { // 放大
        n = +(canvas.zoom + 0.06).toFixed(2);
    } else { // 缩小
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

// 屏幕大小改变
window.addEventListener('resize', function(e) {
    if(!canvas) return;
    // 位置修正
    canvas.setPosi();

})


// 创建画布
createCanvas({
    name: 'Whale.svg',
    width: 500,
    height: 500
});

