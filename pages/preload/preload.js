Page({
    data: {
        choose: [
            {
                text: "我想了解员工心理健康状态/任职风险",
                type: "risk"
            },
            {
                text: "我想测试员工的岗位胜任力",
                type: "social"
            },
            {
                text: "我想开展人才盘点",
                type: "brain"
            },
            {
                text: "我想快速筛选校招中的高潜人才",
                type: "school"
            },
        ]
    },
    onLoad: function (options) {
    },
    goToBrainStore(e) {
        const {type} = e.currentTarget.dataset;
        let url = `/pages/home/components/more/more?type=${type}`;
        wx.redirectTo({
            url: url,
        });
    }
});
