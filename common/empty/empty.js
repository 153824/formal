/***********************************************************************************************************************
 * @NAME: WEID       /       @DATE: 2020/8/20      /       @DESC: 变量注释模板(新增变量务必添加)
 * title: 组件的标题
 * type: 组件类型
 * paperId: 测评ID
 * isShow: 组件控制器
 * status: 是否撤回(3-是,默认-1)
 * ********************************************************************************************************************/
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: "暂时没有人完成测评"
    },
    type: {
      type: String,
      value: "default"
    },
    paperId: {
      type: String,
      value: ""
    },
    isShow: {
      type: Boolean,
      value: true
    },
    customClass: {
      type: String,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    status: 3
  },

  /**
   * 组件的方法列表
   */
  methods: {
    recallEvaluation: function(e) {
      const that = this;
      wx.showModal({
        title: '提示',
        content: '确认撤销该分享？',
        success: function(ret) {
          if (ret.confirm) {
            app.doAjax({
              url: 'release/revoke',
              method: 'post',
              data: {
                releaseRecordId: that.properties.paperId
              },
              success: function(res) {
                app.toast('撤回成功，测评已返还');
                setTimeout(that.onShow, 1500);
                that.setData({
                  isCancel: true
                });
                wx.redirectTo({
                  url: `track-detail?status=REVOKED&trackId=${that.properties.paperId}`,
                })
              }
            });
          }
        }
      });
    },
  }
})
