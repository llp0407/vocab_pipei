import Vue from 'vue'
import Router from 'vue-router'
import vocabPipei from '@/pages/vocabPipei'
import makeQRcode from '@/pages/makeQRcode'
import inspectPipei from '@/pages/inspectPipei'
import wordSypp from '@/pages/wordSypp'

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
            path:'/inspectPipei',
            name:'inspectPipei',
            component:inspectPipei,
            meta:{
                title:'释义匹配检查'
            }
        },
        {
            path:'/makeQRcode',
            name:'makeQRcode',
            component:makeQRcode,
            meta:{
                title:'生成二维码'
            }
        },
        {
            path:'/wordSypp',
            name:'wordSypp',
            component:wordSypp,
            meta:{
                title:'单词释义匹配'
            }
        }
    ]
})