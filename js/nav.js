/*
    关于header菜单栏的相关脚本
*/

// 导航菜单， 点击出子项
(function () {
    let list = [...document.querySelectorAll('header nav .list')],
        // 上一个被选中的list
        lastList = null,
        // 当点击一个列表项后, 鼠标直接移入其他列表项即可触发下拉菜单
        lock = false,
        getParentEl;

    getParentEl = function(dom, arr = [], cb) {
        let parent = dom.parentElement;
        
        arr.push(dom);

        // 可选回调
        cb && cb(parent);

        if(parent && parent !== document.body){
            getParentEl(parent, arr);
        }
    
        return arr;
    }

    list.forEach(item => {
        item.addEventListener('mousedown', toggleClass);
        item.addEventListener('mouseenter', function (e) {
            // 移入列表项, 只有在没有selected 类名的时候 才能再次进行切换
            if (lock && !e.target.classList.contains('selected')) {
                toggleClass.call(this, e);
            }
            e.stopPropagation();
            e.preventDefault();
        })
    })

    function toggleClass(e) {
        // 上一个被选中的itembox
        let itemBox = this.getElementsByClassName('item-box')[0];
        classList = itemBox.classList;

        // 在点击下一个元素前先将上一个元素样式清除
        if (lastList !== null && lastList !== this) {
            lastList.classList
                .remove('selected');

            lastList.getElementsByClassName('item-box')[0]
                .classList
                .replace('show', 'hide');
        }

        // 如果上一个和当前点击元素相等，并且当前元素需要隐藏 那么也应该禁用鼠标移入事件
        if (lastList === this && !classList.contains('hide')) {
            lock = false;
        } else {
            lock = true;
        }
        // 重新记录上一个被选中元素
        lastList = this;

        // 是否隐藏
        if (classList.contains('hide')) {

            classList.remove('hide');
            classList.add('show');
            this.classList.add('selected');

        } else {

            classList.remove('show');
            classList.add('hide');

            this.classList.remove('selected');
        }


        // e.stopPropagation && e.stopPropagation()

    }

    document.addEventListener('mousedown', function (e) {
        // 重新更改函数， 解决事件冒泡问题
        let arr;
        arr = getParentEl(e.target);

        if (arr.find(item => item.nodeName === 'HEADER')) {
            return;
        }

        if (lastList !== null) {
            lastList.classList
                .remove('selected');

            lastList.getElementsByClassName('item-box')[0]
                .classList
                .replace('show', 'hide');
        }
        lastList = null;
        lock = false;
    })
})();