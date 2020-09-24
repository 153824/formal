// station/station.js
const app = getApp();
Page({
  data:{
    checkedId: "",
    childs: [],
    statusbarHeight: app.globalData.statusbarHeight,
    titleHeight: app.globalData.titleHeight,
    isConnected: true,
    isIos: app.isIos,
    loading: true,
    mobile: "18559297592",
    wechat: "haola72",
    active: 1
  },
  onLoad: function(option){
    let that = this;
    wx.hideTabBar({
      animation: true
    });
    if(option.loadingTrigger){
      this.setData({
        loading: true
      })
    }
    app.doAjax({
      url: "positionTags",
      method: "GET",
      noLoading: true,
      success: function(res) {
        that.setData({
          menu: res.data,
          childs: res.data[0].childs,
          isConnected: true,
          checkedId: res.data[0].objectId,
        });
        setTimeout(()=>{
          that.setData({
            loading: false
          })
        },500)
      },
      fail: function (ret) {
        that.setData({
          isConnected: false,
          loading: false
        })
      }
    });
  },
  onShow: function(){
    this.title = this.selectComponent("#title");
    app.getUserInfo(this.title.loadUserMsg.call(this.title._this()));
  },
  changeTab: function (e) {
    const checkedId = e.currentTarget.id,
          { name } = e.currentTarget.dataset,
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
      url: `./components/detail/detail?id=${ id }`,
    });
    wx.aldstat.sendEvent('从人岗匹配进入测评详情', {
            '测评名称': '名称：' + name + ' id：' + id
    });
  },
  onHide() {

  }
});
