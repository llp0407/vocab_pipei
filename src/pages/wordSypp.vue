<template>
  <div style="flex:1;">
    <div class="jd">{{ ok_count }}/{{ sum_count }}</div>
    <div class="content">
      <div class="word-img">
        <van-image width="500" height="500" :src="wordInfo.pic" fit="contain">
          <template v-slot:loading>
            <van-loading type="spinner" size="20" />
          </template>
        </van-image>
      </div>

      <div class="word">{{ wordInfo.word }}</div>

      <div class="sy-list" @click="handleSy">
        <template v-for="(item, index) in wordInfo.list">
          <div
            v-for="(item2, index2) in item.ch"
            :class="['sy-item', syIdx[0] == index && syIdx[1] == index2? 'sy-item-active' : '']"
            :key="`${index}${index2}`"
            :data-idx="index"
            :data-idx2="index2"
          >
            {{ item.part }} {{ item2 }}
          </div>
        </template>
      </div>

      <div class="btn-box">
        <van-button class="btn-next" color="#7232dd" @click="next" size="large"
          >next</van-button
        >
      </div>
    </div>
  </div>
</template>
<script>
import {
  Button,
  Field,
  CellGroup,
  Image as VanImage,
  Lazyload,
  Loading,
  Icon,
  Toast,
} from "vant";
import { post } from "../request/http";
export default {
  components: {
    [Button.name]: Button,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [VanImage.name]: VanImage,
    [Lazyload.name]: Lazyload,
    [Loading.name]: Loading,
    [Icon.name]: Icon,
  },
  data() {
    return {
      ok_count: 1,
      sum_count: 500,
      syIdx: [0,0],
      wordInfo: {
          list:[
              {ch:[]}
          ]
      },
    };
  },
  created() {
    this.getItem();
  },
  methods: {
    word_explain_update() {
      let obj = {
          word:this.wordInfo.word,    // 单词
        def_ch:`${this.wordInfo.list[this.syIdx[0]].part}${this.wordInfo.list[this.syIdx[0]].ch[this.syIdx[1]]}`,    // 释义
      };
      post("/api/word_explain_update.test", obj).then((res) => {
        console.log("word_explain_update", res);
        if(res.code ==0){
            Toast("ok");
            this.getItem()
        }else{
            Toast(res.code);
        }
      });
    },
    getItem() {
      let obj = {
      };
      post("/api/word_explain_query.test", obj).then((res) => {
        console.log("word_explain_query", res);
        if(res.code ==0){
            // Toast("ok");
            this.ok_count = res.ok_count;
            this.sum_count = res.sum_count;
            this.wordInfo = res.data;
            this.syIdx = [0,0]
        }else{
            Toast(res.code);
        }
      });
    },
    handleSy(e) {
      //   console.log(e)
      //   console.log(e.target.dataset.idx)
      let idx = e.target.dataset.idx;
      let idx2 = e.target.dataset.idx2;
      if (idx&&idx2) this.syIdx = [idx,idx2];
    },
    next() {
        this.word_explain_update()
    },
  },
};
</script>

<style scoped>
.jd {
  font-size: 32px;
  text-align: right;
  width: 80%;
  margin-top: 30px;
}
.content {
  display: flex;
  display: -webkit-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.word-img {
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  width: 500px;
  height: 500px;
}
.word {
  font-size: 50px;
  padding: 20px;
}
.sy-list {
  display: flex;
  display: -webkit-flex;
  justify-content: start;
  align-items: center;
  flex-wrap: wrap;
}
.sy-item {
  padding: 10px 20px;
  border: 1px solid rgb(171, 183, 187);
  color: rgb(171, 183, 187);
  border-radius: 10px;
  /* float: left; */
  display: inline-block;
  margin: 10px;
  cursor: pointer;
  font-size: 36px;
}
.sy-item-active {
  background: rgb(42, 215, 42);
  border: 1px solid rgb(42, 215, 42);
  color: #fff;
}
.btn-box {
  width: 80%;
  text-align: right;
}
.btn-next {
  width: 200px;
}
</style>