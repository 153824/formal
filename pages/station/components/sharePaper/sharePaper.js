// store/sharePaper.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        retData: {
            img: ""
        },
        maxCount: 0,
        evaluationId: 0,
        evaluationName: '',
        count: 1,
        reportMeet: 1,
        startTime: "",
        endTime: "",
        statusbarHeight: app.globalData.statusbarHeight,
        titleHeight: app.globalData.titleHeight,
        loading: "loading...",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const {necessaryInfo} = options;
        console.log("necessaryInfo： ",necessaryInfo);
        const {count=0, id="", name="", hadBuyout=false, isFree=false, norms="",quesCount=0,estimatedTime=7} = JSON.parse(necessaryInfo);
        this.setData({
            maxCount: count,
            evaluationId: id,
            evaluationName: name,
            hadBuyout: hadBuyout,
            isFree: isFree,
            norms: norms,
            quesCount: quesCount,
            estimatedTime: estimatedTime
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {},
    changeCount: function (e) {
        const that = this;
        const t = e.currentTarget.dataset.t;
        let {maxCount = 0, count, hadBuyout, isFree} = that.data;
        if (t == 1) {
            count -= 1;
        } else if (t == 2) {
            count += 1;
        } else {
            count = e.detail.value;
        }
        if (count > parseInt(maxCount) && !hadBuyout && !isFree) {
            that.setData({
                count: maxCount
            });
            app.toast("最大可选择数量为" + maxCount);
            return;
        }
        if (count < 1) {
            count = 0;
        }
        let countStr = count + "";
        if (countStr.startsWith("0") && countStr.length > 1) {
            countStr = countStr.substring(1, countStr.length);
        }
        count = Number(countStr);
        that.setData({
            count: count
        });
    },
    changeReportMeet: function (e) {
        const {canRead} = e.currentTarget.dataset;
        console.log("canRead: ",e)
        this.setData({
            reportMeet: canRead
        });
    },
    toSharePaper: function () {
        const that = this;
        let {count, evaluationName,norms,evaluationId, hadBuyout, isFree, maxCount, reportMeet,quesCount,estimatedTime} = that.data;
        let costNum = count;
//     wx.aldstat.sendEvent('点击生成测评邀请函', {
//         '测评名称': '名称：' + paperName
//      });
        if (!costNum && !hadBuyout && !isFree) {
            return;
        }
        console.log(costNum, maxCount);
        if (costNum > maxCount && !hadBuyout && !isFree) {
            app.toast("测评可用数量不足");
            return;
        }
        console.log(norms);
        app.doAjax({
            url: "release/share",
            method: "post",
            data: {
                evaluationInfo: {
                    evaluationId: evaluationId,
                    normId: norms[0].normId,
                    freeEvaluation: isFree,
                    evaluationName: evaluationName,
                    quesCount: quesCount,
                    estimatedTime: estimatedTime,
                    avatar: app.globalData.userInfo.avatar
                },
                releaseInfo: {
                    permitSetting: reportMeet === 1 ? "LOOSE" : "STRICT",
                    teamName: app.teamName,
                    releaseCount: costNum
                }
            },
            success: function (res) {
                that.setData({
                    sharePaperInfo: res
                });
                wx.aldstat.sendEvent('成功生成测评邀请函', {
                    '测评名称': '名称：' + paperName
                });
            }
        })
    },
    /**
     * 隐藏分享码
     */
    closeQrCode: function (e) {
        const that = this;
        wx.redirectTo({
            url: `../../../work-base/components/track-detail/track-detail?trackId=${that.data.sharePaperInfo.releaseRecordId}`
        })
    }
})
