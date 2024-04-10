<template>
  <div class="main">
    <div class="left">
      <div id="container"></div>
      <div style="margin-top: 10px">
        <el-form inline >
          <el-form-item label="当前定位经度">
            <el-input v-model="x"></el-input>
          </el-form-item>
          <el-form-item label="当前定位纬度">
            <el-input v-model="y"></el-input>
          </el-form-item>
          <el-form-item label="当前定位半径">
            <el-input v-model="r"></el-input>
          </el-form-item>
        </el-form>
        <span>剩余可用频率：</span>
        <div v-for="item,index in restDataRe" :key="index">{{ item.join(",") }}</div>
        <!-- <div> {{ restData.length ? restData.join(",") : "-" }}</div> -->
        
      </div>
    </div>
    <div class="right" style="padding: 10px">
      <div class="topBtn">
        <input
          id="file-input"
          type="file"
          style="display: block; margin-bottom: 10px"
        />

        <el-button size="mini" @click="handleAdd()">添加点位</el-button>
        <el-button style="margin-top: 10px" size="mini" @click="exportData()"
          >导出</el-button
        >
      </div>
      <el-table :data="pointsList" style="width: 100%; margin-top: 60px">
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="x" label="经度" width="180"> 
          <template slot-scope="scope">
            <el-input v-model="scope.row.x" @change="pasterMap"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="y" label="维度" width="180">
          <template slot-scope="scope">
            <el-input v-model="scope.row.y" @change="pasterMap"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="v" label="频率">
          <template slot-scope="scope">
            <el-input v-model="scope.row.v" @change="pasterMap"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- <el-button size="mini" @click="handleEdit(scope.row, scope.$index)"
              >编辑</el-button
            > -->
            <el-button size="mini" @click="handleDel(scope.row, scope.$index)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-form>
        <el-form-item label="全部频率">
          <el-input
            v-model="allDataStr"
            type="textarea"
            :rows="4"
            @change="changeAllDataStr"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <el-dialog
      title="修改点位"
      :visible.sync="dialogVisible"
      width="30%"
      @close="pasterMap"
    >
      <el-form>
        <el-form-item label="经度">
          <el-input v-model="pointsList[doingIndex].x"></el-input>
        </el-form-item>
        <el-form-item label="纬度">
          <el-input v-model="pointsList[doingIndex].y"></el-input>
        </el-form-item>
        <el-form-item label="频率">
          <el-input v-model="pointsList[doingIndex].v"></el-input>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import AMapLoader from "@amap/amap-jsapi-loader";

export default {
  name: "map-view",
  data() {
    return {
      strData: "", //未处理参数
      allData: [], //全部频率
      allDataStr: "",
      restData: [], //剩余频率
      pointsList: [{ x: "116.3912757", y: "39.906217", v: "" }], //全部点位
      dialogVisible: false,
      doingIndex: 0,
      circleMarkers: [], //点位图像数组
      circlePoints: "", //圆圈对象
      x: 116.433322,
      y: 39.900255,
      r: 50000,
    };
  },
  created() {},
  mounted() {
    this.initAMap();
    this.handleFileChange();
  },
  unmounted() {
    this.map.destroy();
  },
  computed:{
    restDataRe(){
     return  this.restData.reduce((acc, curr, index) => {
    const groupIndex = Math.floor(index / 7);
    if (!acc[groupIndex]) {
        acc[groupIndex] = [];
    }
    acc[groupIndex].push(curr);
    return acc;
}, []);
    }
  },
  watch: {
    allData: {
      handler(newValue, oldValue) {
        this.pasterMap();
        this.compare();
      },
      deep: true,
    },
    x() {
      this.drawCircle();
    },
    y() {
      this.drawCircle();
    },
    r() {
      this.drawCircle();
    },
  },
  methods: {
    async initAMap() {
      let that = this;
      await AMapLoader.load({
        key: "7e1b85237d72d57b3ec1d649ffa3f648", // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ["AMap.Scale"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
      })
        .then((AMap) => {
          var roadNet = new AMap.TileLayer.RoadNet();
          var satellite = new AMap.TileLayer.Satellite();
          this.map = new AMap.Map("container", {
            // 设置地图容器id
            viewMode: "3D", // 是否为3D地图模式
            zoom: 11, // 初始化地图级别
            center: [116.397428, 39.90923], // 初始化地图中心点位置
            layers: [satellite, roadNet],
          });
          var wms = new AMap.TileLayer.WMS({
            url: "https://ahocevar.com/geoserver/wms", //WMS 服务的 url 地址
            blend: false, //地图级别切换时，不同级别的图片是否进行混合
            tileSize: 512, //加载 WMS 图层服务时，图片的分片大小
            params: {
              LAYERS: "topp:states",
              VERSION: "1.3.0",
            }, //OGC 标准的 WMS 地图服务的 GetMap 接口的参数
          });
          this.map.add(wms);
          this.map.on("click", function (e) {
            that.x = e.lnglat.getLng();
            that.y = e.lnglat.getLat();
            that.drawCircle();
          });
        })
        .catch((e) => {
          console.log(e);
        });
    },
    drawCircle() {
      this.map.remove(this.circlePoints);
      //设置圆形位置
      var center = new AMap.LngLat(
        this.x ? this.x : 116.397428,
        this.y ? this.y : 39.90923
      );
      //设置圆的半径大小
      var radius = this.r;
      this.circlePoints = new AMap.Circle({
        center: center, //圆心
        radius: radius, //半径
        borderWeight: 0, //描边的宽度
        strokeColor: "#FF33FF", //轮廓线颜色
        strokeOpacity: 1, //轮廓线透明度
        strokeWeight: 0, //轮廓线宽度
        fillOpacity: 0.4, //圆形填充透明度
        strokeStyle: "clip", //轮廓线样式
        strokeDasharray: [10, 10],
        fillColor: "#1791fc", //圆形填充颜色
        zIndex: 50, //圆形的叠加顺序
      });
      this.map.add(this.circlePoints);
      this.map.setFitView([this.circlePoints]);
      
      this.compare();
    },
    // 计算剩余频率
    compare() {
      this.restData = this.allData;
      let p1 = [this.x, this.y];
      this.pointsList.forEach((item) => {
        let p2 = [item.x, item.y];
        let meter = AMap.GeometryUtil.distance(p1, p2);
        if (meter < this.r) {
          this.restData = this.restData.filter((data) => {
            let vs = item.v.split(",");
            return !vs.some((v) => v == data);
            // return data!=item.v
          });
        }
      });
    },
    // 全部频率更新
    changeAllDataStr() {
      this.allData = this.allDataStr.split(",").filter((item) => item);
    },
    handleFileChange() {
      let that = this;
      document
        .getElementById("file-input")
        .addEventListener("change", function q() {
          const reader = new FileReader();
          reader.onload = function fileReadeComplete() {
            that.strData = reader.result.replaceAll("\r\n", "");
            that.strData = that.strData.replaceAll(" ", "&");
            console.log(that.strData);
            let arr = that.strData.split("/");
            that.allData = arr[1].split("&");
            that.allData = that.allData.filter((item) => {
              return item;
            });
            that.allDataStr = that.allData.join(",");
            that.restData = that.allData;
            that.pointsList = arr[0].split(",").map((item) => {
              let data = item.split(":");
              let xyData = data[0].split("&");
              return {
                x: xyData[0],
                y: xyData[1],
                v: data[1],
              };
            });
            that.pointsList.forEach((item) => {
              item.v = item.v ? item.v.replaceAll("&", ",") : "-";
              // that.restData.
            });
          };
          reader.readAsText(this.files[0]);
        });
    },
    //添加点位
    handleAdd() {
      this.pointsList.push({ x: "116.3912757", y: "39.906217", v: "" });
      console.log(this.pointsList);
      this.pasterMap();
      this.drawCircle();
      this.compare();
    },
    handleEdit(row, index) {
      this.dialogVisible = true;
      this.doingIndex = index;
      this.drawCircle();
      this.compare();
    },
    handleDel(val, index) {
      this.pointsList.splice(index, 1);
      this.pasterMap();
      this.drawCircle();
      this.compare();
    },
    pasterMap() {
      this.circleMarkers.forEach((circleMarker) => {
        this.map.remove(circleMarker);
      });
      this.pointsList.forEach(item=>{
        console.log(item.v,this.allData);
        item.v.split(',').forEach(v=>{
          if(this.allData.indexOf(v)==-1) {
            if(v){
              this.allData.push(v)
            }
         
        }
        })
        console.log('111',this.allData);
        this.allDataStr = this.allData.join(",");
      })
      this.circleMarker = [];
      var radius = 5; //圈半径
      let centers = this.pointsList.map((item) => {
        return new AMap.LngLat(item.x, item.y);
      });
      this.circleMarkers = [];
      centers.forEach((center) => {
        this.circleMarkers.push(
          new AMap.CircleMarker({
            center: center, //圆心
            radius: radius, //半径
            strokeColor: "white", //轮廓线颜色
            strokeWeight: 2, //轮廓线宽度
            strokeOpacity: 0.5, //轮廓线透明度
            fillColor: "rgba(0,0,255,1)", //多边形填充颜色
            fillOpacity: 0.5, //多边形填充透明度
            zIndex: 10, //多边形覆盖物的叠加顺序
            cursor: "pointer", //鼠标悬停时的鼠标样式
          })
        );
      });
      this.circleMarkers.forEach((circleMarker) => {
        this.map.add(circleMarker);
        // this.map.setFitView([circleMarker]);
      });
      this.compare();
    },
    // 导出
    exportData() {
      console.log(this.pointsList);
      var data = "";
      this.pointsList.forEach((item, index) => {
        if (index + 1 < this.pointsList.length) {
          data += `${item.x} ${item.y}:${item.v.replaceAll(",", " ")},\n`;
        } else {
          data += `${item.x} ${item.y}:${item.v.replaceAll(",", " ")}\n`;
        }
      });
      data += "/\n";
      data += this.allData.join(" ");
      data += "\n/剩余频率\n";
      data += this.restData.join(" ");
      let str = new Blob([data], { type: "text/plain;charset=utf-8" });
      // 注意这里要手动写上文件的后缀名
      saveAs(str, `点位统计.txt`);
    },
  },
};
</script>
<style scoped>
.main {
  display: flex;
  width: 100%;
  .right {
    flex: 1;
    height: 97vh;
    overflow: auto;
    .topBtn {
      position: fixed;
      top: 0;
      z-index: 1;
      background-color: #fff;
      width: 100%;
      padding-bottom: 10px;
      border-bottom: 1px solid grey;
    }
  }
  .left {
    flex: 1;
  }
}
#container {
  width: 100%;
  height: 400px;
}
</style>
