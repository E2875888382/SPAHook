import Vue from 'vue'
import App from './App.vue'
import router from './router'
import timeCollect from './utils/TimeCollect';

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')

new timeCollect([
    {
        path: '/one',
        enter() {
            console.log('进入 one 页面的第一个钩子');
        },
        leave() {
            console.log('离开 one 页面的第一个钩子');
        },
        hide() {
            console.log('one 页面隐藏了');
        },
        show() {
            console.log('one 页面显示了');
        }
    },
    {
        path: '/one',
        enter() {
            console.log('进入 one 页面的第二个钩子');
        },
        leave() {
            console.log('离开 one 页面的第二个钩子');
        }
    },
    {
        path: '/two',
        enter() {

        },
        leave() {
            
        },
        hide() {
            console.log('two 页面隐藏了');
        },
        show() {
            console.log('two 页面显示了');
        }
    },
    {
        path: '/three',
        enter() {

        },
        leave() {
            
        }
    }
]);
