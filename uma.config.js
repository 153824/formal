import {scenceMap} from "./user.tag.config";

const umaEvent = {
    // 访问首页
    launchHome: {
        tag: 'LaunchHome',
    },
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
        },
        scene: [1007,1008,1036,1044,1073,1074]
    },

    // 搜索
    searchByKeyword: {
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
        }
    },

    // 点击开始作答
    clickStartReplying: {
        tag: 'ClickStartReplying',
        origin: {
            self: '从详情页自己测',
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
            invite: '从他人邀请我参加的测评',
            share: '从他人分享给我的报告',
        },
        scene: [1007,1008,1036,1044,1073,1074],
        name: '测评名称：'
    },

    // 生成测评邀请函
    generateInvite: {
        tag: 'GenerateInvite',
        origin: {
            detail: '从详情页',
            bench: '从工作台'
        },
        name: '测评名称：',
        route: {
            detail: ['pages/station/components/detail/detail'],
            bench: ['pages/work-base/components/evaluation-more/evaluation-more']
        }
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
        tag: 'getInNavigationByHome',
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
    searchGetInShowcaseMore: {
        tag: 'SearchGetInShowcaseMore',
        name: '搜索页点击最新上架更多'
    },

    // 搜索页点击热门测评更多
    searchGetInHotMore: {
        tag: 'SearchGetInHotMore',
        name: '搜索页点击热门测评更多'
    },

    // 访问作答准备页
    getInReplyGuide: {
        tag: 'GetInReplyGuide',
        origin: {
            self: '从详情页自己测',
            scan: '扫码进入'
        }
    },

    // 点击同意承诺书
    agreeGolden: {
        tag: 'AgreeGolden',
        origin: {
            self: "从详情页自己测",
            scan: "扫码进入"
        },
    },

    // 授权头像成功
    authUserInfoSuccess: {
        tag: 'AuthUserInfoSuccess',
        origin: {
            mine: '个人中心授权',
            record: '记录个人信息授权',
            submit: '提交作答授权',
        }
    },

    // 点击免费体验
    clickFreeEnjoy: {
        tag: 'ClickFreeEnjoy',
        name: '点击免费体验'
    },

    // 点击自己测
    clickSelfOffer: {
        tag: 'ClickSelfOffer',
        name: '点击自己测'
    },

    // 点击测别人
    clickShareOffer: {
        tag: 'ClickShareOffer',
        name: '点击别人'
    },

    // 企业微信-管理员打开
    qyAdmainOpen: {
        tag: 'QYAdmainOpen',
        name: '管理员打开'
    },

    // 企业微信-非管理员打开
    qyMemberOpen: {
        tag: 'QYMemberOpen',
        name: '非管理员打开'
    },

    // 聊天界面发送消息
    sendCustomerServiceMessage: {
        tag: 'SendCustomerServiceMessage',
        origin: {
            home: '从首页',
            evaluation: '从测评详情页',
            mine: '从个人中心',
            search: '从搜索无结果',
            brain: '从落地页1',
            school: '从落地页2',
            social: '从落地页3',
        },
        route: {
            home: ["pages/home/home"],
            evaluation: ["pages/station/components/detail/detail"],
            mine: ["pages/user-center/user-center"],
            search: ["pages/home/subpages/search/search"],
            more: ["pages/home/components/more/more"]
        }
    },

    // 进入客服聊天界面
    getInCustomerService: {
        tag: 'GetInCustomerService',
        origin: {
            home: '从首页',
            evaluation: '从测评详情页',
            mine: '从个人中心',
            search: '从搜索无结果',
            brain: '从落地页1',
            school: '从落地页2',
            social: '从落地页3',
        },
        route: {
            home: ["pages/home/home"],
            evaluation: ["pages/station/components/detail/detail"],
            mine: ["pages/user-center/user-center"],
            search: ["pages/home/subpages/search/search"],
            more: ["pages/home/components/more/more"]
        }
    }
}

function getEnv(_wx,) {
    let text = '微信';
    const isWxWork = _wx.getSystemInfoSync().system.environment === 'wxwork';
    const is3rd = _wx.getExtConfigSync().isCustomVersion === 'true' || (_wx.getExtConfigSync().isCustomVersion && _wx.getExtConfigSync().isCustomVersion.toString() === 'true');
    if(is3rd){
        text = '第三方';
    }
    if(isWxWork){
        text = '企业微信';
    }
    return text;
}

function getTag(_wx) {
    let name = wx.getStorageSync('traceData').toLowerCase();
    return scenceMap[name].alias;
}



export {umaEvent, getEnv, getTag}
