// user/teams.js
var app = getApp();
var selNewImg = false;
Page({
  data: {
    isNewCompany: true,
    selvocation: [],
    vocationAry: [
      [],
      []
    ],
    vocationFullArr: [],
    memberNumAry: [
      '15人以下',
      '15-50人',
      '50-150人',
      '150-500人',
      '500-1000人',
      '1000人以上'
    ],
    phoneModel: app.isIphoneX
  },
  onLoad: function(options) {
    selNewImg = false;
    var isNewCompany = true;
    var oldTeamMsg = wx.getStorageSync("oldTeamMsg");
    wx.removeStorageSync("oldTeamMsg");
    if (oldTeamMsg) {
      isNewCompany = false;
    }
    this.setData({
      isNewCompany: isNewCompany,
      oldTeamMsg: oldTeamMsg
    });
    this.loadIndustryList();
  },
  /**
   * 行业列表获取
   */
  loadIndustryList: function() {
    var that = this;
    app.doAjax({
      url: "industryList",
      method: "GET",
      prefix: "boss",
      data: {
        page: 1,
        pageSize: 1000
      },
      success: function(ret) {
        var list = ret.data;
        var vocationFull = {};
        list.forEach(function(node) {
          var parent = node.parent;
          if (parent) {
            vocationFull[parent._id] = vocationFull[parent._id] || {
              name: parent.name,
              child: []
            };
            vocationFull[parent._id]["child"].push(node.name);
          } else {
            vocationFull[node._id] = vocationFull[node._id] || {
              name: node.name,
              child: []
            };
          }
        });
        var vocationFullArr = [];
        var vocationAry = [
          [],
          []
        ];
        for (var k in vocationFull) {
          var n = vocationFull[k];
          vocationAry[0].push(n.name);
          vocationFullArr.push(n.child);
        }
        var selvocation = that.data.selvocation;
        vocationAry[1] = vocationFullArr[selvocation[1] || 0];
        that.setData({
          vocationAry: vocationAry,
          vocationFullArr: vocationFullArr
        });
      }
    });
  },
  getcompanyname: function(e) {
    this.setData({
      companyname: e.detail.value
    })
  },
  /**
   * 行业选择--列变更
   */
  vocationColumnChange: function(e) {
    var d = e.detail;
    var column = d.column;
    var value = d.value;
    var vocationFullArr = this.data.vocationFullArr;
    var vocationAry = this.data.vocationAry;
    if (column == 0) {
      vocationAry[1] = vocationFullArr[value];
    }
    this.setData({
      vocationAry: vocationAry
    });
  },
  /**
   * 确认行业选择
   */
  vocationChange: function(e) {
    var value = e.detail.value;
    var vocationFullArr = this.data.vocationFullArr;
    var vocationAry = this.data.vocationAry;
    vocationAry[1] = vocationFullArr[value[0] || 0];
    this.setData({
      vocationAry: vocationAry,
      selvocation: value
    });
  },
  memberNumChange: function(e) {
    this.setData({
      memberNumValue: e.detail.value
    })
  },
  takephoto: function() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['camera', 'album'],
      success(res) {
        selNewImg = true;
        // tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          imgurl: res.tempFilePaths[0]
        });
      }
    })
  },
  changePage: function(e) {
    var d = e.currentTarget.dataset;
    app.changePage(d.url, d.tab);
  },
  backtouser: function() {
    wx.navigateBack({
      delta: 1
    })
  },
  /**
   * 提交
   */
  submit: function(e) {
    var that = this;
    var data = that.data;
    var vocationFullArr = data.vocationFullArr;
    var selvocation = data.selvocation;
    var companyname = data.companyname;
    var vocationAry = data.vocationAry;
    var k2 = vocationFullArr[selvocation[0]][selvocation[1]];
    var vocation = vocationAry[0][selvocation[0]] + (k2 ? ("-" + k2) : "");
    var memberNumAry = data.memberNumAry;
    var memberNum = memberNumAry[data.memberNumValue];
    var imgurl = data.imgurl;
    if (!companyname || !vocation || !memberNum || !imgurl) return;
    if (selNewImg) {
      wx.showLoading({
        title: '上传图片...',
      });
      var imgType = imgurl.split(".");
      imgType = imgType[imgType.length - 1];
      var fileName = app.globalData.userInfo.id + "/" + (new Date().getTime()) + "." + imgType;
      app.qiniuUpload.upload(imgurl, function(file) {
        wx.hideLoading();
        //成功
        imgurl = "http://" + file.imageURL;
        toNext();
      }, function(err) {
        wx.hideLoading();
        wx.showToast({
          title: '图片上传失败，请重试！',
          icon: "none",
          duration: 3000,
        });
        console.error("err", err);
      }, {
        key: fileName
      });
    } else {
      toNext();
    }

    function toNext() {
      var obj = {
        name: companyname,
        vocation: vocation,
        memberNum: memberNum,
        cert: imgurl
      };
      app.doAjax({
        url: "updateTeamMember",
        data: {
          id: app.teamId,
          type: 4,
          certConfig: obj
        },
        success: function(ret) {
          if (ret.mindMsg) {
            wx.showModal({
              title: '温馨提示',
              content: '存在同名企业，请联系客服',
              showCancel: false
            });
            return;
          }
          app.toast("操作成功");
          setTimeout(function() {
            wx.navigateBack();
          }, 1000);
        }
      });
    }
  },
  /**
   * 重新认证
   */
  reset: function() {
    this.setData({
      oldTeamMsg: ""
    });
  }
})
