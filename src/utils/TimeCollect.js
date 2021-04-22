class TimeCollect {
    constructor(pages) {
        this.startTime = Date.now();
        this.pages = pages;
        // 监听路由
        window.history.pushState = this.injectHooks('pushState');
        window.history.replaceState = this.injectHooks('replaceState');
        // 监听页面显示隐藏
        this.initVisibilityWatcher();
    }
    // 兼容的事件监听与解绑, bind === true 时监听，false解绑
    bindEventListener(el, bind, type, fn, useCapture = false) {
        if (bind) {
            if (el.addEventListener) {
                el.addEventListener(type, fn, useCapture);
            } else if (el.attachEvent) {
                el.attachEvent('on' + type, fn);
            } else {
                el['on' + type] = fn;
            }
        } else {
            if (el.removeEventListener) {
                el.removeEventListener(type, fn, useCapture);
            } else if (el.detachEvent) {
                el.detachEvent('on' + type, fn);
            } else {
                el['on' + type] = null;
            }
        }
    }
    initVisibilityWatcher() {
        let hidden, visibilityChange;

        if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
            hidden = 'hidden';
            visibilityChange = 'visibilitychange';
        } else if (typeof document.msHidden !== 'undefined') {
            hidden = 'msHidden';
            visibilityChange = 'msvisibilitychange';
        } else if (typeof document.webkitHidden !== 'undefined') {
            hidden = 'webkitHidden';
            visibilityChange = 'webkitvisibilitychange';
        }
        this.bindEventListener(
            document,
            true,
            visibilityChange,
            ()=> this.notify('visibilityChange', document[hidden], window.location.href)
        );
    }
    injectHooks(event) {
        const originEvent = window.history[event];

        if (!originEvent) return;
        return (...args)=> {
            this.notify(event, args, window.location.href);
            return originEvent.apply(this, args);
        }
    }
    // 获取 path
    getPath(url) {
        const path = url.match(/#(.*)\??/) && url.match(/#(.*)\??/)[1];

        return path ? path.split('?')[0] : '';
    }
    // 获取对应 path 的 type 钩子函数
    getHooks(url, type) {
        const path = this.getPath(url);
        const callbacks = [];

        if (path) {
            const hooks = this.pages.filter(item=> item.path === path);

            for (let hook of hooks) hook[type] && callbacks.push(hook[type]);
        }
        return callbacks;
    }
    // 执行 pages 里面的对应 callbacks
    notify(event, args, lastUrl) {

        if (event === 'pushState' || event === 'replaceState') {
            // 执行 lastUrl 的 leave 钩子
            this.getHooks(lastUrl, 'leave').forEach(cb=> cb());
            // 执行 url 的 enter 钩子
            this.getHooks(args[2], 'enter').forEach(cb=> cb());
            // 输出在 lastUrl 的停留时间
            console.log('在' + lastUrl + '停留了' + (Date.now() - this.startTime) + 'ms');
            // reset time
            this.startTime = Date.now();
        } else if (event === 'visibilityChange') {
            if (args) {
                // 隐藏钩子
                this.getHooks(lastUrl, 'hide').forEach(cb=> cb());
                // 输出在 lastUrl 的停留时间
                console.log('在' + lastUrl + '停留了' + (Date.now() - this.startTime) + 'ms');
            } else {
                // 显示钩子
                this.getHooks(lastUrl, 'show').forEach(cb=> cb());
                // reset time
                this.startTime = Date.now();
            }
        }
    }
}

export default TimeCollect;