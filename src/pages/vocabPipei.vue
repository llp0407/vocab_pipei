<template>
  <div>
    <div class="head">
      <div style="width: 200px">
        <van-button color="#7232dd" @click="prev" size="large" :disabled="curIndex==0">prev</van-button>
      </div>
      <h1>词汇释义匹配</h1>
      <div class="ch_list">
        <div v-for="(item, index) in problem.ch_list" :key="index">
          {{ item }}
        </div>
      </div>
      <div style="width: 200px">
        <van-button color="#7232dd" @click="next" size="large">next</van-button>
        <div style="height:20px;"></div>
        <van-button color="#719966" @click="skip" size="large">跳过</van-button>
      </div>
      <div style="margin-left:30px;font-size:32px;">
        {{ok_count}}/{{sum_count}}
      </div>
    </div>
    <div class="content">
      <div class="column-item">
        <div
          v-for="(item, index) in problem.context_list"
          :key="index"
          class="item1"
        >
          <div class="item1-row1">
            <div class="item1-title">{{ item.title }}</div>
            <div class="x-icon" @click="delWord(index)">×</div>
          </div>
          <div class="item1-row2">{{ item.word }}</div>
          <div class="item1-row2" style="text-align: left">
            {{ item.context }}
          </div>
        </div>
      </div>

      <div class="column-item2">
        <div
          v-for="(item, index) in problem.samples_list"
          :key="index"
          class="item2"
        >
          <div class="samples-item-right">
            <div class="samples-name">{{ item.name }} -- {{ item.word }}</div>
            <div
              class="samples-data"
              v-for="(item2, idx2) in item.data"
              :key="idx2"
            >
              <div class="samples-postitle">postitle:{{ item2.postitle }}</div>
              <!-- definition -->
              <div
                class="samples-item-content"
                v-for="(item3, idx3) in item2.list"
                :key="idx3"
                @click="bindDefinition(index, idx2, idx3)"
              >
                <input
                  type="radio"
                  name="language"
                  :value="item"
                  :checked="
                    index == radioIdx[0] &&
                    idx2 == radioIdx[1] &&
                    idx3 == radioIdx[2]
                  "
                />
                <div class="samples-item-title">{{ item3.title }}</div>
                <div style="margin-left: 10px">
                  <van-cell-group
                    v-if="
                      index == radioIdx[0] &&
                      idx2 == radioIdx[1] &&
                      idx3 == radioIdx[2]
                    "
                  >
                    <van-field
                      label="英文释义"
                      placeholder="英文释义"
                      :value="item3.en_text"
                      @input="onEnDef"
                      autosize
                      type="textarea"
                      clickable
                      border
                    />
                  </van-cell-group>
                  <div>{{ item3.html }}</div>
                  <div
                    class="samples-item-em"
                    v-for="(item4, idx4) in item3.em"
                    :key="idx4"
                  >
                    <b>{{ item4 }}</b>
                  </div>

                  <van-cell-group
                    v-if="
                      index == radioIdx[0] &&
                      idx2 == radioIdx[1] &&
                      idx3 == radioIdx[2]
                    "
                  >
                    <van-field
                      label="中文释义"
                      placeholder="中文释义"
                      :value="item3.ch_text"
                      @input="onChineseDef"
                      autosize
                      type="textarea"
                      clickable
                      border
                    />
                  </van-cell-group>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="all-img-box">
      <div v-if="!problem.img_query">
        <h1><van-icon name="success" size="40" /> 已经选好</h1>
        <van-image width="200" :src="problem.img">
          <template v-slot:loading>
            <van-loading type="spinner" size="20" />
          </template>
        </van-image>
      </div>
      <div class="selected-img-box">
        <div
          v-for="(item, idx) in problem.img_list"
          :key="idx"
          :class="['img-box',imgIdx == idx ? 'select-img' : '']"
          @click="bindImg(idx)"
          @dblclick="preview(idx)"
        >
          <van-image
            width="100"
            :src="`http://118.25.12.124:6001/word_img/${item.img}`"
          >
            <template v-slot:loading>
              <van-loading type="spinner" size="20" />
            </template>
          </van-image>
        </div>
      </div>
    </div>

    <div class="dialog" v-if="showPreImg">
      <div class="mask" @click="closeDialog"></div>
      <div class="dialog-content">
        <img class="preimg" :src="`http://118.25.12.124:6001/word_img/${problem.img_list[preImgIdx].img}`" alt="">
      </div>
      <div v-if="preImgIdx!=0" class="previmg-icon" @click="nextImg(-1)"> &lt; </div>
      <div v-if="preImgIdx!=problem.img_list.length-1" class="nextimg-icon" @click="nextImg(1)"> &gt; </div>
    </div>
  </div>
</template>

<script>
import {post} from "../request/http";
// import util from "../util/util";

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

export default {
  name: "vocab-pipei",
  props: {
    msg: String,
  },
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
      list: [],
      problem: {},
      curIndex: -1,
      radioIdx: [],
      imgIdx: 999,
      ok_count:0,
      sum_count:0,
      showPreImg:false,
      preImgIdx:0,

    };
  },
  created() {
    this.getList();
  },
  methods: {
    skip(){
      let obj = {
        context_list: this.problem.context_list,
        samples: this.problem.samples_list,
        img: this.problem.img || '',
        radioIdx: [],
        skip:true,
      };
      post("/api/word_samples_update.test", obj).then((res) => {
        console.log("word_samples_update", res);
        if(this.curIndex == this.list.length-1){
          this.getList();
        }
        else{
          this.curIndex++;
          this.setProblem();
        }
      });
    },
    nextImg(type){
      this.preImgIdx += type
    },
    closeDialog(){
      this.showPreImg = false
      this.imgIdx = this.preImgIdx
    },
    preview(idx){
      this.preImgIdx = idx
      this.showPreImg = true
    },
    setProblem() {
      // this.problem = util.deepClone(this.list[this.curIndex]);
      this.imgIdx = 999;
      this.problem = this.list[this.curIndex]
    },
    delWord(idx) {
      this.problem.context_list.splice(idx, 1);
    },
    bindDefinition(index, idx2, idx3) {
      // console.log(index,idx2,idx3)
      this.radioIdx = [index, idx2, idx3];
    },
    onChineseDef(value) {
      // console.log(e.target.value)
      // let value = e.target.value
      let radioIdx = this.radioIdx;
      this.problem.samples_list[radioIdx[0]].data[radioIdx[1]].list[
        radioIdx[2]
      ].ch_text = value;
    },
    onEnDef(value) {
      let radioIdx = this.radioIdx;
      this.problem.samples_list[radioIdx[0]].data[radioIdx[1]].list[
        radioIdx[2]
      ].en_text = value;
    },
    prev(){
      this.curIndex--;
      this.setProblem();
    },
    next() {
      let radioIdx = this.radioIdx;
      if(radioIdx.length == 0 ){
        Toast('释义没选')
        return false
      }
      let ch_text = this.problem.samples_list[radioIdx[0]].data[radioIdx[1]].list[radioIdx[2]].ch_text
      // console.log(ch_text)
      if(typeof ch_text == 'undefined' || ch_text.replace(/\s+/g, "") == '' ){
        Toast('中文释义没填写')
        return false
      }
      this.word_samples_update();
    },
    word_samples_update() {
      let radioIdx = this.radioIdx;
      let obj = {
        context_list: this.problem.context_list,
        samples: this.problem.samples_list[radioIdx[0]].data[radioIdx[1]],
        img: this.problem.img,
        radioIdx: this.radioIdx,
        skip:false,
      };
      obj.samples['name'] = this.problem.samples_list[radioIdx[0]].name
      obj.samples['word'] = this.problem.samples_list[radioIdx[0]].word
      if (this.problem.img_query) {
        obj.img = this.problem.img_list[this.imgIdx];
      }
      // console.log(obj)
      
      post("/api/word_samples_update.test", obj).then((res) => {
        console.log("word_samples_update", res);
        if(this.curIndex == this.list.length-1){
          this.getList();
        }
        else{
          this.curIndex++;
          this.setProblem();
        }
      });
    },
    bindImg(idx) {
      // console.log(idx)
      if(this.imgIdx == idx){
        this.imgIdx = 999
      }
      else{
        this.imgIdx = idx
      }
    },
    getList() {
      let obj = {
      };
      post("/api/word_samples_query.test", obj).then((res) => {
        console.log("数据", res);
        // this.list = res.list;
        this.radioIdx = [];
        this.imgIdx = 999;
        this.ok_count = res.ok_count
        this.sum_count = res.sum_count
        // this.setProblem();

        this.list = this.list.concat(res.list)
        this.curIndex++;
        this.setProblem();
      });
    },
  },
};
</script>

<style scoped>
.head {
  position: sticky;
  top: 0px;
  background: #fff;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
}
.ch_list {
  margin: 20px;
  font-size: 24px;
}
.content {
  margin-top: 30px;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: flex-start;
}
.column-item,.column-item2 {
  width: 25%;
  height: 60vh;
  overflow-y: scroll;
}
.column-item2 {
  width: 50%;
}
.all-img-box{
  max-width: 95vw;
  overflow-x: scroll;
  margin: 0px auto;
}
.selected-img-box{
  display: flex;
  display: -webkit-flex;
  justify-content: start;
  align-items: center;
}
.item1 {
  padding: 10px;
  margin: 10px;
  border: 1px solid red;
}
.item1-row1 {
  display: flex;
  display: -webkit-flex;
  justify-content: space-between;
  align-items: center;
}
.item1-title {
  width: calc(100% - 40px);
}
.x-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #000;
  cursor: pointer;
  font-size: 36px;
  font-weight: bold;
  text-align: center;
}
.x-icon:hover {
  background: #000;
  color: #fff;
}
.item1-row2 {
  font-size: 28px;
  margin: 15px auto;
  text-align: center;
}
.item2 {
  padding: 10px;
  display: flex;
  display: -webkit-flex;
  justify-content: start;
  align-items: center;
  cursor: pointer;
}
/* .samples-item-right{

} */
.samples-data {
  margin: 20px 10px;
}
.samples-name {
  font-size: 32px;
  color: rgb(0, 0, 132);
}
.samples-postitle {
  font-size: 26px;
  background: rgb(248, 248, 198);
}
.samples-item-content {
  display: flex;
  display: -webkit-flex;
  justify-content: start;
  align-items: flex-start;
  margin: 15px 0px;
  font-size: 20px;
}
.samples-item-title {
  white-space: nowrap;
}
.samples-item-em {
  margin-top: 15px;
}
.img-box{
  padding: 10px;
  box-sizing: border-box;
}
.select-img {
  background: red;
  border: 1px solid red;
}

.dialog{
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
}
.mask{
  position: fixed;
  background: rgba(0, 0, 0, .7);
  width: 100%;
  height: 100%;
  z-index: -1;
}
.dialog-content{
  /* width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0; */
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
}
.preimg{
  height: 80vh;
}
.previmg-icon,.nextimg-icon{
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9;
  width: 100px;
  height: 100px;
  background: #fff;
  border-radius: 50%;
  font-size: 44px;
  text-align: center;
  line-height: 100px;
  cursor: pointer;
}
.previmg-icon{
  left: 100px;
}
.nextimg-icon{
  right: 100px;
}
</style>
