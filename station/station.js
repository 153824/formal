// station/station.js
const app = getApp();
Page({
  data:{
    checkedId: "",
    menu: [
      {
        id: "GLL",
        name:"管理类",
        active: false
      },
      {
        id: "JSG",
        name: "技术岗",
        active: true
      },
      {
        id: "GPS",
        name: "管培生",
        active: false
      },
      {
        id: "JYPX",
        name: "教育培训",
        active: false
      },
      {
        id: "SC",
        name: "市场",
        active: false
      },
      {
        id: "YY",
        name: "运营",
        active: false
      },
      {
        id: "ZZ",
        name: "咨询",
        active: false
      },
      {
        id: "JR",
        name:"金融",
        active: false
      },
      {
        id: "LS",
        name: "零售",
        active: false
      },
      {
        id: "CP",
        name:"产品",
        active: false
      },
      {
        id: "XS/KF",
        name:"销售/客服",
        active: false
      },
    ],
    childs: [],
    statusbarHeight: app.globalData.statusbarHeight,
    titleHeight: app.globalData.titleHeight,
    isConnected: true,
    isIos: app.isIos,
    loading: true,
    mobile: "18559297592",
    wechat: "LIN_7890",
  },
  onLoad: function(){

  },
  onShow: function(){
    this.title = this.selectComponent("#title");
    app.getUserInfo(this.title.loadUserMsg.call(this.title._this()));

    let that = this;
    app.doAjax({
      url: "../haola/positionTags",
      method: "GET",
      success: function(res) {
        that.setData({
          menu: res.data,
          childs: res.data[0].childs,
          isConnected: true,
          checkedId: res.data[0].objectId,
          loading: false
        });
      },
      fail: function (ret) {
        that.setData({
          isConnected: false
        })
      }
    });
  },
  changeTab: function (e) {
    const checkedId = e.currentTarget.id,
          { name } = e.currentTarget.dataset,
          { menu } = this.data;
          console.log(e);
    for( let i = 0;i < menu.length;i++ ){
      if( checkedId === menu[i].objectId ){
        this.setData({
          childs: menu[i].childs
        });
        break;
      }else if( i === menu.length-1 ){
        this.setData({
          childs: []
        });
      }
    };
    this.setData({
      checkedId,
    });
    wx.aldstat.sendEvent('从人岗匹配侧边栏进入查看测评列表', {
            '侧边栏名称': '名称：' + name
    });
  },
  changePage: function () {
    wx.navigateTo({
      url: `./more?id=${ 620412 }`
    })
  },
  gotoDetail: function(e){
    var { id,name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `./detail?id=${ id }`,
    });
    wx.aldstat.sendEvent('从人岗匹配进入测评详情', {
            '测评名称': '名称：' + name + ' id：' + id
    });
  },
  onHide() {

  }
});
