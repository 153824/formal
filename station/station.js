// station/station.js
Page({
  data:{
    currentLeftId: "JSG",
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
    ]
  },
  onLoad: function(){
    
  },
  tabMenu: function(e){
    console.log(e.target);
    this.setData({
      currentLeftId: e.target.id,
      itemScrollId: e.target.id
    })
  }
})
