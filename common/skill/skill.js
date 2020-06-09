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
    subtitle: {
      type: String,
      value: ""
    },
    image: {
      type: String,
      value: "../../img/index/classic_test@2x.png"
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
      value: 28
    },
    subTitleFontSize: {
      type: Number,
      value: 24
    },
    objectId: {
      type: String,
      value: ""
    },
    companyUseName: {
      type: String,
      value: ""
    },
    companyUseNum: {
      type: String,
      value: "15"
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
    changePage: function (e) {
      const { id } = e.currentTarget.dataset;
      console.log("changePage", e);
      wx.navigateTo({
          url: `../station/detail?id=${ id }`
      });
    }
  },
  lifetimes: {
    attached() {
      console.log()
    }
  }
});
