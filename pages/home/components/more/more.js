const app = getApp()
Page({
    data: {
        statusbarHeight: app.globalData.statusbarHeight,
        titleHeight: app.globalData.titleHeight,
        type: "",
        liner: ""
    },
    onLoad: function (options) {
        if (options && options.type) {
            let liner = "liner-lightpink";
            switch (options.type) {
                case "school":
                    liner = "liner-lightgreen";
                    break;
                case "social":
                    liner = "liner-lightpink";
                    break;
                case "brain":
                    liner = "liner-lightblue";
                    break;
                case "risk":
                    liner = "liner-lightorange";
                    break;
            }
            this.setData({
                type: options.type,
                liner: liner
            })
        }
    },
    goBack() {
        wx.switchTab({
            url: "/pages/home/home"
        })
    }
});
