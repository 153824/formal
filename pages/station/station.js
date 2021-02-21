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
    if(option.loadingTrigger){
      this.setData({
        loading: true
      })
    }
    try{
      // 访问人岗匹配
      wx.uma.trackEvent('1602210186839');
    }catch (e) {

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
  },
  changeTab: function (e) {
    const checkedId = e.currentTarget.id,
          { name } = e.currentTarget.dataset,
          { menu } = this.data;
    // 点击人岗匹配左侧导航
    try{
      wx.uma.trackEvent('1602210335412',{name: name});
    }catch (e) {

    }
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
    try {
      wx.uma.trackEvent('1602210474316',{name: name});
    }catch (e) {

    }
  },
  onHide() {

  }
});
