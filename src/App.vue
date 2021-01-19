<template>
  <div id="app">
    <div class="left-nav">
      <leftNavbar></leftNavbar>
    </div>

    <transition name="slide-right">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import leftNavbar from "@/components/leftNavbar";
export default {
  name: "App",
  components: {
    leftNavbar,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
}
/* .left-nav {
  position: fixed;
  left: 20rpx;
  top: 20rpx;
  z-index: 99;
} */
</style>
