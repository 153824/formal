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
    payTrigger: false,
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
    loading: false,
    mobile: "18559297592",
    wechat: "haola72",
    getInOnceAgainst: false,
    giftTrigger: false,
    buyByBuyout: true,
    buyByCounts: false,
    buyByTicket: false,
    ticketCount: 1
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
    if( name ){
      wx.aldstat.sendEvent('访问测评详情', {
        '测评名称': `名称: ${name} id：${id}`
      });
    }
    if (app.isLogin) return;
    app.checkUser = function() {
      that.onShow();
      app.checkUser = null;
    };
  },
  onShow: function(isFresh) {
    if( isFresh ){
      isFresh = true;
    }else{
      isFresh = false;
    }
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
        url: 'evaluationDetail',
        method: 'get',
        data: {
          evaluationId: that.data.paperid
        },
        success: function (res) {
          var hasVoucher = true,
              voucher = 0,
              { voucherInfo } = res,
              evaluation = res,
              isFreeTicket = false,
              shareTicket = 0,
              experienceTicket = 0,
              officialTicket = 0;
          if( Object.keys(voucherInfo).length <= 0 ){
            hasVoucher = false;
          }else{
            for( let i in voucherInfo ){
              voucher += voucherInfo[i];
              if( i === '2' ){
                officialTicket = voucherInfo[i];
              }else if( i === '3' ){
                shareTicket = voucherInfo[i];
              }else if( i === '5' ){
                experienceTicket = voucherInfo[i];
              }
              if( i === '5' || i === '3' ){
                isFreeTicket = true;
              }
            }
          }
          that.setData({
            evaluation,
            hasVoucher,
            voucher,
            isFreeTicket,
            officialTicket,
            shareTicket,
            experienceTicket
          });
        }
      })
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
  toGetPaperDetail: function() {
    var that = this;
    var getEvaluationPromise = new Promise((resolve, reject) => {
      app.doAjax({
        url: "evaluationDetail",
        method: "get",
        data: {
          evaluationId: that.data.paperid,
        },
        success: function (res) {
          if ( !Object.keys(res).length ) {
            wx.showModal({
              title: '提示',
              content: '该测评已被下架',
              success: function() {
                wx.navigateBack();
              }
            });
            return;
          }
          var hasVoucher = true,
              voucher = 0,
              { voucherInfo } = res,
              evaluation = res,
              isFreeTicket = false,
              shareTicket = 0,
              experienceTicket = 0,
              officialTicket = 0,
              payTrigger = false;
          if( Object.keys(voucherInfo).length <= 0 ){
            hasVoucher = false;
          }else{
            for( let i in voucherInfo ){
              voucher += voucherInfo[i];
              if( i === '2' ){
                officialTicket = voucherInfo[i];
              }else if( i === '3' ){
                shareTicket = voucherInfo[i];
              }else if( i === '5' ){
                experienceTicket = voucherInfo[i];
              }
              if( i === '5' || i === '3' ){
                isFreeTicket = true;
              }
            }
          }
          that.setData({
            evaluation,
            hasVoucher,
            voucher,
            isFreeTicket,
            officialTicket,
            shareTicket,
            experienceTicket,
            payTrigger
          });
        }
      })
    }).then(res=>{
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
      ispay: true,
      payTrigger: false
    })
  },
  payForEvaluation: function(){
    this.setData({
      payTrigger: true
    })
  },
  cancelPayForEvaluation: function(){
    this.setData({
      payTrigger: false
    })
  },
  /**
   * 用券购买测评
   */
  useticket: function() {
    var that = this;
    var { ticketCount,voucher,evaluation } = this.data;
    if (!ticketCount) return wx.showToast({
      title: '购买数量不能为空',
      icon: 'none',
      duration: 1200
    });
    var maxCount = voucher;
    if (ticketCount > maxCount) return wx.showToast({
      title: '券数量不足，无法购买',
      icon: 'none',
      duration: 1200
    });
    app.doAjax({
      url: "exchangeByVoucher",
      method: "post",
      data: {
        evaluationId: evaluation.evaluationInfo.id,
        count: ticketCount,
      },
      success: function(res) {
        wx.showToast({
          title: '兑换成功',
        });
        that.showMindDlgFn();
        that.setData({
          buyByTicket: false
        });
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
  gotoguide: function(e) {
    var that = this;
    var { name } = e.currentTarget.dataset;
    var { evaluationInfo,availableCount,buyoutInfo } = that.data.evaluation;
    console.log(buyoutInfo);
    function toNext() {
      app.doAjax({
        url: 'toSharePaper',
        method: 'post',
        data: {
          type: "self",
          id: that.data.paperid,
        },
        success: function(res) {
          console.log(res);
          wx.navigateTo({
            url: '../test/guide?id=' + res.id
          });
          wx.aldstat.sendEvent('点击体验测评', {
            '测评名称': `名称：${ name } id：${ that.data.paperid }`
          });
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
        console.log("First");
        if (res && res.isOld && res.id) {
          var sKey = "oldAnswer" + res.id;
          var oldData = wx.getStorageSync(sKey);
          console.log("Second");
          if (oldData) {
            wx.navigateTo({
              url: '../test/index?pid=' + that.data.paperid + '&id=' + res.id
            });
            console.log("Third");
            return;
          }
          console.log("Fourth");
          wx.navigateTo({
            url: '../test/guide?id=' + res.id
          });
          return;
        }
        if ( +evaluationInfo.price && availableCount > 0 ) {
          wx.showModal({
            title: '体验确认',
            content: '体验将消耗1份可用数量，是否确认体验？',
            success: function(ret) {
              if (ret.confirm) {
                console.log("Fifth");
                toNext();
              }
            }
          });
        } else if( buyoutInfo.hadBuyout ) {
          toNext();
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
  /**
   * 按份购买测评
   */
  payByCounts: function () {
    var that = this,
        { count,evaluation } = this.data;
    if( count !== 0 ){
      app.doAjax({
        url: "buyPaper",
        method: "post",
        data: {
          id: evaluation.evaluationInfo.id,
          count: that.data.count,
          type: 1,
          openid: wx.getStorageSync("openId") || app.globalData.userMsg.openid
        },
        success: function(res){
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
                that.toGetPaperDetail();
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
      })
    }
  },
  /**
   * 按买断购买测评
   */
  payByBuyout: function() {
    var that = this;
    var { evaluationInfo } = this.data.evaluation;
    app.doAjax({
      url: 'buyout',
      method: 'post',
      data: {
        evaluationId: evaluationInfo.id,
        evaluationName: evaluationInfo.name,
        dayOfPeriod: evaluationInfo.buyoutPlans[0].dayOfPeriod,
        openid: wx.getStorageSync("openId") || app.globalData.userMsg.openid,
      },
      success: function (res) {
        console.log(res);
        wx.requestPayment({
          'appId': res.appId,
          'timeStamp': res.timeStamp,
          'nonceStr': res.nonceStr,
          'package': res.package,
          'signType': 'MD5',
          'paySign': res.paySign,
          'success': function(res) {
            that.showMindDlgFn();
            wx.showToast({
              title: '购买成功',
              duration: 2000
            });
            that.setData({
              ispay: false
            });
            setTimeout(function() {
              that.toGetPaperDetail();
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
  },
  closepaypage: function() {
    this.setData({
      ispay: false
    })
  },

  gotodati: function() {
    //发放测评
    var that = this;
    var { evaluationInfo,availableCount= 0,freeEvaluation,buyoutInfo } = that.data.evaluation;
    // wx.aldstat.sendEvent('点击发放测评', {
    //   '测评名称': '名称：' + evaluationInfo.name
    // });
    if ( ( (availableCount || 0 ) === 0 && !freeEvaluation ) && !buyoutInfo.hadBuyout ) {
      app.toast("测评可用数量不足，请先购买或用券兑换测评");
      return;
    }
    wx.navigateTo({
      url: '../store/sharePaper?id=' + evaluationInfo.id + "&count=" + availableCount + "&name="
          + evaluationInfo.name + "&isFree=" + freeEvaluation + "&hadBuyout=" + buyoutInfo.hadBuyout,
    });
    return;
  },
  /**
   * 分享领取测评
   */
  openpopup: function(e, noShowDlg) {},
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
      }
    });
    that.getNewerTicket();
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
    var txt = "haola72";
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
      isFreeTickId: false,
    });
    this.hidenDlg();
  },
  onUnload: function(){
    const { couponGet0,teamRole,isTodayTeam,isfree } = this.data;
    if( !((!couponGet0)&&teamRole==3&&isTodayTeam) ){
      this.setData({
        getInOnceAgainst: true
      });
      app.globalData.getInOnceAgainst = true;
      wx.setStorage({
        key: "getInOnceAgainst",
        data: true,
      })
    }
  },
  onShareAppMessage(options) {
    const { teamId } = app,
          paperId = options.target.dataset.id,
          userId = app.globalData.userInfo.id,
          that = this;
    const { name } = this.data.paperDetail;
    setTimeout(()=>{
      app.doAjax({
        url: `drawVoucher?userId=${userId}&paperId=${paperId}&teamId=${teamId}`,
        success: function (res) {
          app.toast(res);
          wx.showModal({
            title: '',
            content: '领券成功，快去兑换测评吧',
            confirmText:'立即兑换',
            success(res){
              if(res.confirm){
                // 用户点击了确定属性的按钮，对应选择了'男'
                that.setData({
                  isticket: app.isIos || false,
                  ispay: true
                })
              }
            }
          })
          if( res.code == "0" ){
            that.setData({
              freeTick: true
            })
          }
          wx.aldstat.sendEvent('分享得3张券成功', {
            '测评名称': `名称: ${name}`
          });
        }
      })
    },1000);
    return {
      title: "我发现一个不错的人才测评软件，快来看看吧~",
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
    var that = this;
    var { evaluationInfo } = that.data.evaluation;
    app.doAjax({
      url: "drawNoviceVoucher",
      method: "post",
      data: {},
      success: function(ret) {
        app.getUserInfo(); //更新用户信息
        app.toast("领取成功，快去购买兑换测评吧");
        that.setData({
          giftTrigger: true,
        });
        /**
         * @Description: isGetInAgainst 领完5张券，再次进入测评详情页才会显示领取3张券的广告
         * @author: WE!D
         * @args:
         * @return:
         * @date: 2020/6/17
         */
        wx.aldstat.sendEvent('领新人5张券成功', {
          '测评名称': `名称: ${evaluationInfo.name}`
        });
      },
      error: function(res) {
        app.toast(res.msg);
        wx.aldstat.sendEvent('领新人5张券失败', {
          '测评名称': `名称: ${evaluationInfo.name}`
        });
      }
    });
    that.onShow(false);
  },
  goToUserCenter: function () {
    wx.switchTab({
      url: "../user/index"
    })
  },
  /**关闭测评体验券*/
  closeGift: function () {
    this.setData({
      giftTrigger: false
    });
  },
  /**召唤测评体验券*/
  openGift: function () {
    this.setData({
      giftTrigger: true
    })
  },
  /**按年买断*/
  buyByBuyout: function () {
    this.setData({
      buyByBuyout: true,
      buyByCounts: false
    })
  },
  buyByCounts: function () {
    this.setData({
      buyByCounts: true,
      buyByBuyout: false
    })
  },
  servingTrigger: function () {
    this.selectComponent('#serving').callServing();
    this.setData({
      payTrigger: false
    })
  },
  buyByTicket: function () {
    this.setData({
      buyByTicket: true,
      payTrigger: false,
      giftTrigger: false
    })
  },
  cancelBuyByTicket: function(){
    this.setData({
      buyByTicket: false,
    })
  },
  subTicket: function () {
    var { ticketCount } = this.data;
    if( ticketCount <= 0 ){
      ticketCount = 0;
    }else{
      ticketCount = ticketCount - 1;
    }
    this.setData({
      ticketCount
    })
  },
  addTicket: function () {
    var { voucher,ticketCount } = this.data;
    if(  ticketCount >= voucher ){
      app.toast("最多只能兑换"+voucher+"份");
    }else{
      ticketCount = ticketCount + 1;
    }
    this.setData({
      ticketCount
    })
  },
  getPhoneNumber: function (e) {
    var that = this;
    var { iv,encryptedData } = e.detail;
    if (encryptedData) {
      //用户授权手机号
      var userMsg = app.globalData.userMsg || {};
      userMsg["iv"] = iv;
      userMsg["encryptedData"] = encryptedData;
      var updatedUserMobilePromise = new Promise(((resolve, reject) => {
        app.doAjax({
          url: "updatedUserMobile",
          data: userMsg,
          success: function (res) {
            resolve(true);
          },
          fail: function (err) {
            reject(err);
          }
        })
      }));
      updatedUserMobilePromise.then(()=>{
        app.doAjax({
          url: "/userDetail",
          method: "get",
          data: {
            openid: wx.getStorageSync("openId"),
          },
          success: function (res) {
            if( res.data.phone ){
              that.getNewerTicket();
            }
          }
        })
      });
    }
  },
});
