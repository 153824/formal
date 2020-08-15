// store/sharePaper.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    retData: {
      img: ""
    },
    maxCount: 0,
    paperId: 0,
    count: 1,
    reportMeet: 1,
    startTime: "",
    endTime: "",
    statusbarHeight: app.globalData.statusbarHeight,
    titleHeight: app.globalData.titleHeight,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var { id,count,name,hadBuyout,isFree  } = options;
    this.setData({
      maxCount: count,
      paperId: id,
      paperName: name,
      hadBuyout: hadBuyout === 'true' ? true : false ,
      isFree: isFree === 'true' ? true : false ,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    var minTime = app.changeDate(new Date(), "yyyy-MM-dd");
    var endTime = app.changeDate((new Date().getTime() + (3 * 24 * 60 * 60 * 1000)), "yyyy-MM-dd");
    that.setData({
      minTime: minTime,
      startTime: minTime,
      endTime: endTime
    });
  },
  changeCount: function(e) {
    var that = this;
    var t = e.currentTarget.dataset.t;
    var { maxCount=0,count,hadBuyout,isFree } = that.data;
    console.log( maxCount,count,hadBuyout,isFree);
    if (t == 1) {
      count -= 1;
    } else if (t == 2) {
      count += 1;
    } else {
      count = e.detail.value;
    }
    if (count > parseInt(maxCount) && !hadBuyout && !isFree) {
      app.toast("最大可选择数量为" + maxCount);
      return;
    }
    if (count < 1) {
      count = 0;
    }
    let countStr = count + "";
    if (countStr.startsWith("0") && countStr.length > 1) {
      countStr = countStr.substring(1, countStr.length);
    }
    count = Number(countStr);
    that.setData({
      count: count
    });
  },
  changeReportMeet: function(e) {
    var k = +e.currentTarget.dataset.k;
    this.setData({
      reportMeet: k
    });
  },
  toSharePaper: function() {
    var that = this;
    var { count,paperName,hadBuyout,isFree,maxCount,reportMeet } = that.data;
    var costNum = count;
//     wx.aldstat.sendEvent('点击生成测评邀请函', {
//         '测评名称': '名称：' + paperName
//      });
    if (!costNum && !hadBuyout && !isFree ) {
      return;
    }
    if (costNum > maxCount && !hadBuyout && !isFree) {
      app.toast("测评可用数量不足");
      return;
    }
    var shareMsg = {
      shareType: costNum > 1 ? 2 : 1,
      reportMeet: reportMeet,
      count: costNum,
      pcQrcode: "1"
    };
    app.doAjax({
      url: "sharePapers/toSharePaper",
      method: "post",
      data: {
        id: that.data.paperId,
        shareMsg: JSON.stringify(shareMsg)
      },
      success: function(ret) {
        console.log("ret= " + JSON.stringify(ret))
        that.setData({
          retData: ret
        });
        wx.aldstat.sendEvent('成功生成测评邀请函', {
                '测评名称': '名称：' + paperName
        });
      }
    })
  },

  bindDateChange: function(e) {
    var val = e.detail.value;
    var k = e.currentTarget.dataset.k;
    var obj = {};
    obj[k] = val;
    this.setData(obj);
  },
  /**
   * 隐藏分享码
   */
  closedati: function(e) {
    console.log(e);
    this.setData({
      "retData.img": ""
    });
    wx.redirectTo({
      url: `../manager/useHistoryDetail?sharePaperId=${this.data.retData.id}&status=`
    })
  }
})
