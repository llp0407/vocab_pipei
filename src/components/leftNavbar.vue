<template>
  <div class="left-nav">
    <van-sidebar v-model="activeKey">
      <van-sidebar-item
        v-for="(item, idx) in routerList"
        :key="idx"
        :title="item.meta.title"
        :to="item.path"
      />
    </van-sidebar>
  </div>
</template>

<script>
import { Sidebar, SidebarItem } from "vant";
export default {
  name: "leftNavbar",
  components: {
    [Sidebar.name]: Sidebar,
    [SidebarItem.name]: SidebarItem,
  },
  props:{
    routerList:Array
  },
  data() {
    return {
      activeKey: 0,
      // router: [
      //   {
      //     path: "/",
      //     name: "释义匹配",
      //   },
      //   {
      //     path: "/inspectPipei",
      //     name: "释义匹配检查",
      //   },
      //   {
      //     path: "/makeQRcode",
      //     name: "生成二维码",
      //   },
      // ],
    };
  },
};
</script>

<style>
.left-nav {
  position: sticky;
  top: 10px;
}
</style>
