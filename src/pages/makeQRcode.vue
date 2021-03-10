<template>
  <div >
    <div class="content">
      
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
          
          <van-cell-group>
            <van-field
              label="提示文字大小"
              placeholder="提示文字大小"
              v-model="tipsTextFontSize"
              autosize
              type="text"
              clickable
              border
            />
          </van-cell-group>
          <van-cell-group>
            <van-field
              label="编码文字大小"
              placeholder="编码文字大小"
              v-model="bmTextFontSize"
              autosize
              type="text"
              clickable
              border
            />
          </van-cell-group>

          <van-cell-group>
            <van-field
              label="输出图宽"
              placeholder="输出图宽"
              v-model="canvasWidth"
              @input="onCanvasWidth"
              autosize
              type="text"
              clickable
              border
            />
          </van-cell-group>
          <van-cell-group>
            <van-field
              label="输出图高"
              placeholder="输出图高"
              v-model="canvasHeight"
              @input="onCanvasHeight"
              autosize
              type="text"
              clickable
              border
            />
          </van-cell-group>
          <van-cell-group>
            <van-field
              label="放大倍数"
              placeholder="放大倍数"
              v-model="multiple"
              autosize
              type="text"
              clickable
              border
            />
          </van-cell-group>
          <van-cell-group>
            <van-field
              label="从第几行开始打印(1最小)"
              placeholder="从第几行开始打印"
              v-model="startLine"
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
          <van-cell center title="是否打印框框">
            <template #right-icon>
              <van-switch v-model="isBorder" size="24" />
            </template>
          </van-cell>
          <div style="margin-top:20px;">
            <van-button color="#7232dd" @click="book_qrcode_create" size="large">生成书籍码</van-button>
          </div>
        </div>

      </div>

      <canvas
        id="c"
        style="border: 1px solid red;"
        :width="canvasWidth*multiple"
        :height="canvasHeight*multiple"
      ></canvas>
      <canvas
        id="c-back"
        style="border: 1px solid red;"
        :width="canvasWidth*multiple"
        :height="canvasHeight*multiple"
      ></canvas>
      <!-- <canvas
        id="c"
        style="border: 1px solid red;"
      ></canvas> -->
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
      itemWidth:257.5,
      itemHeight:103.5,
      wholeTop:46,
      wholeLeft:15,
      multiple:3,    //放大倍数
      tipsTextFontSize:16,
      bmTextFontSize:14,
      // canvasWidth:210*5,
      // canvasHeight:297*5,
      canvasWidth:1050,
      canvasHeight:1485,
      startLine:1,
      isBorder:false,
    };
  },
  created() {
    this.book_qrcode_region_query();
    // this.codeCanvas = {clear:()=>{}}
  },
  mounted() {
    this.initCanvas();
    console.log(this.codeCanvas)
  },
  methods: {
    onCanvasWidth(value){
      // console.log(value)
      // this.codeCanvas.clear();
      document.getElementById('c').width = parseInt(value) * this.multiple
      console.log(this.codeCanvas)
    },
    onCanvasHeight(value){
      // this.codeCanvas.clear();
      document.getElementById('c').height = parseInt(value) * this.multiple
    },
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
      this.codeBackCanvas = new fabric.Canvas("c-back");
      // this.codeCanvas.contextContainer.imageSmoothingEnabled = false
      // this.codeCanvas.contextContainer.mozImageSmoothingEnabled = false
      // this.codeCanvas.contextContainer.webkitImageSmoothingEnabled = false
      // this.codeCanvas.contextContainer.msImageSmoothingEnabled = false
    },
    // 删除
    del() {
      var el = this.codeCanvas.getActiveObject();
      this.codeCanvas.remove(el);
    },
    async start() {
      for (let i= 0; i < this.QRcodeList.length; i++) {
        this.codeCanvas.clear();
        this.codeBackCanvas.clear();
        for(let j= 0; j<this.QRcodeList[i].length; j++){
          console.log(i,j)
          await this.syncDrawImage(i,j);
          await this.syncDrawBackImage(i,j)
        }
        await this.exportCanvasAsPNG(`第${i}张`)
      }
    },
    // 正面
    syncDrawImage(i,j) {
      return new Promise((resolve,reject) => {
        const imgObj = new Image();
        imgObj.onload = () => {
          let multiple = this.multiple
          var oImage = new fabric.Image(imgObj);
          // let boxWidth = 297.5;
          let boxWidth = parseFloat(this.itemWidth) * multiple;
          // let boxHeight = 120.13
          let boxHeight = parseFloat(this.itemHeight) * multiple;
          console.log(boxWidth,boxHeight)
          let imgWidth = boxHeight
          let midpointX = boxWidth / 2;
          let midpointY = boxHeight / 2;
          let numberOfRows = 4;
          oImage.scaleToWidth(imgWidth);
          let imgMidpointX = midpointX - (boxWidth/4)    //图的中点在宽度的1/4处
          let imgMidpointY = midpointY 
          let wholeTop = parseFloat(this.wholeTop) + (this.startLine-1) * (boxHeight)
          let wholeLeft = parseFloat(this.wholeLeft)
          let left = (j % numberOfRows) * (boxWidth) + imgMidpointX + wholeLeft
          let top = parseInt(j / numberOfRows) * (boxHeight) + imgMidpointY + wholeTop
          if(this.isBorder){
            let rectLeft = (j % numberOfRows) * (boxWidth) + midpointX + wholeLeft
            let rectTop = parseInt(j / numberOfRows) * (boxHeight) + midpointY + wholeTop
            let rect = new fabric.Rect({
              left: rectLeft,
              top:  rectTop,
              // fill: 'red',
              // strokeDashArray: [10, 10],
              stroke: 'red',
              strokeWidth: 1,
              fill: 'white',
              width: boxWidth,
              height: boxHeight,
            });
            this.codeCanvas.add(rect);
          }
          // console.log(j, left, top)
          oImage.set({
            left,
            top,
          });
          this.codeCanvas.add(oImage);
          
          let tipsTextFontSize = this.tipsTextFontSize * multiple
          let tipsTextLeft = left + imgWidth
          let textGap = 20
          // let textRelativeMidpointY = top - (20*multiple)   //相对box中点
          let text1 = new fabric.Text(`扫码获取`, {
            left: tipsTextLeft,
            top: top - (tipsTextFontSize + textGap),
            fontSize: tipsTextFontSize,
          });
          let text2 = new fabric.Text(`*绘本阅读指导`, {
            left: tipsTextLeft,
            top: top,
            fontSize: tipsTextFontSize,
          });
          let text3 = new fabric.Text(`*拼读单词练习`, {
            left: tipsTextLeft,
            top: top + (tipsTextFontSize + textGap),
            fontSize: tipsTextFontSize,
          });
          let text4 = new fabric.Text(this.QRcodeList[i][j].code, {
            left: left + (boxWidth/4),
            top: top + (boxHeight/2) -30,
            fontSize: this.bmTextFontSize * multiple,
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
    // 背面
    syncDrawBackImage(i,j) {
      return new Promise((resolve) => {
          let multiple = this.multiple
          let boxWidth = parseFloat(this.itemWidth) * multiple;
          let boxHeight = parseFloat(this.itemHeight) * multiple;
          let midpointX = boxWidth / 2;
          let midpointY = boxHeight / 2;
          let numberOfRows = 4;
          let imgMidpointX = midpointX - (boxWidth/4)    //图的中点在宽度的1/4处
          let imgMidpointY = midpointY 
          let wholeTop = parseFloat(this.wholeTop) + (this.startLine-1) * (boxHeight)
          let wholeLeft = parseFloat(this.wholeLeft)
          // let left = (j % numberOfRows) * (boxWidth) + imgMidpointX + wholeLeft
          let left = ((numberOfRows-1) - j% numberOfRows) * (boxWidth) + imgMidpointX + wholeLeft
          let top = parseInt(j / numberOfRows) * (boxHeight) + imgMidpointY + wholeTop

          let tipsTextFontSize = this.tipsTextFontSize * multiple
          let textGap = 20
          // let textRelativeMidpointY = top - (20*multiple)   //相对box中点
          let text1 = new fabric.Text(`典范英语`, {
            left: left + (boxWidth/4),
            top: top - (tipsTextFontSize + textGap),
            fontSize: tipsTextFontSize,
          });
          let text2 = new fabric.Text(`2930`, {
            left: left + (boxWidth/4),
            top: top,
            fontSize: tipsTextFontSize,
          });
          let text3 = new fabric.Text(`2020-10-20`, {
            left: left + (boxWidth/4),
            top: top + (tipsTextFontSize + textGap),
            fontSize: tipsTextFontSize,
          });
          this.codeBackCanvas.add(text1);
          this.codeBackCanvas.add(text2);
          this.codeBackCanvas.add(text3);
          resolve(1);
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

        var canvasElement_back = document.getElementById("c-back");
        //转换成base64
        var imgURL_back = canvasElement_back.toDataURL(MIME_TYPE, 2);
        // console.log(imgURL);
        //创建一个a链接，模拟点击下载
        var dlLink_back = document.createElement("a");
        dlLink.download = `${name}-背面`
        dlLink.href = imgURL_back;
        dlLink.dataset.downloadurl = [
          MIME_TYPE,
          dlLink.download,
          dlLink.href,
        ].join(":");
        document.body.appendChild(dlLink_back);
        dlLink.click();
        document.body.removeChild(dlLink_back);
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
  margin-right:20px;
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
