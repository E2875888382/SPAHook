const events = Object.freeze({
    pushState: 'pushState',
    replaceState: 'replaceState',
    visibilityChange: 'visibilityChange',
    hashchange: 'hashchange'
});
const injectHooks = Symbol('injectHooks');
const getHooks = Symbol('getHooks');
const initVisibilityWatcher = Symbol('initVisibilityWatcher');
const notify = Symbol('notify');

function bindEventListener(el, bind, type, fn, useCapture = false) {
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
function getPath(url) {
    const match = url.match(/#(.*)\??/);
    const path = match && match[1];

    return path ? path.split('?')[0] : '';
}
class TimeCollect {
    constructor({pages = [], stay = ()=> {}, hashchange = ()=> {}}) {
        this.startTime = Date.now();
        this.pages = pages;
        this.stay = stay;
        this.hashchange = hashchange;
        this.stop = false;
        window.history.pushState = this[injectHooks](events.pushState);
        window.history.replaceState = this[injectHooks](events.replaceState);
        this[initVisibilityWatcher]();
        bindEventListener(window, true, events.hashchange, this[notify].bind(this), false);
    }
    [initVisibilityWatcher]() {
        let hidden, visibilityChange;

        // Opera 12.10 and Firefox 18 and later support
        if (typeof document.hidden !== 'undefined') { 
            hidden = 'hidden';
            visibilityChange = 'visibilitychange';
        } else if (typeof document.msHidden !== 'undefined') {
            hidden = 'msHidden';
            visibilityChange = 'msvisibilitychange';
        } else if (typeof document.webkitHidden !== 'undefined') {
            hidden = 'webkitHidden';
            visibilityChange = 'webkitvisibilitychange';
        }
        bindEventListener(
            document,
            true,
            visibilityChange,
            ()=> this[notify](events.visibilityChange, document[hidden], window.location.href)
        );
    }
    [injectHooks](event) {
        const originEvent = window.history[event];

        if (!originEvent) return;
        return (...args)=> {
            this[notify](event, args, window.location.href);
            return originEvent.apply(this, args);
        }
    }
    [getHooks](url, type) {
        const path = getPath(url);
        const callbacks = [];

        if (path) {
            const hooks = this.pages.filter(item=> item.path === path);

            for (let hook of hooks) hook[type] && callbacks.push(hook[type]);
        }
        return callbacks;
    }
    [notify](event, args, lastUrl) {
        if (this.stop) return;
        if (event === events.pushState || event === events.replaceState) {
            this[getHooks](lastUrl, 'leave').forEach(cb=> cb()); // 执行 lastUrl 的 leave 钩子
            this[getHooks](args[2], 'enter').forEach(cb=> cb()); // 执行 url 的 enter 钩子
            this.stay(lastUrl, (Date.now() - this.startTime)); // 执行在 lastUrl 的停留时间钩子
            this.startTime = Date.now(); // reset time
        } else if (event === events.visibilityChange) {
            if (args) {
                this[getHooks](lastUrl, 'hide').forEach(cb=> cb()); // 执行 lastUrl 的 hide 钩子
                this.stay(lastUrl, (Date.now() - this.startTime)); // 执行在 lastUrl 的停留时间钩子
            } else {
                this[getHooks](lastUrl, 'show').forEach(cb=> cb()); // 执行 lastUrl 的 show 钩子
                this.startTime = Date.now(); // reset time
            }
        } else if (event.type && event.type === events.hashchange) {
            this.hashchange(event.newURL, event.oldURL);
        }
    }
    stopNotify(fn) {
        this.stop = true;
        if (fn && typeof fn === 'function') fn();
    }
    resetNotify(fn) {
        this.stop = false;
        if (fn && typeof fn === 'function') fn();
    }
    addPageConfig(pageConfig) {
        if (!pageConfig) {
            throw new TypeError('addPageConfig method need a config param');
        }
        if (typeof pageConfig !== 'object' || pageConfig === null) {
            throw new TypeError(`${pageConfig} is not a config object`);
        }
        this.pages.push(pageConfig);
    }
}

export default TimeCollect;