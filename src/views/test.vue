<template>
  <div class="main">
    <div class="left">
      <div id="container"></div>
      <div>
        <span>剩余可用频率：</span>
      </div>
    </div>
    <div class="right">
          <div class="topBtn">
                    <input id="file-input" type="file" style="display: block;margin-bottom: 10px;"/>
                    <el-button size="mini" @click="handleAdd()">添加点位</el-button>
          </div>
      <el-table :data="pointsList" style="width: 100%;margin-top: 60px;">
          <el-table-column
      type="index">
    </el-table-column>
        <el-table-column prop="x" label="经度" width="180">
        </el-table-column>
        <el-table-column prop="y" label="维度" width="180">
        </el-table-column>
        <el-table-column prop="v" label="频率">
          <template slot-scope="scope">
                    {{ scope.row.v? scope.row.v : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
                    <el-button size="mini" @click="handleEdit(scope.row,scope.$index)">编辑</el-button>
                    <el-button size="mini" @click="handleDel(scope.row,scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-form>
          <el-form-item label="全部频率">
            <el-input v-model="allDataStr" type="textarea" :rows="4" @change="changeAllDataStr()"></el-input>
          </el-form-item>
      </el-form>
    </div>
    <el-dialog
          title="修改点位"
          :visible.sync="dialogVisible"
          width="30%">
          <el-form>
                    <el-form-item label="经度">
                              <el-input v-model="pointsList[doingIndex].x"></el-input>
                    </el-form-item>
                    <el-form-item label="纬度">
                              <el-input v-model="pointsList[doingIndex].y"></el-input>
                    </el-form-item>
                    <el-form-item label="频率">
                              <el-input v-model="pointsList[doingIndex].v" ></el-input>
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
      allDataStr:'',
      restData: [], //剩余频率
      pointsList: [{x:'0',y:'0',v:''}], //全部点位
      dialogVisible: false,
      doingIndex:0,
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
  methods: {
    initAMap() {
      AMapLoader.load({
        key: "7e1b85237d72d57b3ec1d649ffa3f648", // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ["AMap.Scale"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
      })
        .then((AMap) => {
          this.map = new AMap.Map("container", {
            // 设置地图容器id
            viewMode: "3D", // 是否为3D地图模式
            zoom: 11, // 初始化地图级别
            center: [116.397428, 39.90923], // 初始化地图中心点位置
          });
        })
        .catch((e) => {
          console.log(e);
        });
    },
    handleFileChange() {
          let that = this
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
            that.restData = that.allData
          that.pointsList = arr[0].split(",").map((item) => {
                    let data = item.split(":");
                    let xyData = data[0].split("&");
                    return {
                    x: xyData[0],
                    y: xyData[1],
                    v: data[1],
                    };
          });
          that.pointsList.forEach(item=>{
                    item.v = item.v?item.v.replaceAll('&',','):'-'
                    // that.restData.
          })
          
          };
          reader.readAsText(this.files[0]);
        });
    },
    //添加点位
    handleAdd(){
          this.pointsList.push({x:'0',y:'0',v:''})
          console.log(this.pointsList);
    },
    handleEdit(row,index){
          this.dialogVisible = true;
          this.doingIndex = index;
    },
    handleDel(){
          this.pointsList.splice(this.doingIndex,1);
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
    height:97vh;
    overflow: auto;
    .topBtn{
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
