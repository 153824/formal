// common/skill/skill.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: ""
    },
    width: {
      type: Number,
      value: 120
    },
    marginTop: {
      type: Number,
      value: 30
    },
    marginRight: {
      type: Number,
      value: 40
    },
    marginBottom: {
      type: Number,
      value: 30
    },
    marginLeft: {
      type: Number,
      value: 40
    },
    titleFontSize: {
      type: Number,
      value: 32
    },
    subTitleFontSize: {
      type: Number,
      value: 24
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    directTo: function(){
      wx.navigateTo({
        url: './detail',
      })
    }
  }
})
