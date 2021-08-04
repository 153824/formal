const role = {
    reply: '答题用户',
    travel: '非答题用户'
}
const env = {

}
const umaEvent = {
    // 联系客服
    customerService: {
        tag: 'CustomerService',
        origin: {
            home: '从首页',
            evaluation: '从测评详情页',
            mine: '从个人中心',
            search: '从搜索无结果',
            brain: '从落地页1',
            school: '从落地页2',
            social: '从落地页3',
        },
    },
    // 访问测评详情页
    evaluationDetail: {
        tag: 'EvaluationDetail',
        origin: {
            home: '从首页',
            bench: '从工作台',
            card: '从小程序卡片',
            showcase: '从最新上架',
            hot: '从热门测评',
            classify: '从分类搜索',
            search: '从搜索结果'
        }
    },
    // 访问作答准备页
    getInReplyGuide: {
        tag: 'GetInReplyGuide',
        origin: {
            self: '从详情页自己测',

        }
    },
    // 搜索
    searchKeyword: {
        tag: 'SearchByKeyword',
        content: '搜索内容：',
        count: '搜索结果数：'
    },
    // 授权手机号成功
    authPhoneSuccess: {
        tag: 'AuthPhoneSuccess',
        origin: {
            experience: '免费体验',
            pay: '购买测评',
            contact: '详情页联系客服',
            home: '首页在线咨询',
            search: '搜索无结果页联系顾问',
            bench: '工作台登录',
            mine: '个人中心登录'
        }
    },
    // 点击开始作答
    clickStartReplying: {
        tag: 'ClickStartReplying',
        origin: {
            self: '详情页自己测',
            scan: '扫码进入'
        },
        name: '测评名称：'
    },
    // 点击提交作答
    submitAnswer: {
        tag: 'SubmitAnswer',
        origin: {
            self: '从详情页自己测',
            scan: '扫码进入'
        },
        name: '测评名称：'
    },
    // 进入报告详情页
    getInReport: {
        tag: 'GetInReport',
        origin: {
            self: '从详情页自己测',
            bench: '从工作台',
            record: '从发放记录',
            card: '从分享链接卡片',
        },
        name: '测评名称：'
    },
    // 生成测评邀请函
    generateInvite: {
        tag: 'GenerateInvite',
        origin: {
            detail: '从详情页',
            bench: '从工作台'
        },
        name: '测评名称：'
    },
    // 首页点击搜索
    getInSearchByHome: {
        tag: 'GetInSearchByHome',
        name: '首页点击搜索'
    },
    // 首页点击Banner
    getInBannerByHome: {
        tag: 'GetInBannerByHome',
        name: 'banner序号：'
    },
    // 首页点击导航
    getInNavigationByHome: {
        tag: 'GetInBannerByHome',
        name: '导航名称：'
    },
    // 搜索页点击分类搜索
    searchGetInTypeByHome: {
        tag: 'SearchGetInTypeByHome',
        name: '分类名称：'
    },
    // 搜索页点击最新上架里的测评
    searchGetInShowcaseEvaluation: {
        tag: 'SearchGetInShowcaseEvaluation',
        name: '测评名称：'
    },
    // 搜索页点击热门测评里的测评
    searchGetInHotEvaluation: {
        tag: 'SearchGetInHotEvaluation',
        name: '测评名称：'
    },
    // 搜索页点击最新上架更多
    searchGetInPublishMore: {
        tag: 'SearchGetInPublishMore',
        name: '搜索页点击最新上架更多'
    },
    // 搜索页点击热门测评更多
    searchGetInHotMore: {
        tag: 'SearchGetInHotMore',
        name: '搜索页点击热门测评更多'
    },
}
export {umaEvent}
