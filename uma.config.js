import {scenceMap} from "./user.tag.config";

const umaEvent = {
    // 访问首页
    launchHome: {
        key: '访问首页',
        tag: 'LaunchHome',
    },
    // 联系客服
    customerService: {
        key: '联系客服',
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
        key: '访问测评详情页',
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
        key: '搜索',
        tag: 'SearchByKeyword',
        content: '搜索内容：',
        count: '搜索结果数：'
    },

    // 授权手机号成功
    authPhoneSuccess: {
        key: '授权手机号成功',
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
        key: '点击开始作答',
        tag: 'ClickStartReplying',
        origin: {
            self: '从详情页自己测',
            scan: '扫码进入'
        },
        name: '测评名称：'
    },

    // 点击提交作答
    submitAnswer: {
        key: '点击提交作答',
        tag: 'SubmitAnswer',
        origin: {
            self: '从详情页自己测',
            scan: '扫码进入'
        },
        name: '测评名称：'
    },

    // 进入报告详情页
    getInReport: {
        key: '进入报告详情页',
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
        key: '生成测评邀请函',
        tag: 'GenerateInvite',
        origin: {
            detail: '从详情页',
            bench: '从工作台'
        },
        name: '测评名称：',
        route: {
            detail: ['pages/station/components/detail/detail'],
            bench: ['pages/work-base/components/evaluation-more/evaluation-more','pages/work-base/work-base']
        }
    },

    // 首页点击搜索
    getInSearchByHome: {
        key: '首页点击搜索',
        tag: 'GetInSearchByHome',
        name: '首页点击搜索'
    },

    // 首页点击Banner
    getInBannerByHome: {
        key: '首页点击Banner',
        tag: 'GetInBannerByHome',
        name: 'banner序号：'
    },

    // 首页点击导航
    getInNavigationByHome: {
        key: '首页点击导航',
        tag: 'getInNavigationByHome',
        name: '导航名称：'
    },

    // 搜索页点击分类搜索
    searchGetInTypeByHome: {
        key: '搜索页点击分类搜索',
        tag: 'SearchGetInTypeByHome',
        name: '分类名称：'
    },

    // 搜索页点击最新上架里的测评
    searchGetInShowcaseEvaluation: {
        key: '搜索页点击最新上架里的测评',
        tag: 'SearchGetInShowcaseEvaluation',
        name: '测评名称：'
    },

    // 搜索页点击热门测评里的测评
    searchGetInHotEvaluation: {
        key: '搜索页点击热门测评里的测评',
        tag: 'SearchGetInHotEvaluation',
        name: '测评名称：'
    },

    // 搜索页点击最新上架更多
    searchGetInShowcaseMore: {
        key: '搜索页点击最新上架更多',
        tag: 'SearchGetInShowcaseMore',
        name: '搜索页点击最新上架更多'
    },

    // 搜索页点击热门测评更多
    searchGetInHotMore: {
        key: '搜索页点击热门测评更多',
        tag: 'SearchGetInHotMore',
        name: '搜索页点击热门测评更多'
    },

    // 访问作答准备页
    getInReplyGuide: {
        key: '访问作答准备页',
        tag: 'GetInReplyGuide',
        origin: {
            self: '从详情页自己测',
            scan: '扫码进入'
        },
        scene: [1007,1011,1012,1013,1047,1048,1049]
    },

    // 点击同意承诺书
    agreeGolden: {
        key: '点击同意承诺书',
        tag: 'AgreeGolden',
        origin: {
            self: "从详情页自己测",
            scan: "扫码进入"
        },
    },

    // 授权头像成功
    authUserInfoSuccess: {
        key: '授权头像成功',
        tag: 'AuthUserInfoSuccess',
        origin: {
            mine: '个人中心授权',
            record: '记录个人信息授权',
            submit: '提交作答授权',
        }
    },

    // 点击免费体验
    clickFreeEnjoy: {
        key: '点击免费体验',
        tag: 'ClickFreeEnjoy',
        name: '点击免费体验'
    },

    // 点击自己测
    clickSelfOffer: {
        key: '点击自己测',
        tag: 'ClickSelfOffer',
        name: '点击自己测'
    },

    // 点击测别人
    clickShareOffer: {
        key: '点击测别人',
        tag: 'ClickShareOffer',
        name: '点击别人'
    },

    // 企业微信-管理员打开
    qyAdmainOpen: {
        key: '企业微信-管理员打开',
        tag: 'QYAdmainOpen',
        name: '管理员打开'
    },

    // 企业微信-非管理员打开
    qyMemberOpen: {
        key: '企业微信-非管理员打开',
        tag: 'QYMemberOpen',
        name: '非管理员打开'
    },

    // 聊天界面发送消息
    sendCustomerServiceMessage: {
        key: '聊天界面发送消息',
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
        key: '进入客服聊天界面',
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
    },

    // 弹出授权手机弹窗
    authPhoneCount: {
        key: '弹出授权手机弹窗',
        tag: 'AuthPhoneCount',
        origin: {
            experience: '免费体验',
            pay: '购买测评',
            contact: '详情页联系客服',
            home: '首页在线咨询',
            search: '搜索无结果页联系顾问',
            bench: '工作台登录',
            enjoy: '免费体验',
        }
    },

    // 点击立即使用
    clickUsingRightNow: {
        key: '点击立即使用',
        tag: 'ClickUsingRightNow'
    },

    // 点击专家解读
    clickMasterParse: {
        key: '点击报告解读',
        tag: 'ClickReportParse',
    },

    // 提交报告表单
    submitReportForm: {
        key: '点击报告解读',
        tag: 'SubmitReportForm',
    },

    // 首页访问详情页
    evaluationDetailByHome: {
        key: '首页访问详情页',
        tag: 'EvaluationDetailByHome'
    },

    // 访问测评详情页（新人券）
    evaluationDetailByBeginner: {
        key: '访问测评详情页（新人券）',
        tag: 'EvaluationDetailByBeginner'
    },

    // 弹出免费测评任用卡
    popupFreeCard: {
        key: '弹出免费测评任用卡',
        tag: 'PopupFreeCard'
    },

    // 立即领取测评任用卡
    getFreeCardRightNow: {
        key: '立即领取测评任用卡',
        tag: 'GetFreeCardRightNow'
    }
}

const scanScene = [1007,1011,1012,1013,1047,1048,1049]

function getEnv(_wx_) {
    let text = '微信';
    const isWxWork = _wx_.getSystemInfoSync().system.environment === 'wxwork';
    const is3rd = _wx_.getExtConfigSync().isCustomVersion === 'true' || (_wx_.getExtConfigSync().isCustomVersion && _wx_.getExtConfigSync().isCustomVersion.toString() === 'true');
    if(is3rd){
        text = '第三方';
    }
    if(isWxWork){
        text = '企业微信';
    }
    return text;
}

function getTag(_wx_) {
    let name = wx.getStorageSync('traceData').toLowerCase();
    return scenceMap[name].alias;
}

class Tracker {
    constructor(instance) {
        this.instance = instance;
        this.env = this.getEnv();
        this.tag = this.getTag();
        this.preset = ['env', 'tag']
    }

    generate(tagName, extraData) {
        const instance = this.instance
        if(!instance.getStorageSync('traceEnabled')){
            console.warn('内部人员不计入数据统计');
            return;
        }
        let targetData = {
            env: this.getEnv(),
            tag: this.getTag()
        };
        switch (tagName) {
            // case 'LaunchHome':
            // case 'CustomerService':
            // case 'evaluationDetail':
            // case 'searchByKeyword':
            // case 'authPhoneSuccess':
            // case 'clickStartReplying':
            // case 'submitAnswer':
            // case 'getInReport':
            default:
                targetData = Object.assign(targetData, extraData);
        }
        console.log('generate: ',targetData);
        instance.uma.trackEvent(tagName, targetData)
    }

    getEnv() {
        let text = '微信';
        const instance = this.instance
        const isWxWork = instance.getSystemInfoSync().environment === 'wxwork';
        const is3rd = instance.getExtConfigSync().isCustomVersion === 'true' || (instance.getExtConfigSync().isCustomVersion && instance.getExtConfigSync().isCustomVersion.toString() === 'true');
        if(is3rd){
            text = '第三方';
        }
        if(isWxWork){
            text = '企业微信';
        }
        return text;
    }

    getTag() {
        const {instance} = this;
        let name = instance.getStorageSync('traceData').toLowerCase();
        return scenceMap[name].alias;
    }
}

export {umaEvent, getEnv, getTag, Tracker, scanScene}
