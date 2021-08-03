// common/serving/serving.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        image: {
            type: String,
            value: "https://ihola.luoke101.com/icon%40icon-serving.png"
        },
        right: {
            type: String,
            value: "50rpx"
        },
        bottom: {
            type: String,
            value: "50rpx"
        },
        area: {
            type: String,
            value: "home"
        },
        visibility: {
            type: String,
            value: 'visible'
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        showServing: false
    },

    /**
     * 组件的方法列表
     */
    methods: {
        callServing: function (e) {
            const {area} = this.properties;
            this.setData({
                showServing: true
            });
        },
        goToServer() {
            wx.navigateTo({
                url: '/pages/customer-service/customer-service'
            })
        }
    }
});
