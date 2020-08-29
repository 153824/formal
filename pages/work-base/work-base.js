Page({
    data: {
        active: 0
    },
    onLoad: function (options) {

    },
    openSharePaper: (e)=>{
        const { id,name } = e.currentTarget.dataset;
        if( id ){
            wx.navigateTo({
                url: `../sharePaper/sharePaper?id=${id}&name=${name}`,
            })
        }
    }
});
