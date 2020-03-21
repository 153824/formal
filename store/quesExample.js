// store/quesExample.js
var app = getApp();
Page({
  data: {

  },
  onLoad: function(options) {
    var quesExample = wx.getStorageSync("quesExample");
    wx.removeStorageSync("quesExample");
    console.log("quesExample:", quesExample);
    var pageTitle = quesExample.name;
    wx.setNavigationBarTitle({
      title: pageTitle + '-例题',
    });
    quesExample = quesExample.ques;
    var options = quesExample.options;
    options.forEach(function(node, i) {
      var txt = String.fromCharCode(65 + i) + "：";
      options[i] = {
        txt: txt,
        msg: node
      };
    });
    quesExample["options"] = options;
    this.setData(quesExample);
  },

})