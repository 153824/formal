import {getEnv, getTag, umaEvent} from "../../../../uma.config";

var plugin = requirePlugin("chatbot");
Component({
  properties: {
    focus: Boolean,
    recording: Boolean,
    inputText: String,
    inputing: Boolean,
    height: Number
  },

  data: {
    inputing: false, //值为true时表示正在输入
    inputText: ''
  },
  lifetimes: {
    ready: function() {
      if (this.properties.focus) {
        this.setData({
          focus: this.properties.focus,
          inputing: true
        })
      }
    },
    attached:function () {
      const umaConfig = umaEvent.sendCustomerServiceMessage;
      const routeInfo = getCurrentPages()[getCurrentPages().length - 2]
      const currentRoute = routeInfo.route;
      for (let i in umaConfig.route) {
        if(i === 'more'){
          const {type} = routeInfo.options;
          wx.uma.trackEvent(umaConfig.tag, {"来源": umaConfig.origin[type], "环境": getEnv(wx), "用户场景": getTag(wx)});
        } else {
          if(umaConfig.route[i].includes(currentRoute)){
            wx.uma.trackEvent(umaConfig.tag, {"来源": umaConfig.origin[i], "环境": getEnv(wx), "用户场景": getTag(wx)});
          }
        }
      }
    }
  },
  methods: {
    bindInput: function(e) {
      this.setData({
        inputText: e.detail.value
      });
    },
    // 输入选择
    chooseType: function(e) {
      if (e.currentTarget.dataset.type == "voice") {
        this.setData({
          inputing: false
        });
      } else {
        this.setData({
          inputing: true
        });
      }
    },
    bindconfirmInput: function(e) {
      var that = this;
      var {inputText} = this.data;
      let text = e.detail.value;
      that.triggerEvent("bindInput", inputText);
      that.setData({
        inputText: ''
      })
      const umaConfig = umaEvent.sendCustomerServiceMessage;
      const routeInfo = getCurrentPages()[getCurrentPages().length - 2]
      const currentRoute = routeInfo.route;
      for (let i in umaConfig.route) {
        if(i === 'more'){
          const {type} = routeInfo.options;
          wx.uma.trackEvent(umaConfig.tag, {"来源": umaConfig.origin[type], "环境": getEnv(wx), "用户场景": getTag(wx)});
        } else {
          if(umaConfig.route[i].includes(currentRoute)){
            wx.uma.trackEvent(umaConfig.tag, {"来源": umaConfig.origin[i], "环境": getEnv(wx), "用户场景": getTag(wx)});
          }
        }
      }
    },
    // 返回首页
    showGuideView: function() {
      this.triggerEvent("back");
    },
    // 启动语音
    inputVoiceStart: function() {
      const chat = plugin.getChatComponent();
      chat.inputVoiceStart()
      // this.triggerEvent('inputVoiceStart')
      // plugin.voiceStart(true)
    },
    // 停止语音
    inputVoiceEnd: function() {
      const chat = plugin.getChatComponent();
      chat.inputVoiceEnd()
      // this.triggerEvent('inputVoiceEnd')
    },
  }
});
