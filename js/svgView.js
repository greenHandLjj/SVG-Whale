/**
 * 图形和背景视图处理
 * 
*/

let SVGVIEW = {
    // 实际画布宽高
    originWidth: 700,
    originHeight: 450,
    // 虚拟画布宽高
    clientWidth: 700,
    clientHeight: 450,
    // X轴原点
    originPointX: 0,
    // Y轴原点
    originPointY: 0,
    // 控制画布大小函数
    changeSize,
    // 控制画布位置函数
    changePosition,
    getOriginPointX(){ 
        return parseInt(SVGVIEW.originPointX);
    },
    getOriginPointY(){
        return parseInt(SVGVIEW.originPointY);
    }
}

let svgWarp = document.querySelector('#core .canvas .wrap'),
    svgBackground = svgWarp.getElementById("svgBackground"),
    svgContent = svgWarp.getElementById("svgContent");
    

// change size
function changeSize(obj) {
    for(let prop in obj){
        svgBackground.setAttribute(prop, obj[prop]);
        svgContent.setAttribute(prop, obj[prop]);
    }
    if(typeof obj['viewBox'] === 'string'){ // 实际尺寸 LINEDTAILS 为外界通信对象
        SVGVIEW['originWidth'] = obj['width'];
        SVGVIEW['originHeight'] = obj['height'];
    }
    // 对象更新 放大尺寸
    SVGVIEW['clientWidth'] = obj['width'];
    SVGVIEW['clientHeight'] = obj['height'];
    // 位置更新
    changePosition();
}

// change position
function changePosition(posi) {
    let x, y,
        wrapWidth = svgWarp.clientWidth,
        wrapHeight = svgWarp.clientHeight;
        
    // 不传入值的情况
    if(!posi){
        // 居中
        x = (wrapWidth - SVGVIEW.clientWidth) / 2;
        y = (wrapHeight - SVGVIEW.clientHeight) / 2;
    }else if(typeof posi.x === 'number'){ // x轴位置有值
        x = posi.x;
        y = posi.y;
    }

    svgBackground.setAttribute('x', x);
    svgBackground.setAttribute('y', y);
    svgContent.setAttribute('x', x);
    svgContent.setAttribute('y', y);
    // XY轴原点位置更新
    SVGVIEW.originPointX = x;
    SVGVIEW.originPointY = y;
}

function init() {
    // 尺寸初始化
    changeSize({
        width: SVGVIEW.clientWidth,
        height: SVGVIEW.clientHeight,
        viewBox: '0, 0, 700, 450'
    });
}

init();

// 响应式处理, 这个函数会有解绑的需要吗？
window.addEventListener('resize', () => {
    changePosition();
}, false);

window.SVGVIEW = SVGVIEW;
