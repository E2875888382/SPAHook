import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'index',
        redirect: '/one'
    },
    {
        path: '/one',
        name: 'one',
        component: () => import('../views/one.vue')
    },
    {
        path: '/two',
        name: 'two',
        component: () => import('../views/two.vue')
    },
    {
        path: '/three',
        name: 'three',
        component: () => import('../views/three.vue')
    }
]

const router = new VueRouter({
    routes
})

export default router
