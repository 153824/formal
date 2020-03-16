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
    reportMeet: 2,
    startTime: "",
    endTime: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      maxCount: options.count,
      paperId: options.id
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
    var maxCount = that.data.maxCount || 0;
    var t = e.currentTarget.dataset.t;
    var count = that.data.count;
    if (t == 1) {
      count -= 1;
    } else if (t == 2) {
      count += 1;
    } else {
      count = e.detail.value;
    }
    if (count > maxCount) {
      // count = maxCount;
      // that.setData({
      //   count: maxCount
      // });
      app.toast("最大可选择数量为"+maxCount);
      return;
    }
    if (count < 1) {
      count = 0;
    }
    let countStr = count + "";
    if (countStr.startsWith("0")&&countStr.length>1){
      countStr=countStr.substring(1,countStr.length);
    }
    count=Number(countStr);
    console.log(count)
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
    var d = that.data;
    var costNum = d.count;
    console.log(costNum+"   "+d.maxCount);
    if (!costNum) {
      return;
    }
    if (costNum > d.maxCount) {
      console.log("toast="+costNum + "   " + d.maxCount);
      app.toast("测评可用数量不足");
      return;
    }
    var shareMsg = {
      startTime: d.startTime,
      endTime: d.endTime,
      shareType: costNum > 1 ? 2 : 1,
      reportMeet: d.reportMeet,
      count: costNum,
      pcQrcode: "1"
    };
    console.log("shareMsg= " + JSON.stringify(shareMsg))
    app.doAjax({
      url: "toSharePaper",
      method: "post",
      data: {
        id: that.data.paperId,
        shareMsg: JSON.stringify(shareMsg)
      },
      success: function(ret) {
        console.log("ret= "+JSON.stringify(ret))
        that.setData({
          retData: ret
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
    this.setData({
      "retData.img": ""
    });
    wx.redirectTo({
      url: './sendlog?id=' + this.data.paperId
    })
  }
})