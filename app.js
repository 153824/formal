import {getEnv, getTag, umaEvent} from "./uma.config";
import {scenceMap} from "./user.tag.config";

/***********************************************************************************************************************
 * @NAME: WEID       /       @DATE: 2020/7/21      /       @DESC: 变量注释模板(新增变量务必添加)
 * qiniuUpload: 七牛云
 * push: 小神推
 * deBug: 调试模式
 * debuggerQueue: 请求时长
 * region: 区域码
 * domain: 域名
 * uptokenURL: 令牌
 * shouldUseQiniuFileName: 文件ID生成规则
 * defaultShareObj: 默认好友分享图片
 * teamName: 团队名字
 * teamId: 团队ID
 * teamRole: 团队角色
 * isLogin: 登录状态
 * isIos: 是否为ios端
 * qiniuUpload: 七牛配置
 * isIphoneX: 苹果X
 * host: 主机地址
 * globalData: 全局数据
 * wxWork: 是否为企业微信
 * appid: 小程序标识
 * userInfo: 用户信息
 * userMsg: 用户信息
 * team: 当前团队
 * teams: 团队列表
 * titleHeight: 系统状态栏高度
 * statusbarHeight: 小程序状态栏高度
 * windowHeight: 视口高度
 * windowWidth: 视口宽度
 * screenHeight: 屏幕高度
 * pixelRate: dpi
 * assistant 面试助手
 * ********************************************************************************************************************/
const uma = require('umtrack-wx');
const qiniuUpload = require("./utils/qiniuUpload");
const plugin = requirePlugin("chatbot");
let isUpload = false;
qiniuUpload.init({
    region: 'SCN',
    domain: 'ihola.luoke101.com',
    uptokenURL: 'https://api.haola101.com/hola/getQiNiuToken',
    shouldUseQiniuFileName: false
});
App({
    defaultShareObj: {
        imageUrl: "http://ihola.luoke101.com/wxShareImg.png",
    },
    teamName: "",
    teamId: "",
    teamRole: "",
    isIos: false,
    isTest: false,
    qiniuUpload: qiniuUpload,
    isIphoneX: false,
    isReLaunch: false,
    otherPageReLaunchTrigger: true,
    quitPage: "",
    host: (() => {
        if (wx.getAccountInfoSync().miniProgram.appId === 'wx85cde7d3e8f3d949') {
            return "https://api.haola101.com";
        } else {
            return "https://uat.api.haola101.com";
        }
    })(),
    globalData: {
        appid: wx.getAccountInfoSync().miniProgram.appId,
        userInfo: null,
        userMsg: {},
        team: null,
        teams: [],
        titleHeight: 0,
        statusbarHeight: 0,
        windowHeight: 0,
        screenHeight: 0,
        pixelRate: 0,
        assistant: ["5efed573b1ef0200062a85f7"]
    },
    wxWorkInfo: {
        isWxWork: false,
        isWxWorkAdmin: false,
        isWxWorkSuperAdmin: false,
        wxWorkUserInfo: {},
    },
    wx3rdInfo: {
        is3rd: false,
        is3rdAdmin: false,
        wx3rdCompanyInfo: {}
    },
    umengConfig: {
        // 悠悠测评 5f7fc58180455950e49eaa0d
        // 好啦测评 5f6d5902906ad81117141b70
        appKey: (() => {
            if (wx.getAccountInfoSync().miniProgram.appId === 'wx85cde7d3e8f3d949') {
                return "5f6d5902906ad81117141b70";
            } else {
                return "5f7fc58180455950e49eaa0d";
            }
        })(), //由友盟分配的APP_KEY
        // 使用Openid进行统计，此项为false时将使用友盟+uuid进行用户统计。
        // 使用Openid来统计微信小程序的用户，会使统计的指标更为准确，对系统准确性要求高的应用推荐使用Openid。
        useOpenid: true,
        // 使用openid进行统计时，是否授权友盟自动获取Openid，
        // 如若需要，请到友盟后台"设置管理-应用信息"(https://mp.umeng.com/setting/appset)中设置appId及secret
        autoGetOpenid: true,
        enableVerify: true,
        debug: false, //是否打开调试模式
        uploadUserInfo: true // 自动上传用户信息，设为false取消上传，默认为false
    },
    onLaunch: function (options) {
        const updateManager = wx.getUpdateManager();
        updateManager.onUpdateReady(function () {
            isUpload = true;
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                        isUpload = false
                    }
                }
            })
        });

        updateManager.onUpdateFailed(function () {
            wx.showModal({
                title: '更新提示',
                content: '新版本下载失败，请删除小程序后再次进入',
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                        isUpload = false
                    }
                }
            })
        });

        const referrerInfo = options.referrerInfo;
        const menuBtnObj = wx.getMenuButtonBoundingClientRect();
        const sysMsg = wx.getSystemInfoSync();
        this.isIphoneX = false;
        this.isIos = false;
        this.fromAppId = '';
        this.teamId = '';
        this.rate = sysMsg.windowWidth / 750;
        if (referrerInfo && referrerInfo.appid) {
            this.fromAppId = referrerInfo.appid
        }
        if (wx.getExtConfigSync().isCustomVersion === 'true' || (wx.getExtConfigSync().isCustomVersion && wx.getExtConfigSync().isCustomVersion.toString() === 'true')) {
            console.error('wx.getExtConfigSync().isCustomVersion: ', wx.getExtConfigSync().isCustomVersion)
            this.wx3rdInfo.is3rd = true;
        }
        wx.onMemoryWarning(function (res) {
            console.warn('onMemoryWarningReceive', res)
        });
        /*获取机型 **/
        if (sysMsg.model.indexOf('iPhone X') !== -1) {
            this.isIphoneX = true
        }
        if (sysMsg.system.indexOf('iOS') !== -1) {
            this.isIos = true
        }
        if (sysMsg.environment === 'wxwork') {
            console.error('sysMsg.environment: ', sysMsg.environment);
            this.wxWorkInfo.isWxWork = true;
        }
        const scene = wx.getLaunchOptionsSync();
        this.getAuthCode();
        /**
         * @Description: 获取设置
         * @author: WE!D
         * @name: wx.getSetting
         * @args: Object
         * @return: Object
         * @date: 2020/7/21
         */
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: res => {
                            /** 可以将 res 发送给后台解码出 unionId */
                            this.globalData.userInfo = Object.assign(res.userInfo,
                                this.globalData.userInfo || {})
                            /** 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回 */
                            /** 所以此处加入 callback 以防止这种情况 */
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        },
                    })
                }
            },
        });

        /**
         * @Description: 获取设备信息
         * @author: WE!D
         * @name: wx.getSystemInfo
         * @args: Object
         * @return: Object
         * @date: 2020/7/21
         */
        wx.getSystemInfo({
            success: (res) => {
                let {windowHeight, screenHeight, windowWidth} = res;
                let statusbarHeight = res.statusBarHeight,
                    titleHeight = menuBtnObj.height + (menuBtnObj.top - statusbarHeight) * 2;
                this.globalData.statusbarHeight = statusbarHeight;
                this.globalData.titleHeight = titleHeight;
                this.globalData.windowHeight = windowHeight;
                this.globalData.windowWidth = windowWidth;
                this.globalData.screenHeight = screenHeight;
                this.globalData.pixelRate = 750 / windowWidth;
            },
            fail(err) {
                console.error(err)
            },
        })
    },

    onShow: function () {
        const pages = ["pages/home/home", "pages/work-base/work-base", "pages/user-center/user-center"];
        const scenes = [1007, 1008, 1011, 1012, 1013, 1014, 1017, 1036, 1037, 1038, 1044, 1047, 1048, 1049, 1073, 1074, 1088, 1096, 1107, 1113, 1114, 1119];
        let currentPage = "";
        const sceneOption = wx.getLaunchOptionsSync();
        try {
            currentPage = getCurrentPages()[getCurrentPages().length - 1].route || "";
        } catch (e) {

        }
        if ((this.wxWorkInfo.isWxWork || this.wx3rdInfo.is3rd) && this.isReLaunch && pages.includes(this.quitPage) && pages.includes(currentPage) && !scenes.includes(sceneOption.scene)) {
            const that = this;
            wx.switchTab({
                url: '/pages/work-base/work-base',
                success: res => {
                    that.isReLaunch = false;
                },
                fail: function (err) {
                    console.error(err);
                }
            })
        }
    },

    onHide() {
        if (this.wxWorkInfo.isWxWork || this.wx3rdInfo.is3rd) {
            this.isReLaunch = true;
            this.quitPage = getCurrentPages()[getCurrentPages().length - 1].route;
        }
    },

    /**
     * @Description: 用户登录
     * @author: WE!D
     * @name: userLogin
     * @args: String
     * @return: Promise
     * @date: 2020/7/21
     */
    userLogin: function (code) {
        const that = this;
        let targetTokenInfo = {}
        this.getPrueAuthCode(code)
            .then(res => {
                try {
                    const userInfo = wx.getStorageSync('userInfo') || {};
                    const {authCode, tokenInfo} = res;
                    if (tokenInfo && tokenInfo.accessToken) {
                        targetTokenInfo = tokenInfo;
                        userInfo.tokenInfo = tokenInfo;
                        wx.setStorageSync('userInfo', userInfo);
                    }
                    wx.setStorageSync('authCode', authCode);
                } catch (e) {
                    return Promise.reject(e);
                }
                return Promise.resolve(res);
            })
            .then(res => {
                if (res && res.tokenInfo) {
                    return this.getAdminInfo();
                }
                const targetRes = {
                    isWxWork: false,
                    is3rd: that.wx3rdInfo.is3rd,
                    tokenInfo: {}
                }
                return Promise.resolve(targetRes);
            })
            .then(res => {
                if (that.checkUserInfo) {
                    res.isWxWork = false;
                    res.is3rd = that.wx3rdInfo.is3rd;
                    res.tokenInfo = targetTokenInfo;
                    that.checkUserInfo(res);
                }
            })
            .catch(err => {
                console.log(err);
            });
    },

    /**
     * @Description:
     * @author: WE!D
     * @name:
     * @args:
     * @return:
     * @date: 2020/9/8
     */
    wxWorkUserLogin: function (code) {
        let targetTokenInfo = {}
        const that = this;
        this.getPrueAuthCode(code)
            .then(res => {
                try {
                    const userInfo = wx.getStorageSync('userInfo') || {};
                    const {authCode, tokenInfo} = res;
                    if (tokenInfo && tokenInfo.accessToken) {
                        targetTokenInfo = tokenInfo;
                        userInfo.tokenInfo = tokenInfo;
                        wx.setStorageSync('userInfo', userInfo);
                    }
                    wx.setStorageSync('authCode', authCode);
                } catch (e) {
                    return Promise.reject(e);
                }
                return Promise.resolve(res);
            })
            .then(res => {
                if (res && res.tokenInfo) {
                    return this.getAdminInfo();
                }
                const targetRes = {
                    isWxWork: true,
                    is3rd: that.wx3rdInfo.is3rd,
                    tokenInfo: {}
                }
                return Promise.resolve(targetRes);
            })
            .then(res => {
                if(res.isAdmin){
                    const umaConfig = umaEvent.qyAdmainOpen;
                    wx.uma.trackEvent(umaConfig.tag, {open: umaConfig.name, env: getEnv(wx), tag: getTag(wx)});
                } else {
                    const umaConfig = umaEvent.qyMemberOpen;
                    wx.uma.trackEvent(umaConfig.tag, {open: umaConfig.name, env: getEnv(wx), tag: getTag(wx)});
                }
                if (that.checkUserInfo) {
                    res.isWxWork = true;
                    res.is3rd = that.wx3rdInfo.is3rd;
                    res.tokenInfo = targetTokenInfo;
                    that.checkUserInfo(res);
                }
            });
    },

    checkOfferType(receiveRecordId) {
        const p = new Promise((resolve, reject) => {
            this.doAjax({
                url: 'reports/check_type',
                method: 'get',
                data: {
                    receiveRecordId
                },
                success(res) {
                    resolve(res.data)
                },
                error(err) {
                    reject(err)
                }
            })
        });
        return p;
    },

    /**
     * @Description: 时间转换函数
     * @author: WE!D
     * @name: changeDate
     * @args: Date,String
     * @return: String
     * @date: 2020/7/21
     */
    changeDate: function (time, dateType) {
        //日期格式化处理
        //dateType示例：yyyy-MM-dd hh:mm:ss
        time = new Date(time);
        var y = time.getFullYear();
        var M = time.getMonth() + 1;
        var d = time.getDate();
        var h = time.getHours();
        var m = time.getMinutes();
        var s = time.getSeconds();
        M = M < 10 ? ('0' + M) : M;
        d = d < 10 ? ('0' + d) : d;
        h = h < 10 ? ('0' + h) : h;
        m = m < 10 ? ('0' + m) : m;
        s = s < 10 ? ('0' + s) : s;
        dateType = dateType.replace('yyyy', y);
        dateType = dateType.replace('MM', M);
        dateType = dateType.replace('dd', d);
        dateType = dateType.replace('hh', h);
        dateType = dateType.replace('mm', m);
        dateType = dateType.replace('ss', s);
        return dateType;
    },

    /**
     * @Description: 全局数据请求
     * @author: WE!D
     * @name: doAjax
     * @args: Object
     * @return: none
     * @date: 2020/7/21
     */
    doAjax: function (params = {noLoading: true, toastTrigger: true}) {
        const that = this;
        const {prefix = ''} = params;
        let url = this.host + '/hola/' + params.url;
        if (prefix) {
            url = `${this.host}/${prefix}/${params.url}`;
        }
        if (!params.noLoading) {
            wx.showLoading({
                title: '正在请求...',
            });
        }
        if (!params.toastTrigger) {
            params.toastTrigger = false;
        }
        if (params.url.startsWith('wework')) {
            url = `${this.host}/${params.url}`;
        }
        params.data = params.data || {};
        if (params.url.split('?')[0].slice(-6) !== 'drafts') {
            params.data['userId'] = params.data['userId'] || wx.getStorageSync("userInfo").userId || "";
            params.data['teamId'] = params.data['teamId'] || wx.getStorageSync("userInfo").teamId || "";
        }
        let accessToken = params.data && params.data.accessToken ? params.data.accessToken : '';
        if (!accessToken && wx.getStorageSync('userInfo') && wx.getStorageSync('userInfo').tokenInfo) {
            accessToken = wx.getStorageSync('userInfo').tokenInfo.accessToken;
        }
        if (accessToken) {
            params.header = {
                'Authorization': `Bearer ${accessToken}`
            }
        }
        wx.request({
            url: url,
            method: params.method || 'POST',
            data: params.data || {},
            header: params.header || {},
            success: function (ret) {
                wx.hideLoading();
                if (ret.statusCode === 403 && !isUpload) {
                    wx.reLaunch({
                        url: "/pages/forbidden/forbidden"
                    })
                }
                if (ret.statusCode === 401 && !isUpload) {
                    const pages = getCurrentPages()
                    if (pages[pages.length - 1].route.indexOf('pages/auth/auth') === -1) {
                        that.toast('登录信息已失效~');
                        setTimeout(() => {
                            wx.navigateTo({
                                url: '/pages/auth/auth?type=getToken'
                            })
                        }, 2000)
                    }
                }
                if (ret.statusCode === 400 && ret.data.code === '402002' && !isUpload) {
                    let boundInfo = JSON.stringify({});
                    if (ret.data.data) {
                        boundInfo = JSON.stringify(ret.data.data);
                    }
                    wx.navigateTo({
                        url: `/pages/account/subpages/unbound/unbound?boundInfo=${boundInfo}`
                    })
                }
                if(ret.statusCode === 400 && ret.data.code === '909001' && !isUpload){
                    wx.navigateTo({
                        url: `/pages/auth/subpages/maintain/maintain?tip=${ret.data.msg}`
                    })
                    return;
                }
                var retData = ret.data;
                if (ret.statusCode >= 400) {
                    params.toastTrigger = retData.code == '401111' ? false : true;
                    if (params.toastTrigger) {
                        wx.showToast({
                            title: retData.msg,
                            icon: 'none',
                            duration: 2000,
                        });
                    }
                    if (params.error) return params.error(retData);
                    return
                }
                if (params.success) {
                    try {
                        return params.success(retData)
                    } catch (e) {
                        console.error(e)
                    }
                }
            }
        })
    },

    /**
     * @Description: 全局toast
     * @author: WE!D
     * @name: toast
     * @args: String,Number
     * @return: none
     * @date: 2020/7/21
     */
    toast: function (text, duration = 2000) {
        wx.showToast({
            title: text,
            icon: 'none',
            duration,
        })
    },

    /**
     * @Description: 数组去除空值
     * @author: WE!D
     * @name: trimSpace
     * @args: Array
     * @return: Array
     * @date: 2020/7/21
     */
    trimSpace: function (array) {
        for (var i = 0; i < array.length; i++) {
            if ((array[i] == ' ' && array[i] != 0) || array[i] == null ||
                typeof (array[i]) == 'undefined') {
                array.splice(i, 1)
                i = i - 1
            }
        }
        return array
    },

    /**
     * @Description: 切换页面
     * @author: WE!D
     * @name: changePage
     * @args: (String,String)
     * @return: none
     * @date: 2020/7/21
     */
    changePage: function (url, tab) {
        const that = this;
        if (url) {
            wx.navigateTo({
                url: url,
            })
        }
        if (tab) {
            wx.switchTab({
                url: tab,
                success: function () {
                    that.onShow()
                },
            })
        }
    },

    getAdminInfo(tokenInfo = {}) {
        const that = this;
        const p = new Promise((resolve, reject) => {
            this.doAjax({
                url: 'wework/users/adminInfo',
                method: 'GET',
                data: {
                    accessToken: tokenInfo.accessToken || ''
                },
                success(res) {
                    let userInfo = {};
                    const tokenInfo = wx.getStorageSync('userInfo') && wx.getStorageSync('userInfo').tokenInfo ? wx.getStorageSync('userInfo').tokenInfo : ''
                    userInfo = {...res, tokenInfo}
                    wx.setStorageSync('userInfo', userInfo);
                    that.globalData.userInfo = userInfo;
                    resolve(res)
                },
                fail(err) {
                    reject(err)
                },
                error(err) {
                    reject(err)
                }
            })
        })
        return p;
    },

    getAccessToken(e) {
        const that = this;
        const {iv, encryptedData} = e.detail;
        if (e.detail.errMsg.indexOf('fail') !== -1) {
            return Promise.reject({code: ''});
        }
        const accessTokenPromise = new Promise((resolve, reject) => {
            this.doAjax({
                url: 'wework/auth/ma_access_token',
                method: 'POST',
                data: {
                    authCode: wx.getStorageSync('authCode'),
                    iv,
                    encryptedData,
                },
                success(tokenInfo) {
                    let userInfo = wx.getStorageSync('userInfo') || {};
                    if (tokenInfo) {
                        that.getAdminInfo(tokenInfo)
                            .then(res => {
                                userInfo = res
                                userInfo.tokenInfo = tokenInfo;
                                wx.setStorageSync('userInfo', userInfo);
                                that.globalData.userInfo = res;
                                resolve(tokenInfo)
                            })
                            .catch(err => {
                                resolve(err)
                            })
                    }
                },
                fail(err) {
                    reject(err)
                },
                error(err) {
                    reject(err)
                }
            })
        });
        return accessTokenPromise;
    },

    getAccessTokenOfWeWork(e) {
        const that = this;
        const {phone, code} = e;
        const p = new Promise((resolve, reject) => {
            this.doAjax({
                url: 'wework/auth/ma_access_token',
                method: 'POST',
                data: {
                    authCode: wx.getStorageSync('authCode'),
                    smsCode: code,
                    phone: phone,
                },
                success(res) {
                    const userInfo = wx.getStorageSync('userInfo') || {};
                    userInfo.tokenInfo = res;
                    wx.setStorageSync('userInfo', userInfo);
                    resolve(res)
                },
                fail(err) {
                    reject(err)
                },
                error(err) {
                    reject(err)
                }
            })
        });
        return p;
    },
    /**
     * @Description: 获取用户信息
     * @author: WE!D
     * @name: getUserInfoAuthByAPI
     * @args: none
     * @return: Promise
     * @date: 2021/2/20
     */
    getUserInfoAuthByAPI() {
        return new Promise((resolve, reject) => {
            wx.getUserInfo({
                success: res => {
                    resolve({res, status: 'success'})
                },
                fail: err => {
                    console.error("getUserInfoAuthByAPI: ", err);
                    resolve({err, status: 'fail'})
                }
            })
        });
    },

    updateUserMobileByWeWork(e) {
        const detail = e.detail;
        const iv = detail.iv;
        const encryptedData = detail.encryptedData;
        const updateUserMobilePromise = new Promise((resolve, reject) => {
            this.doAjax({
                url: 'wework/auth/mobile',
                method: "post",
                data: {
                    userId: wx.getStorageSync("userInfo").userId,
                    teamId: wx.getStorageSync("userInfo").teamId,
                    sessionKey: this.globalData.userMsg.session_key,
                    iv,
                    encryptedData
                },
                success: function (res) {
                    resolve(res);
                },
                error: function (err) {
                    reject(err)
                }
            })
        });
        return updateUserMobilePromise;
    },

    getMiniProgramSetting(releaseRecordId) {
        if (!releaseRecordId) {
            return Promise.reject('releaseRecordId is null');
        }
        const miniProgramSettingPromise = new Promise((resolve, reject) => {
            this.doAjax({
                url: `wework/evaluations/settings/wechat-ma`,
                method: 'GET',
                data: {
                    releaseRecordId
                },
                success(res) {
                    resolve(res);
                },
                error(err) {
                    reject(err);
                },
                fail(err) {
                    reject(err);
                }
            })
        });
        return miniProgramSettingPromise;
    },

    getTeamList() {
        const p = new Promise((resolve, reject) => {
            this.doAjax({
                url: 'wework/teams',
                method: 'GET',
                noLoading: true,
                success(res) {
                    resolve(res)
                },
                fail(err) {
                    reject(err)
                }
            });
        })
        return p;
    },

    updateUserInfo(e) {
        let userInfo = {};
        console.log('updateUserInfo: ', e);
        if (wx.getUserProfile && e.type !== 'getuserinfo') {
            userInfo = e.userInfo
        } else {
            userInfo = e.detail.userInfo
        }
        console.log(userInfo);
        userInfo.avatar = userInfo && userInfo.avatarUrl ? userInfo.avatarUrl : ''
        const p = new Promise((resolve, reject) => {
            this.doAjax({
                url: 'wework/users/info',
                method: 'PUT',
                data: {
                    ...userInfo
                },
                success(res) {
                    wx.setStorageSync('userBaseInfo', res);
                    resolve(res);
                },
                fail(err) {
                    reject(err);
                }
            })
        });
        return p;
    },

    getUserInformation() {
        if (!this.checkAccessToken()) {
            return;
        }
        const p = new Promise((resolve, reject) => {
            this.doAjax({
                url: 'wework/users/avatar',
                method: 'GET',
                success(res) {
                    wx.setStorageSync('userBaseInfo', res);
                    resolve(res);
                },
                fail(err) {
                    reject(err);
                }
            })
        });
        return p;
    },

    getUserInfoOfPhone() {
        const p = new Promise((resolve, reject) => {
            this.doAjax({
                url: `wework/users/${wx.getStorageSync('userInfo').userId}`,
                method: "get",
                success: function (res) {
                    that.setData({
                        getphoneNum: true,
                        phoneNumber: res.phone
                    });
                }
            });
        });
        return p;
    },

    switchTeam(teamId) {
        const p = new Promise((resolve, reject) => {
            this.doAjax({
                url: 'wework/auth/ma_access_token/switch',
                method: 'POST',
                data: {
                    teamId
                },
                success(res) {
                    resolve(res);
                },
                error(err) {
                    reject(err);
                }
            })
        });
        return p;
    },

    checkAccessToken(res) {
        if (
            wx.getStorageSync('userInfo')
            &&
            wx.getStorageSync('userInfo').tokenInfo
            &&
            wx.getStorageSync('userInfo').tokenInfo.accessToken
        ) {
            return true;
        } else {
            return false;
        }
    },

    checkAdmin() {
        if (wx.getStorageSync('userInfo')) {
            return wx.getStorageSync('userInfo').isAdmin
        }
        return false;
    },

    checkSuperAdmin() {
        if (wx.getStorageSync('userInfo')) {
            return wx.getStorageSync('userInfo').isSuperAdmin
        }
        return false;
    },

    setDataOfPlatformInfo(that) {
        // 获取getApp()实例，避免混淆this
        const app = getApp();
        const platformInfo = {
            isWxWork: app.wxWorkInfo.isWxWork,
            isWxWorkAdmin: app.checkAdmin(),
            isWxWorkSuperAdmin: app.checkSuperAdmin(),
            is3rd: app.wx3rdInfo.is3rd,
            is3rdAdmin: app.checkAdmin(),
            is3rdSuperAdmin: app.checkSuperAdmin(),
            isGetAccessToken: app.checkAccessToken()
        };
        that.setData({
            ...platformInfo
        })
    },

    getAuthCode() {
        // if (this.checkAccessToken()) {
        //     return;
        // }
        const targetWxLoginFunc = this.wxWorkInfo.isWxWork ? wx.qy.login : wx.login;
        const targetGetAuthCodeFunc = this.wxWorkInfo.isWxWork ? this.wxWorkUserLogin : this.userLogin;
        const wxLogin = new Promise((resolve, reject) => {
            targetWxLoginFunc({
                success(res) {
                    resolve(res.code);
                },
                fail(err) {
                    reject(err);
                }
            })
        });
        wxLogin
            .then(code => {
                return targetGetAuthCodeFunc(code)
            })
            .catch(err => {
                console.error('获取authCode失败：', err)
            });
    },

    updateUserTag(authCode) {
        let scence = '';
        const {route} = getCurrentPages()[0];
        for (let i in scenceMap) {
            if(scenceMap[i].route === route) {
                scence = scenceMap[i].name;
            }
        }
        this.doAjax({
            url: 'wework/auth/trace_data',
            method: 'POST',
            data: {
                authCode,
                properties: {
                    scence,
                }
            },
            success() {
                wx.setStorageSync('traceData', scence)
            }
        })
    },

    getPrueAuthCode(code) {
        const that = this;
        const type = this.wxWorkInfo.isWxWork ? 'WEWORK' : 'WECHAT';
        const p = new Promise((resolve, reject) => {
            this.doAjax({
                url: `wework/auth/ma_auth_code`,
                method: 'POST',
                data: {
                    type: type,
                    appId: that.globalData.appid,
                    code: code,
                },
                noLoading: true,
                success: function (res) {
                    wx.setStorageSync('isNew', res.isNew);
                    console.log(res);
                    wx.uma.setOpenid(res.openId);
                    if(!res.traceData || res.traceData.openIdFirstAccess || Object.keys(res.traceData.properties).length <= 0){
                        that.updateUserTag(res.authCode);
                    } else {
                        wx.setStorageSync('traceData', res.traceData.properties.scence)
                    }
                    // 配置智能对话平台插件
                    plugin.init({
                        appid: (() => {
                            if (wx.getAccountInfoSync().miniProgram.appId === 'wx85cde7d3e8f3d949') {
                                return "TZ7JcEhg7kMjrLwsrAE7s8nz9N3LWc";
                            } else {
                                return "YlEDY236AICZ8r1ODOvoVsuNfpcG8j";
                            }
                        })(), //机器人Id
                        openid: res.openId, //用户的openid，必填项，可通过wx.login()获取code，然后通过后台接口获取openid
                        userHeader: "", // 用户头像
                        userName: "", // 用户昵称
                        anonymous: true, // 是否允许匿名用户评价，默认为false，设为ture时，未传递userName、userHeader两个字段时将弹出登录框
                        guideCardHeight: 50,
                        operateCardHeight: 120,
                        history: true,
                        historySize: 60,
                        welcome: '欢迎语\n' +
                            '\n' +
                            '您来啦！ 我是罗课君，有什么可以帮到您？\n' +
                            '回复对应数字，将有专属客服接待：\n' +
                            '\n' +
                            '【1】学习类：课程/培训/企业内训定制……\n' +
                            '【2】测评类：免费试用/定制测评/企业采购……\n' +
                            '\n' +
                            '还有其他的吗？欢迎补充！',
                        guideList: [
                            '转人工'
                        ],
                        success: (e) => {}, //非必填
                        fail: (error) => {}, //非必填
                    });
                    if(!res.tokenInfo){
                        // https://devops.aliyun.com/task/60fa593f9d8834004fb4c754
                        wx.removeStorageSync('accessToken');
                    }
                    resolve(res)
                },
                error: function (err) {
                    wx.showModal({
                        title: '登入失败！',
                        content: '网络故障，请退出重新进入小程序。',
                        showCancel: !1,
                        confirmText: '确定',
                        confirmColor: 'rgb(0,153,255)',
                    });
                    reject(err)
                },
                complete: function () {
                    wx.hideLoading()
                },
            });
        });
        return p;
    },

    prueLogin() {
        const that = this;
        const targetWxLoginFunc = this.wxWorkInfo.isWxWork ? wx.qy.login : wx.login;
        const wxLogin = new Promise((resolve, reject) => {
            targetWxLoginFunc({
                success: res => {
                    that.getPrueAuthCode(res.code).then(res => {
                        const userInfo = wx.getStorageSync('userInfo') || {};
                        const {authCode, tokenInfo} = res;
                        if (tokenInfo && tokenInfo.accessToken) {
                            userInfo.tokenInfo = tokenInfo
                            wx.setStorageSync('userInfo', userInfo)
                            that.getAdminInfo(tokenInfo)
                        }
                        wx.setStorageSync('authCode', authCode)
                        resolve(res)
                    }).catch(err => {
                        reject(err)
                    });
                },
                fail: function (err) {
                    console.error('获取authCode失败：', err);
                    reject(err)
                }
            })
        });
        return wxLogin;
    },

    getSMSCode(phone) {
        const p = new Promise((resolve, reject) => {
            this.doAjax({
                url: 'wework/auth/ma_sms_code',
                method: 'POST',
                data: {
                    appid: wx.getAccountInfoSync().miniProgram.appId,
                    phone,
                },
                success(res) {
                    resolve(res)
                },
                error(err) {
                    reject(err)
                }
            })
        });
        return p;
    },
});
