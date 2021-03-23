const app = getApp()
Page({
    data: {
        drafts: [],
        questions: [],
        popupTrigger: false,
        popupInfo: {
            char: 2,
            content: "360°评估"
        },
        require: [],
        scrollIntoViewID: "",
        surveyInfo: {
            name: '',
            fbEId: '',
            surveyId: ''
        },
        message: "",
        isArriveToLower: true
    },
    onLoad: function (options) {
        const surveyInfo = JSON.parse(options.surveyInfo);
        this.getDraft(surveyInfo.surveyId).then(res => {
            this.setData({
                drafts: res
            })
        }).catch(err => {
            console.error(err)
        });
        this.getQuestions(surveyInfo.fbEId).then(res => {
            this.setData({
                questions: res
            })
        }).catch(err => {
            console.error(err)
        });
        this.setData({
            surveyInfo: surveyInfo
        });
        wx.setNavigationBarTitle({
            title: surveyInfo.name
        });
    },
    getDraft(surveyId) {
        const {surveyInfo} = this.data;
        const drafts = new Promise((resolve, reject) => {
            app.doAjax({
                url: `wework/evaluations/360/surveys/${surveyInfo.surveyId || surveyId}/drafts`,
                method: 'GET',
                success(res) {
                    resolve(res);
                },
                error(err) {
                    reject(err);
                }
            })
        });
        return drafts;
    },
    getQuestions(feedbackEvaluationId) {
        const {surveyInfo} = this.data;
        const questions = new Promise((resolve, reject) => {
            app.doAjax({
                url: `wework/evaluations/360/response/${surveyInfo.fbEId || feedbackEvaluationId}/questions`,
                method: 'GET',
                success(res) {
                    resolve(res);
                },
                error(err) {
                    reject(err);
                }
            })
        });
        return questions;
    },
    checkedOption(e) {
        const {optionIdx, questionIdx, draftIdx} = e.currentTarget.dataset;
        const draftsCopy = this.data.drafts;
        const questionsCopy = this.data.questions;
        const respondItem = {
            optionIdx: optionIdx
        };
        const content = questionsCopy[questionIdx].options[optionIdx];
        draftsCopy[draftIdx].responds[questionIdx] = respondItem;
        this.setData({
            drafts: draftsCopy,
            popupTrigger: false
        });
        this.saveDrafts()
        this.initPopup({optionIdx, content});
    },
    saveText(e) {
        const text = e.detail.value;
        const draftsCopy = this.data.drafts;
        const {optionIdx, questionIdx, draftIdx} = e.currentTarget.dataset;
        const targetText = {
            text: text
        }
        draftsCopy[draftIdx].responds[questionIdx] = targetText;
        this.setData({
            drafts: draftsCopy
        });
        this.saveDrafts()
    },
    initPopup(data = {}) {
        if (!Object.keys(data).length) {
            console.warn("initPopup: data数据为空")
        }
        const {optionIdx, content} = data;
        const popupInfo = {
            char: optionIdx,
            content: content
        };
        this.setData({
            popupTrigger: true,
            popupInfo,
        });
        setTimeout(() => {
            this.setData({
                popupTrigger: false,
            })
        }, 1000);
    },
    _verify(index) {
        if (!index) {
            return;
        }
        this.setData({
            scrollIntoViewID: `y-${index - 1}`
        })
    },
    saveDrafts() {
        const {surveyInfo, drafts} = this.data;
        const draftPromise = new Promise((resolve, reject) => {
            app.doAjax({
                url: `wework/evaluations/360/surveys/${surveyInfo.surveyId}/drafts`,
                method: 'POST',
                data: drafts,
                noLoading: true,
                success(res) {
                    resolve(res)
                },
                error(err) {
                    reject(err)
                }
            })
        });
        draftPromise.catch(err => {
            console.error('上传草稿失败！', err)
            app.toast('实时保存失败')
        })
    },
    submit() {
        const {surveyInfo, drafts} = this.data;
        const answer = new Promise((resolve, reject) => {
            app.doAjax({
                url: `wework/evaluations/360/surveys/${surveyInfo.surveyId}/answers`,
                method: 'POST',
                data: drafts,
                success(res) {
                    resolve(res)
                },
                error(err) {
                    reject(err)
                }
            })
        });
        answer.then(res => {
            app.toast("答案保存成功")
            this.done()
        }).catch(err => {
            app.toast("您还有未完成的选项")
            this._verify(err.msg);
        })
    },
    done() {
        wx.navigateTo({
            url: "/pages/360/subpages/end/end"
        })
    },
    displaySubmitButton() {
        this.setData({
            isArriveToLower: true,
        })
    }
});
