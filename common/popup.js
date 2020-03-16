// common/popup/popup.js
Component({
  properties: {

  },

  data: {
    testnum: 0
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      this.setData({
        testnum: wx.getStorageSync("testNum")
      })
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    closepopup: function() {
      this.triggerEvent('myevent', {
        isok: false
      })
    }, 
    savepicture: function() {

      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success() {
                console.log('授权成功')
                wx.downloadFile({
                  url: 'https://ihola.luoke101.com/banner09201.png',
                  success: function(res) {
                    console.log(res);
                    //图片保存到本地
                    wx.saveImageToPhotosAlbum({
                      filePath: res.tempFilePath,
                      success: function(data) {
                        wx.showToast({
                          title: '保存成功',
                          icon: 'success',
                          duration: 2000
                        })
                      },
                      fail: function(err) {
                        console.log(err);
                        if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                          console.log("当初用户拒绝，再次发起授权")
                          wx.openSetting({
                            success(settingdata) {
                              console.log(settingdata)
                              if (settingdata.authSetting['scope.writePhotosAlbum']) {
                                console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                              } else {
                                console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                              }
                            }
                          })
                        }
                      },
                      complete(res) {
                        console.log(res);
                      }
                    })
                  }
                })
              }
            })
          } else {
            wx.downloadFile({
              url: 'https://ihola.luoke101.com/banner09201.png',
              success: function(res) {
                console.log(res);
                //图片保存到本地
                wx.saveImageToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function(data) {
                    wx.showToast({
                      title: '保存成功',
                      icon: 'success',
                      duration: 2000
                    })
                  },
                  fail: function(err) {
                    console.log(err);
                    if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                      console.log("当初用户拒绝，再次发起授权")
                      wx.openSetting({
                        success(settingdata) {
                          console.log(settingdata)
                          if (settingdata.authSetting['scope.writePhotosAlbum']) {
                            console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                          } else {
                            console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                          }
                        }
                      })
                    }
                  },
                  complete(res) {
                    console.log(res);
                  }
                })
              }
            })
          }
        }
      })
    },


    sharefriend: function() {
      var that = this;
      wx.showShareMenu({
        withShareTicket: true,
        success: function(res) {
          wx.showToast({
            title: '分享成功',
          })
          that.setData({
            testnum: that.data.testnum*1 + 1
          })
          wx.setStorageSync("testNum", that.data.testnum)
          console.log(wx.getStorageSync("testNum"))
       
        },
        fail: function() {
          wx.showModal({
            title: '提示',
            content: '分享失败',
          })
        }
      })

    }
  }
})