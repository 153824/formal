// station/station.js
const app = getApp();
Page({
  data:{
    checkedId: "5ea91ca0c81f9b00066426b2",
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
    titleHeight: app.globalData.titleHeight
  },
  onLoad: function(){

  },
  onShow: function(){
    let that = this;
    app.doAjax({
      url: "../haola/positionTags",
      method: "GET",
      success: function(ret) {
        console.log(ret.data[0].childs);
        that.setData({
          menu: ret.data,
          childs: ret.data[0].childs
        });
      }
    });
  },
  changeTab: function (e) {
    const checkedId = e.currentTarget.id,
          { menu } = this.data;
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
    })
  },
  changePage: function () {
    console.log("I click a block!")
  }
});
