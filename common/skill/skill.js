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
    isShow: {
      type: Boolean,
      value: true
    },
    objectId: {
      type: String,
      value: ""
    },
    price: {
      type: String,
      value: "100"
    },
    actual: {
      type: String,
      value: "39.9"
    },
    free: {
      type: Boolean,
      value: true
    },
    ios: {
      type: Boolean,
      value: true
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
    companyUseName: {
      type: String,
      value: ""
    },
    companyUseNum: {
      type: String,
      value: "15"
    },
    name: {
      type: String,
      value: ""
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
    // changePage: function (e) {
    //   const { id,name } = e.currentTarget.dataset;
    //   wx.navigateTo({
    //       url: `../station/detail?id=${ id }`
    //   });
    // }
  },
  lifetimes: {
    attached() {
      console.log()
    }
  }
});
