Page({
    data: {},
    onLoad: function (options) {
        if(wx.canIUse("hideHomeButton")){
            wx.hideHomeButton();
        }
    }
});
