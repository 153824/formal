// store/charge/charge.js
//测评详情界面
var app = getApp();
var isFirstLoad = true;
Page({
  data: {
    showGiftDlg: false,
    hasFreeTick: false,
    isFreeTickId: false,
    teamRole: app.teamRole,
    activePointer: 2,
    pageScrollTop: 0,
    showMindDlg: false,
    isIos: false,
    showMindToast: false,
    dlgShow: false,
    dataLoaded: false,
    showLogin: false,
    ispay: false,
    dati: false,
    price: 60,
    count: 1,
    paperid: "",
    isvip1: "",
    isticket: false,
    name: "",
    isAllFree: false,
    isfree: false,
    saveImg: {},
    phoneModel: app.isIphoneX,
    getphoneNum: true,
    istext: true,
    showDlg1: false,
    loading: true,
    mobile: "18559297592",
    wechat: "LIN_7890"
  },
  onLoad: function(options) {
    var that = this;
    var { id,name } = options;
    isFirstLoad = true;
    var userData = app.globalData.userInfo || wx.getStorageSync("userInfo");
    this.setData({
      isIos: app.isIos,
      teamRole: app.teamRole,
      userData: userData,
      paperid: options.id,
      getphoneNum: true
    });
    wx.aldstat.sendEvent('访问测评详情', {
      '测评名称': `名称: ${name} id：${id}`
    });
    if (app.isLogin) return;
    app.checkUser = function() {
      that.onShow();
      app.checkUser = null;
    };
  },
  onShow: function() {
    var that = this;
    if (app.isLogin) {
      app.doAjax({
        url: "myTeamDetail",
        method: "get",
        data: {
          id: app.teamId
        },
        success: function(ret) {
          that.setData({
            teamAdminUser: ret.adminUser.nickname
          });
        }
      });
      app.doAjax({
        url: "getMyticket",
        method: "get",
        noLoading: true,
        data: {
          page: 1,
          pageSize: 12,
          type: 5
        },
        success: function(ret) {
          var hasOldFreeTicks = false;
          if (ret && ret.length) {
            hasOldFreeTicks = true; //还有未使用完的礼包券--无法获取第二次的免费券
          }
          var couponGet0 = app.couponGet0 || false;
          var couponGet = app.couponGet || false;
          var couponGet1 = app.couponGet1 || false;
          var isTodayTeam = app.isTodayTeam || false;
          that.setData({
            teamRole: app.teamRole,
            couponGet0: couponGet0,
            couponGet: hasOldFreeTicks ? true : couponGet,
            couponGet1: hasOldFreeTicks ? true : couponGet1,
            isTodayTeam: isTodayTeam,
            // hasFreeTick
          });
        }
      });
      app.doAjax({
        url: "getMyticket",
        method: "get",
        noLoading: true,
        data: {
          page: 1,
          pageSize: 12,
          type: 2
        },
        success: function(ret) {
          var hasFreeTick = false;
          ret.forEach(function(n) {
            if (n.type == 1) {
              hasFreeTick = true;
            }
          });
          app.doAjax({
            url: "getMyticket",
            method: "get",
            noLoading: true,
            data: {
              page: 1,
              pageSize: 12,
              type: 1
            },
            success: function(ret) {
              var freeTick = "";
              ret.forEach(function(n) {
                if (n.type == 2) { //有领取过3张免费测评券
                  freeTick = n.id;
                }
              });
              that.setData({
                hasFreeTick: true,
                freeTick: freeTick
              });
              that.setData({
                oldShareInfo: ""
              });
              if (!wx.getStorageSync("hideLastTestMind")) {
                app.doAjax({
                  url: 'toSharePaper',
                  method: 'post',
                  data: {
                    type: "self",
                    isCheckOld: true
                  },
                  success: function(res) {
                    if (res && res.isOld && res.id) {
                      that.setData({
                        oldShareInfo: res
                      });
                    }
                  }
                });
              }
              app.getUserInfo(that.toGetPaperDetail);
            }
          });
        }
      });
    }
  },
  closeGiftDlg: function() {
    this.setData({
      showGiftDlg: false
    });
  },
  realCloseGiftDlg: function () {
  
    this.setData({
      showGiftDlg: false
    });
  },
  toShowGiftDlg: function() {
   
    this.setData({
      showGiftDlg: true
    });
  },
  toGetPaperDetail: function(noLoading) {
    var that = this;
    noLoading = noLoading || false;
    var showMindToast = false;
    app.doAjax({
      url: "paperDetail",
      method: "get",
      data: {
        id: that.data.paperid,
      },
      noLoading: noLoading,
      success: function(ret) {
        console.log("paperDetail: ", ret);
        isFirstLoad = false;
        if (!ret || !ret.id) {
          wx.showModal({
            title: '提示',
            content: '该测评已被下架',
            success: function() {
              wx.navigateBack();
            }
          });
          return;
        }
        var vip0 = wx.getStorageSync("isvip0");
        var vip1 = wx.getStorageSync("isvip1");
        var vip2 = wx.getStorageSync("isvip2");
        wx.setNavigationBarTitle({
          title: ret.name || "测评详情"
        });
        var isAllFree = false,
            isfree = false,
            freeCount = 0,
            isticket = false,
            showFullBtn = false,
            ispay = false;
        // wx.setStorageSync('apply', ret.setting.apply)
        if (ret.userPapersNum.type == -1 || !(+(ret.setting || {}).price)) {
          isAllFree = true
        }
        if ((ret.setting || {}).isFree == true) {
          isfree = true;
          freeCount = (((ret.setting || {}).testRule || {}).count || 0) - ((ret.userPapersNum || {}).freeCount || 0);
        }
        if (freeCount < 0) {
          freeCount = 0;
        }
        if ((ret.userPapersNum || {}).freeTicket != 0) {
          isticket = true;
        }
        var hasShowMindToast = wx.getStorageSync("hasShowMindToast");
        if (app.teamRole == 3 && !app.freeTickId) { //超级管理员的团队
          if (!isAllFree && !ret.userPapersNum.hasOld && !hasShowMindToast && (ret.userPapersNum.freeTicket || ret.userPapersNum.vipTicket)) {
            showMindToast = true;
            wx.setStorageSync("hasShowMindToast", true);
            // setTimeout(function() {
            //   that.setData({
            //     showMindToast: false
            //   });
            // }, 3000);
          }
        }
        var userData = app.globalData.userInfo || wx.getStorageSync("userInfo");
        ret.setting.price = +ret.setting.price || 0;
        ret.setting.praiseCount = +ret.setting.praiseCount || 0;
        if (ret.userPapersNum.hasOld) {
          wx.removeStorageSync(that.data.paperid);
        }
        if (wx.getStorageSync(that.data.paperid)) {
          ret.userPapersNum.hasOld = true;
        }
        if (ret.setting.quesType && ret.setting.quesType.length) {
          ret.setting.quesType.forEach(function(node) {
            var ques = node.ques;
            ques.stem = ques.stem.replace(/<img/g, "<img style='max-width:100%;'");
            ques.stem = ques.stem.replace(/\n/g, "<br>");
            ques.options = ques.options.join("&&|").replace(/<img/g, "<img style='max-width:100%;'").split("&&|");
            var options = ques.options;
            options.forEach(function(node, i) {
              var txt = String.fromCharCode(65 + i) + "：";
              options[i] = {
                txt: txt,
                msg: node
              };
            });
            node["stem"] = ques.stem;
            node["options"] = options;
          });
        }
        console.log("app.freeTickId", app.freeTickId);
        that.setData({
          freeTickId: !isAllFree ? app.freeTickId : '',
          teamRole: app.teamRole,
          showMindToast: showMindToast,
          userData: userData,
          dataLoaded: true,
          paperDetail: ret,
          isvip0: vip0,
          isvip1: vip1,
          isvip2: vip2,
          isAllFree: isAllFree,
          isfree: isfree,
          isticket: app.isIos || isticket,
          freeCount: freeCount,
          showFullBtn: showFullBtn,
          ispay: ispay,
          loading: false
        });
        // if (userData.isBind) {
        //   that.openpopup(null, true);
        //   wx.aldstat.sendEvent('点击了分享再领3张券-1', {
        //     '触发点击': '点击数'
        //   });
        // }
        app.doAjax({
          url: 'toSharePaper',
          method: 'post',
          data: {
            type: "self",
            isCheckOld: true,
            id: that.data.paperid,
          },
          success: function(res) {
            if (res && res.isOld && res.id) {
              that.setData({
                oldShareId: res.id
              });
            }
          }
        });
      }
    });
  },
  /**
   * 隐藏底部弹窗提示
   */
  closeMindToast: function(e) {
    this.setData({
      showMindToast: false
    });
  },
  texthidden: function() {
    this.setData({
      istext: true
    })
  },
  inputprice: function(e) {
    this.setData({
      count: e.detail.value * 1
    })
  },
  //免费领取测评
  changeStatus: function(e) {
    var that = this;
    that.checkUserMobile(e, function() {
      var userMsg = app.globalData.userMsg;
      app.doAjax({
        url: "buyPaper",
        method: "post",
        data: {
          id: that.data.paperid,
          count: that.data.freeCount,
          type: 4,
          openid: userMsg.openid || wx.getStorageSync("openId")
        },
        success: function(res) {
          app.toast("领取成功");
          setTimeout(function() {
            that.onShow();
          }, 500);
        }
      });
    });
  },
  changeStatus2: function(e) {
    var that = this;
    that.checkUserMobile(e, function() {
      if (e.currentTarget.dataset.t) {
        app.freeTickId = "";
        that.useticket();
        return;
      }
      app.toast("领取成功");
      var key = that.data.paperid;
      wx.setStorageSync(key, true);
      that.setData({
        showFullBtn: true
      });
    });

  },
  /**
   * 进入测评购买
   */
  paymore: function() {
    this.setData({
      ispay: true
    })
  },
  /**
   * 用券购买测评
   */
  useticket: function() {
    
    var that = this;
    var count = this.data.count;
    if (!count) return wx.showToast({
      title: '购买数量不能为空',
      icon: 'none',
      duration: 1200
    });
    var maxCount = (that.data.paperDetail.userPapersNum.freeTicket || 0) + (that.data.paperDetail.userPapersNum.vipTicket || 0);
    if (count > maxCount) return wx.showToast({
      title: '券数量不足，无法购买',
      icon: 'none',
      duration: 1200
    });
    app.doAjax({
      url: "buyPaper",
      method: "post",
      data: {
        voucherId: that.data.freeTickId,
        id: that.data.paperid,
        count: that.data.count,
        type: 3,
        openid: wx.getStorageSync("openId") || app.globalData.userMsg.openid
      },
      success: function(res) {
        wx.showToast({
          title: '兑换成功',
        });
        that.showMindDlgFn();
        var o = {
          ispay: false,
          pageScrollTop: 0
        };
        if (that.data.freeTickId) {
          o["isFreeTickId"] = true;
        }
        that.setData(o);
        setTimeout(function() {
          that.toGetPaperDetail(true);
        }, 500);
      }
    });
  },
  /**
   * 提示窗口
   */
  showMindDlgFn: function(e) {
    var showMindDlg = false;
    var activePointer = this.data.activePointer;
    if (!wx.getStorageSync("hasShowMindDlg") && !e) { //未显示过提示窗口
      showMindDlg = true;
      wx.setStorageSync("hasShowMindDlg", true);
    }
    if (e) {
      showMindDlg = true;
      activePointer -= 1;
    }
    this.setData({
      showMindDlg: showMindDlg,
      activePointer: activePointer,
      dati: false,
      isok: false
    });
  },
  closedati: function(e) {
    this.setData({
      dati: false,
      isok: false
    });
  },
  /**获取用户体验测评报告 */
  toReportDetail: function() {
    var that = this;
    app.doAjax({
      url: 'toSharePaper',
      method: 'post',
      data: {
        type: "self",
        isCheckOld: true,
        status: 2,
        id: that.data.paperid,
      },
      success: function(res) {
        if (res && res.id) {
          wx.navigateTo({
            url: './report/detail?id=' + res.id,
          });
        }
      }
    });
  },
  /** 体验测评 */
  gotoguide: function() {
    var that = this;
    
    function toNext() {
      app.doAjax({
        url: 'toSharePaper',
        method: 'post',
        data: {
          type: "self",
          id: that.data.paperid,
        },
        success: function(res) {
          wx.navigateTo({
            url: '../test/guide?id=' + res.id
          })
        }
      });
    }
    that.setData({
      showMindDlg: false
    });
    app.doAjax({
      url: 'toSharePaper',
      method: 'post',
      data: {
        type: "self",
        isCheckOld: true,
        id: that.data.paperid,
      },
      success: function(res) {
        if (res && res.isOld && res.id) {
          var sKey = "oldAnswer" + res.id;
          var oldData = wx.getStorageSync(sKey);
          if (oldData) {
            wx.navigateTo({
              url: '../test/index?pid=' + that.data.paperid + '&id=' + res.id
            });
            return;
          }
          wx.navigateTo({
            url: '../test/guide?id=' + res.id
          });
          return;
        }
        if (+that.data.paperDetail.setting.price && that.data.paperDetail.userPapersNum.total > 0) {
          //完全免费测评无需提示
          wx.showModal({
            title: '体验确认',
            content: '体验将消耗1份可用数量，是否确认体验？',
            success: function(ret) {
              if (ret.confirm) {
                toNext();
              }
            }
          });
        } else {
          toNext();
        }
      }
    });
  },

  /**购买数量+1 */
  addcount: function() {
    this.setData({
      count: this.data.count + 1
    });
  },
  /**购买数量-1 */
  jiancount: function() {
    if (this.data.count <= 1) {
      this.setData({
        count: 1
      });
    } else {
      this.setData({
        count: this.data.count - 1
      })
    }
  },
  paymoney: function(e) {
  
    console.log("统计1", e);
    this.setData({
      isticket: app.isIos || false,
      ispay: true
    })
  },
  /**
   * 购买测评
   */
  payfished: function() {
    var that = this;
    if (this.data.count != 0) {
      app.doAjax({
        url: "buyPaper",
        method: "post",
        data: {
          id: that.data.paperid,
          count: that.data.count,
          type: 1,
          openid: wx.getStorageSync("openId") || app.globalData.userMsg.openid
        },
        success: function(res) {
          console.log(res)
          wx.requestPayment({
            'appId': res.payObj.appId,
            'timeStamp': res.payObj.timeStamp,
            'nonceStr': res.payObj.nonceStr,
            'package': res.payObj.package,
            'signType': 'MD5',
            'paySign': res.payObj.paySign,
            'success': function(res) {
              that.showMindDlgFn();
              wx.showToast({
                title: '购买成功',
                duration: 2000
              });
              that.setData({
                ispay: false,
                pageScrollTop: 0
              });
              setTimeout(function() {
                that.toGetPaperDetail(true);
              }, 500);
              //这里完成跳转
            },
            'fail': function(res) {
              if (res.errMsg == "requestPayment:fail cancel") {
                wx.showToast({
                  title: '购买取消',
                  icon: 'none',
                  duration: 1200
                })
              } else {
                wx.showToast({
                  title: '购买失败',
                  icon: 'none',
                  duration: 1200
                })
              }
              //支付失败
              console.log(res);
            },
            'complete': function(res) {}
          })
        }
      });
    } else {
      wx.showToast({
        title: '购买数量不能为空',
        icon: 'none',
        duration: 1200
      })
    }
  },

  closepaypage: function() {
    this.setData({
      ispay: false
    })
  },

  gotodati: function() {
    
    //发放测评
    var that = this;
    var paperDetail = that.data.paperDetail;
    var userPapersNum = paperDetail.userPapersNum || {};
    if (userPapersNum.total == 0) {
      app.toast("测评可用数量不足，请先购买或用券兑换测评");
   
      return;
    }
    wx.navigateTo({
      url: '../store/sharePaper?id=' + paperDetail.id + "&count=" + userPapersNum.total,
    });
    return;
    app.doAjax({
      url: 'toSharePaper',
      method: 'post',
      data: {
        id: that.data.paperid,
      },
      success: function(res) {
        that.setData({
          pictureUrl: res.img,
          shareId: res.id,
          dati: true,
          showMindDlg: false
        });
        that.onShow()
      }
    })
  },

  gototailed: function() { //发放记录
    // app.getUserInfo();
    // this.checkUserMobile(e, function() {
    //   wx.setStorageSync("paperDetail", this.data.paperDetail);
    //   wx.navigateTo({
    //     url: './sendlog?id=' + this.data.paperid
    //   });
    // });
    wx.setStorageSync("paperDetail", this.data.paperDetail);
    wx.navigateTo({
      url: './sendlog?id=' + this.data.paperid
    })
  },
  /**
   * 分享领取测评
   */
  openpopup: function(e, noShowDlg) {
   

    // var that = this;
    // var data = that.data;
    // if (data.freeTick && e) {
    //   that.setData({
    //     showDlg1: true
    //   });
    //   return;
    // }
    // var paperDetail = data.paperDetail;
    // var userInfo = app.globalData.userInfo;
    // app.doAjax({
    //   url: "shareQrcode",
    //   method: "get",
    //   noLoading: noShowDlg,
    //   data: {
    //     paperId: paperDetail.id,
    //     uid: wx.getStorageSync("unionId"),
    //     avatar: userInfo.avatar,
    //     username: userInfo.nickname,
    //     papername: paperDetail.name
    //   },
    //   success: function(ret) {
    //     that.setData({
    //       shareImg: ret.url,
    //       ispopup: noShowDlg ? false : true,
    //       isok: noShowDlg ? false : true
    //     });
    //   },
    //   error: function() {}
    // });
  },
  changePage: function(e) {

    var that = this;
    var d = e.currentTarget.dataset;
    if (d.url) {
      if (d.url =="../index/couponGet?type=2"){
        
      }
      var detail = e.detail;
      if ((!detail || !detail.encryptedData) && d.n == "getPhoneNumber") return;
      if (detail && detail.encryptedData) {
        var iv = detail.iv;
        var encryptedData = detail.encryptedData;
        if (encryptedData) {
          //用户授权手机号
         
          var userMsg = app.globalData.userMsg || {};
          userMsg["iv"] = iv;
          userMsg["encryptedData"] = encryptedData;
          app.doAjax({
            url: "updatedUserMobile",
            data: userMsg,
            success: function(ret) {
              app.getUserInfo();
            }
          });
        }
      }
    }
    that.closeGiftDlg();
    app.changePage(d.url, d.tab);
  },
  closepopup: function() {
    this.setData({
      ispopup: false,
      isok: false
    });
  },

  changePaymentmoney: function() {
    this.setData({
      isticket: app.isIos || false
    })
  },

  changePaymentticket: function() {
    this.setData({
      isticket: true
    })
  },
  /**
   * 进入例题查看
   */
  toQuesExample: function(e) {
    var list = this.data.paperDetail.setting.quesType;
    var index = e.currentTarget.dataset.i;
    var obj = list[index];
    if (!obj) return;
    wx.setStorageSync("quesExample", obj);
    wx.navigateTo({
      url: './quesExample'
    });
  },
  /**
   * 查看大图
   */
  showBigImg: function(e) {
    var url = e.currentTarget.dataset.url;
    if (!url) return;
    wx.previewImage({
      urls: [url]
    });
  },
  /**
   * 用户授权
   */
  getUserInfo: function(e) {
   
    console.log("统计1", e);
    var that = this;
    var userInfo = e.detail.userInfo;
    if (!userInfo) return;
    userInfo["openid"] = wx.getStorageSync("openId") || app.globalData.userMsg.openid;
    userInfo["unionid"] = wx.getStorageSync("unionId") || app.globalData.userMsg.unionid;
    app.doAjax({
      url: "updateUserMsg",
      method: "post",
      data: {
        data: JSON.stringify({
          wxUserInfo: userInfo,
          userCompany: {
            name: userInfo.nickName + "的团队"
          }
        }),
      },
      success: function(res) {
        app.globalData.userInfo.nickname = userInfo.nickName;
        app.addNewTeam(that.onShow);
       
        console.log("统计2", e);
      }
    });
  },
  /**
   * 显示过期时间说明弹窗
   *
   */
  showDlg: function(e) {
    this.setData({
      dlgShow: true
    });
  },
  /**
   * 隐藏时间说明弹窗
   */
  hidenDlg: function(e) {
    if (this.data.isFreeTickId) return;
    this.setData({
      showDlg1: false,
      showMindDlg: false,
      dlgShow: false
    });
  },
  /**
   * 用户手机号授权
   */
  checkUserMobile: function(e, cb) {
    var that = this;
    if (that.data.userData.phone) {
      return cb();
    }
    var detail = e.detail;
    var iv = detail.iv;
    var encryptedData = detail.encryptedData;
    if (encryptedData) {
      //用户授权手机号
      var userMsg = app.globalData.userMsg || {};
      userMsg["iv"] = iv;
      userMsg["encryptedData"] = encryptedData;
      app.doAjax({
        url: "updatedUserMobile",
        data: userMsg,
        success: function(ret) {
          app.getUserInfo();
          cb && cb();
        }
      });
    }
  },
  /**
   * 用户点赞、取消点赞
   */
  userPraise: function(e) {
    var that = this;
    app.doAjax({
      url: "praisePaper",
      data: {
        paperId: that.data.paperid
      },
      success: function(ret) {
        // app.toast(ret);
        that.toGetPaperDetail();
      }
    });
  },
  /**
   * 滑动切换指示点
   */
  changeActivePointer: function(e) {
    var current = e.detail.current;
    this.setData({
      activePointer: current
    });
  },
  /**
   * 复制微客服信号
   */
  copyIt: function(e) {
    var that = this;
    var txt = "LIN_7890";
    wx.setClipboardData({
      data: txt,
      success(res) {
        that.setData({
          showDlg1: false
        });
      }
    });
  },
  /**
   * 页面隐藏
   */
  onHide: function() {
    this.setData({
      isFreeTickId: false
    });
    this.hidenDlg();
  },
  onShareAppMessage(options) {
    const { teamId } = app,
          paperId = options.target.dataset.id,
          userId = app.globalData.userInfo.id;
    console.log("teamId,paperId,userId",teamId,paperId,userId);
    setTimeout(()=>{
      app.doAjax({
        url: `../hola/drawVoucher?userId=${userId}&paperId=${paperId}&teamId=${teamId}`,
        success: function (res) {
          wx.showModal({
            title: res.msg
          })
        }
      })
    },1000);
    return {
      title: "分享小程序~",
      path: "/index/index",
      imageUrl: "http://ihola.luoke101.com/wxShareImg.png",
    }
  },
  /**继续体验 */
  continueTest: function(e) {
    var t = e.target.dataset.t;
    if (t == 2) {
      wx.setStorageSync("hideLastTestMind", true);
      this.setData({
        oldShareInfo: ""
      });
      return;
    }
    var id = this.data.oldShareInfo.id;
    wx.navigateTo({
      url: '../test/guide?id=' + id
    });
  },
  getNewerTicket: function (e) {
    app.doAjax({
      url: "couponGet",
      method: "post",
      data: {},
      error: function(ret) {
        app.toast(ret.msg);
        // setTimeout(function() {
        //   wx.navigateBack();
        // }, 1500);
      },
      success: function(ret) {
        app.getUserInfo(); //更新用户信息
        console.log(ret);
        ret.forEach(function(node) {
          var column = node.column;
          var paper = node.paper;
          node.endTime = node.endTime ? app.changeDate(node.endTime, "yyyy-MM-dd") : "";
          if (paper) {
            node.name = paper.name;
            node.name1 = "仅限于" + node.name;
          } else if (column) {
            node.name = column.name;
            node.name1 = "仅限于" + node.name + "的测评";
          } else {
            node.name = "通用";
            node.name1 = "可用于兑换平台上任意测评";
          }
        });
        that.setData({
          list: ret
        });
      }
    });
  }
});
