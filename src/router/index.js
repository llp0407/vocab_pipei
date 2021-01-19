import Vue from 'vue'
import Router from 'vue-router'
import vocabPipei from '@/pages/vocabPipei'
import makeQRcode from '@/pages/makeQRcode'

Vue.use(Router)

export default new Router({
    routes:[
        {
            path:'/',
            name:'vocabPipei',
            component:vocabPipei,
            meta:{
                title:'释义匹配'
            }
        },
        {
            path:'/makeQRcode',
            name:'makeQRcode',
            component:makeQRcode,
            meta:{
                title:'小程序码打印'
            }
        }
    ]
})