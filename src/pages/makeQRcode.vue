<template>
  <div >
    <div class="content">
      <canvas
        id="c"
        style="border: 1px solid red"
        width="1190"
        height="1648"
      ></canvas>
      <div class="control-box">
        <div class="range-box" @click="bindRange">
          <div :class="['range-item',idx==rangeIdx1?'active-range':'']" v-for="(item,idx) in rangeList" :key="idx" :data-idx="idx" data-clicktype='0'>
            {{item.name}}
          </div>
        </div>
        <div class="range-box" @click="bindRange">
          <div :class="['range-item',idx==rangeIdx2?'active-range':'']" v-for="(item,idx) in rangeList[rangeIdx1].list" :key="idx" :data-idx="idx" data-clicktype='1'>
            {{item.name}}
          </div>
        </div>
        <div class="region-box">
          min:{{rangeList[rangeIdx1].list[rangeIdx2].region.min}}~~max:{{rangeList[rangeIdx1].list[rangeIdx2].region.max}}
        </div>
        <div class="range-box" @click="bindRange">
          <input class="region-ipt" type="text" :value="rangeList[rangeIdx1].list[rangeIdx2].region.min" ref="min">
          <div >
            ~~
          </div>
          <input class="region-ipt" type="text" :value="rangeList[rangeIdx1].list[rangeIdx2].region.max" ref="max">
        </div>

        <div style="margin-top:20px;">
          <van-button color="#7232dd" @click="pushResult" size="large">确定</van-button>
        </div>
        
        <div class="region-box" >
          <div class="range-box" v-for="(item,idx) in resultList" :key="idx">
            <div class="x-icon" @click="delRegion(idx)">×</div>
            <div class="region-text">{{item.r1}}:{{item.r2}}:{{item.min}}~{{item.max}}</div>
          </div>
        </div>

        <div class="region-box" >
          <van-cell-group>
            <van-field
              label="每小格宽度"
              placeholder="每小格宽度"
              v-model="itemWidth"
              autosize
              type="text"
              clickable
              border
            />
          </van-cell-group>
          <van-cell-group>
            <van-field
              label="每小格高度"
              placeholder="每小格高度"
              v-model="itemHeight"
              autosize
              type="text"
              clickable
              border
            />
          </van-cell-group>
          <van-cell-group>
            <van-field
              label="每小格下移"
              placeholder="每小格下移"
              v-model="wholeTop"
              autosize
              type="text"
              clickable
              border
            />
          </van-cell-group>
          <van-cell-group>
            <van-field
              label="每小格右移"
              placeholder="每小格右移"
              v-model="wholeLeft"
              autosize
              type="text"
              clickable
              border
            />
          </van-cell-group>
          <van-cell center title="确认入库">
            <template #right-icon>
              <van-switch v-model="isRuku" size="24" />
            </template>
          </van-cell>
          <div style="margin-top:20px;">
            <van-button color="#7232dd" @click="book_qrcode_create" size="large">生成书籍码</van-button>
          </div>
        </div>

      </div>
      <!-- <button @click="del()">del</button>
      <button @click="exportCanvasAsPNG()">save</button> -->
    </div>
  </div>
</template>

<script>
import { post } from "../request/http";
// import util from "../util/util";
import fabric from "fabric";
import {
  Button,
  Field,
  Cell,
  CellGroup,
  Switch,
  // Icon,
  // Toast,
} from "vant";
export default {
  name: "makeQRcode",
  components: {
    [Button.name]: Button,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Cell.name]: Cell,
    [Switch.name]: Switch,
  },
  data() {
    return {
        // img:"https://xiaotong-abc-1255589169.cos.ap-guangzhou.myqcloud.com/library/2020101315474782612.jpg",
      codeCanvas: null,
      img: "https://img.yzcdn.cn/vant/logo.png",
      rangeList:[{list:[{region:{}}]}],
      rangeIdx1:0,
      rangeIdx2:0,
      resultList:[],
      isRuku:false,
      itemWidth:297.5,
      itemHeight:120.13,
      wholeTop:0,
      wholeLeft:0,
    };
  },
  created() {
    this.book_qrcode_region_query();
  },
  mounted() {
    this.initCanvas();
    console.log(this.codeCanvas)
  },
  methods: {
    book_qrcode_create(){
      let obj = {
        create:this.isRuku,
        data:this.resultList
      };
      post("/api/book_qrcode_create.test", obj).then((res) => {
        console.log("book_qrcode_create", res);
        this.QRcodeList = res.list
        this.start();
      });
    },
    delRegion(idx){
      this.resultList.splice(idx,1)
    },
    pushResult(){
      let min = this.$refs.min.value
      let max = this.$refs.max.value
      let r1 = this.rangeList[this.rangeIdx1].name
      let r2 = this.rangeList[this.rangeIdx1].list[this.rangeIdx2].name
      let obj = {
        r1,r2,min,max
      }
      this.resultList.push(obj)
    },
    bindRange(e){
      // console.log(e.target.dataset.clicktype)
      // console.log(e.target.dataset.idx)
      let clicktype = e.target.dataset.clicktype
      let idx = e.target.dataset.idx
      if(clicktype==0){
        this.rangeIdx1 = idx
        this.rangeIdx2 = 0
      }
      if(clicktype==1){
        this.rangeIdx2 = idx
      }
    },
    initCanvas() {
      this.codeCanvas = new fabric.Canvas("c");
    },
    // 删除
    del() {
      var el = this.codeCanvas.getActiveObject();
      this.codeCanvas.remove(el);
    },
    async start() {
      for (let i= 0; i < this.QRcodeList.length; i++) {
        this.codeCanvas.clear();
        for(let j= 0; j<this.QRcodeList[i].length; j++){
          console.log(i,j)
          await this.syncDrawImage(i,j);
        }
        await this.exportCanvasAsPNG(`第${i}张`)
      }
    },
    syncDrawImage(i,j) {
      return new Promise((resolve,reject) => {
        const imgObj = new Image();
        imgObj.onload = () => {
          var oImage = new fabric.Image(imgObj);
          // let boxWidth = 297.5;
          let boxWidth = parseFloat(this.itemWidth);
          // let boxHeight = 120.13
          let boxHeight = parseFloat(this.itemHeight);
          console.log(boxWidth,boxHeight)
          let imgWidth = boxHeight
          let midpointX = boxWidth / 2;
          let midpointY = boxHeight / 2;
          let numberOfRows = 4;
          oImage.scaleToWidth(imgWidth);
          let imgMidpointX = midpointX - (boxWidth/4)    //图的中点在宽度的1/4处
          let imgMidpointY = midpointY 
          let wholeTop = parseFloat(this.wholeTop)
          let wholeLeft = parseFloat(this.wholeLeft)
          let left = (j % numberOfRows) * (boxWidth) + imgMidpointX + wholeLeft
          let top = parseInt(j / numberOfRows) * (boxHeight) + imgMidpointY + wholeTop

          // console.log(j, left, top)
          oImage.set({
            left,
            top,
          });
          this.codeCanvas.add(oImage);

          let tipsTextFontSize = 14
          let tipsTextLeft = left + imgWidth
          let textRelativeMidpointY = top - 20     //相对box中点
          let text1 = new fabric.Text(`扫码获取`, {
            left: tipsTextLeft,
            top: textRelativeMidpointY,
            fontSize: tipsTextFontSize,
          });
          let text2 = new fabric.Text(`*绘本阅读指导`, {
            left: tipsTextLeft,
            top: textRelativeMidpointY + 20,
            fontSize: tipsTextFontSize,
          });
          let text3 = new fabric.Text(`*拼读单词练习`, {
            left: tipsTextLeft,
            top: textRelativeMidpointY + 40,
            fontSize: tipsTextFontSize,
          });
          let text4 = new fabric.Text(this.QRcodeList[i][j].code, {
            left: left + (boxWidth/4),
            top: top + (boxHeight/2) -10,
            fontSize: tipsTextFontSize,
          });
          this.codeCanvas.add(text1);
          this.codeCanvas.add(text2);
          this.codeCanvas.add(text3);
          this.codeCanvas.add(text4);
          resolve(1);
        };
        imgObj.onerror = (err) => {
          console.log(err,j);
          reject(err)
        };
        imgObj.setAttribute("crossOrigin", "anonymous");
        imgObj.src = this.QRcodeList[i][j].img
        // imgObj.src = 'https://xiaotong-abc-1255589169.cos.ap-guangzhou.myqcloud.com/library/2020101315474653756.jpg'
      });
    },
    exportCanvasAsPNG(name) {
      return new Promise((resolve)=>{
        //获取canvas元素
        var canvasElement = document.getElementById("c");
        // debugger
        //图片类型
        var MIME_TYPE = "image/png";
        //转换成base64
        var imgURL = canvasElement.toDataURL(MIME_TYPE, 2);
        // console.log(imgURL);
        //创建一个a链接，模拟点击下载
        var dlLink = document.createElement("a");
        dlLink.download = name
        dlLink.href = imgURL;
        dlLink.dataset.downloadurl = [
          MIME_TYPE,
          dlLink.download,
          dlLink.href,
        ].join(":");
        // console.log(dlLink);
        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
        resolve(1)
      })
    },
    book_qrcode_region_query() {
      let obj = {};
      post("/api/book_qrcode_region_query.test", obj).then((res) => {
        console.log("范围", res);
        this.rangeList = res.list
      });
    },
    // removeObject() {
    //   // 监控canvas的mouse:down事件
    //   this.codeCanvas.on('mouse:down', function (option) {
    //     // 监控页面的键盘事件
    //     console.log(option)
    //     this.codeCanvas.remove(option.target)
    //     document.onkeydown = function (e) {
    //       console.log(e)
    //       // 是否点击delete
    //       if (e.keyCode === 8) {
    //         // 移除当前所选对象
    //         this.codeCanvas.remove(option.target)
    //       }
    //     }
    //   })
    // },
  },
};
</script>

<style>
.content{
  display: flex;
  display: -webkit-flex;
  justify-content: start;
  align-items: flex-start;
}
.control-box{
  margin-left: 20px;

}
.range-box{
  display: flex;
  display: -webkit-flex;
  justify-content: start;
  align-items: center;
  margin-top: 20px;
}
.range-item{
  padding: 10px 20px;
  font-size: 32px;
  cursor: pointer;
}
.active-range{
  border-bottom: 5px solid red;
}
.region-ipt{
  display: block;
  width: 200px;
  font-size: 32px;
}
.region-box{
  margin-top:20px;
  font-size:32px;
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
.region-text{
  margin-left: 30px;
}
</style>
