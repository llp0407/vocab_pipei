import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router
}).$mount('#app')

router.beforeEach((to,from,next)=>{
  if(to.meta.title){
    document.title = to.meta.title
  }
  next()
})

// Vue.directive('abc', {
//   // 当被绑定的元素插入到 DOM 中时……
//   inserted: function (el) {
//     console.log(el)
//   }
// })