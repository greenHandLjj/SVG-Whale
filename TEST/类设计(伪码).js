/*
    我也不记得这是第几个版本了

    此处的代码不是为运行环境所编写，它是我经过几个类的关系迭代不断优化的过程
    前期对程序的设计将直接影响到后续代码的编写难易，扩展性，可读性。

    设计思路：
        现实生活中，我们想要画一个东西或写一个东西，通常需要两种媒介，一张纸，一支笔
        一支笔可以在多张纸上进行书写，同时也没有必要为每一张纸专门准备一支笔
    所以，基本类可以开始构建
                        class Pen
            class Canvas
    
    原先的类设计不足的地方：
        前期偷懒，将很多东西写成了内置，比方所画布内置，这造成大问题，切换画布还得改类
        画布放大缩小，缩放比发生变化，具体图形类和pen类的坐标点转换，计算混乱，难以理解
        辅助节点生成，放大缩小后，辅助节点于实际元素并不在同一个坐标系内，导致偏移
        图形类没有统一规范
        ctrl+z功能，撤销操作，因为前期设计不完善，难以实现，我提倡数据和表现分离，ctrl+z修改数据
        问题是，这个数据从何而来，由谁记录，怎么撤销
        未来可能有导入画布功能，如何为这个功能留出扩展代码
*/

class Pen{
    // 选中元素是谁的功能，吸取颜色，又是谁的功能
    // 其实并不一定要是pen，只是现实生活的思维限制了你，pen的目的就是为了绑定一次事件对应所有在画布上的操作，
    // 那么pen这个类，是不是该改名了呢，superPen， bigPen，诶，好像有个网站叫codePen, 这名字不错
    constructor() {
        // 绘制画布，实现tab栏切换功能, 代表当前在哪个画布上绘制，
        this.drawCanvas = 某个Canvas构建出来的实例对象;
        // 如果说绘制图形是笔的功能， 那么选中元素，也是笔的功能吗？，这听上去有点怪怪的，
        // 我们除了基本图形的绘制，可能还会有其他功能（吸取颜色，选择元素，路径选择...），这些功能并不是绘图，那么是不是笔这个类，设计错了呢
        // 或者说光靠笔这一个类，无法实现更多的功能

        /*
            先来梳理一下程序的逻辑，首先构建出了pen，其次构建出了canvas，
            然后光是图形绘制就有好多种，如何区分用户想要做什么呢
            在pen上有这么一个状态，叫做 drawPicture， 代表当前画什么，当通过左侧的菜单栏，选择要画什么图形的时候，它就会修改drawPicture
            的值，假设现在画折线，那么这个值就会被改成 polyline 类似这种的特殊标记，pen上有一个bindEvent函数，在实例被创建的时候，它会被调用
            它会给canvas中的svgWrap 的直系父级，绑定点击事件，因为svgWrap可能会因为关闭画布而被删除，而其父元素不会，而且svgWrap和其父元素大小完全一致
            所以用作监听点击的代表，应该是没有问题
            接下来开始，通过一个switch语句，进入某个匹配的代码块中
                可能是这样
                    case 'polyline':
                            this.polyline();
                            break;
            polyline, 是定义在Pen上的方法，像这样的方法有很多（paht，rect，ellipse...），
            
            它会创建一个全新的类，这个类，就叫Polyline，拿到它的实例后，配合点击，移动，抬起，等事件。修改polyline的数据
                这是最简陋的过程了，实际运行中，我们需要考虑，在绘制图形时，用户缩放了画布，导致原点坐标矫正问题，
                和辅助节点的位置偏移问题。元素插入的问题，10几个辅助节点的事件绑定问题，数据如何统一的问题，在何时告诉polyline应该记录当前状态的问题
                绘制完元素之后，对这个元素如何修改的问题，比方说改个颜色，最麻烦的是改位置坐标，polyline的位置坐标可不是x，y这么简单，它是一组x，y，难道移动的时候
                遍历成白上千的数组元素？或者使用translate， 那这样的话，不是会导致原坐标失真？辅助节点的绘制将添加更多条件，比方说还得检测它有没有应用translate,
                这貌似是polyline的功能，额... I want to 狗带...
        */

    }
}

let canvasParent = 某个元素;

let canvasArr = [
    new Canvas({
        el: canvasParent.children[我现在也不知道是第几个,反正新建画布的时候会创建一个包裹层],
        width: 400,
        height: 400
    })
];

// Pen的超级版本，抽象Pen
class CodePen{
    constructor({el}) {
        // 被监听点击事件的元素
        this.el = el;
        // 延续上一个的功能
        this.drawCanvas = 某个Canvas的实例;
        // 执行什么操作, 比方说画个矩形
        this.do = 'drawPolyline';
        // 标记事件暂停与否, 用于不解绑事件，但是又要阻断事件的操作
        this.eventStop = false;

        // 程序都需要入口函数
        this.init();
    }

    init() {
        this.bindEvent();
    }

    bindEvent() {
        this.el.addEventListener('mousedown', (e) => {
            // 因为有些特殊需求，钢笔工具执行时需要阻断画布的down事件，由其本身重写
            if (this.eventStop) {
                return;
            }

            // 获取当前点击坐标 坐标矫正的工作交给需要用上坐标的程序代码，其余全部相对视口
            let posi = {clientX: originX, clientY: originY} = e;
            // 分支控制
            switch (this.do) {
                case 'drawPolyline':
                    this.drawPolyline(posi);
                    break;
            }

            e.preventDefault();
        }, false);
    }

    // 画折线
    drawPolyline() {
        let el = new Polyline({drawCanvas:this.drawCanvas, posi});

        
    }
}

new CodePen({
    el: canvasParent // 给谁绑定
})

class Canvas{
    constructor() {

        // 3个svg元素
        this.SVGWrap;
        this.SVGContent;
        this.SVGBackground;
    }
}

class Polyline{
    constructor() {
        // 记录历史操作, 用于实现撤销操作，只保存数据
        // 规定哪些操作需要被记录，什么时候记录，
        // 
        this.history = [];
    }
}


