function remove(wx,key,prefix) {
    const keys = wx.getStorageInfoSync().keys;
    keys.forEach(function (n) {
        if (n.indexOf("oldAnswer") == 0 && n != sKey) {
            wx.removeStorageSync(n);
        }
    });
}
