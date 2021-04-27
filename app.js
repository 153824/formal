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
    host: 'https://uat.api.haola101.com',
    // host: 'http://api.dev.luoke101.int',
    //host: "https://api.haola101.com",
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
        appKey: '5f6d5902906ad81117141b70', //由友盟分配的APP_KEY
        // 使用Openid进行统计，此项为false时将使用友盟+uuid进行用户统计。
        // 使用Openid来统计微信小程序的用户，会使统计的指标更为准确，对系统准确性要求高的应用推荐使用Openid。
        useOpenid: true,
        // 使用openid进行统计时，是否授权友盟自动获取Openid，
        // 如若需要，请到友盟后台"设置管理-应用信息"(https://mp.umeng.com/setting/appset)中设置appId及secret
        autoGetOpenid: true,
        debug: false, //是否打开调试模式
        uploadUserInfo: true // 自动上传用户信息，设为false取消上传，默认为false
    },
    onLaunch: function (options) {
        const referrerInfo = options.referrerInfo;
        const menuBtnObj = wx.getMenuButtonBoundingClientRect();
        const sysMsg = wx.getSystemInfoSync();
        const appId = ['wx85cde7d3e8f3d949', 'wxdb1dcb4a9e212d32'];
        this.isIphoneX = false;
        this.isIos = false;
        this.fromAppId = '';
        this.teamId = '';
        this.rate = sysMsg.windowWidth / 750;
        if (referrerInfo && referrerInfo.appid) {
            this.fromAppId = referrerInfo.appid
        }
        if (wx.getExtConfigSync().isCustomVersion === 'true' || (wx.getExtConfigSync().isCustomVersion && wx.getExtConfigSync().isCustomVersion.toString() === 'true') ) {
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
        return new Promise((resolve, reject) => {
            that.doAjax({
                url: 'wework/auth/ma_auth_code',
                method: 'POST',
                data: {
                    type: 'WECHAT',
                    appId: that.globalData.appid,
                    code: code,
                },
                noLoading: true,
                success: function (res) {
                    const {authCode, tokenInfo, userInfo} = res;
                    if(tokenInfo && tokenInfo.accessToken){
                        userInfo.tokenInfo = tokenInfo
                        wx.setStorageSync('userInfo', userInfo)
                    }
                    wx.setStorageSync('authCode', authCode);
                    if (res.isNew) {
                        wx.uma.trackEvent("1606212682385");
                    }
                    if (that.checkUserInfo) {
                        res.isWxWork = false;
                        res.is3rd = that.wx3rdInfo.is3rd;
                        that.checkUserInfo(res);
                    }
                    resolve();
                },
                error: function () {
                    wx.showModal({
                        title: '登入失败！',
                        content: '网络故障，请退出重新进入小程序。',
                        showCancel: !1,
                        confirmText: '确定',
                        confirmColor: 'rgb(0,153,255)',
                    });
                    reject()
                },
                complete: function () {
                    wx.hideLoading()
                },
            })
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
        const that = this;
        return new Promise((resolve, reject) => {
            that.doAjax({
                url: `wework/auth/ma_auth_code`,
                method: 'POST',
                data: {
                    type: 'WEWORK',
                    appId: that.globalData.appid,
                    code: code,
                },
                noLoading: true,
                success: function (res) {
                    const {authCode, tokenInfo, userInfo} = res;
                    if(tokenInfo && tokenInfo.accessToken){
                        userInfo.tokenInfo = tokenInfo
                        wx.setStorageSync('userInfo', userInfo)
                    }
                    wx.setStorageSync('authCode', authCode);
                    if (that.checkUserInfo) {
                        res.isWxWork = true;
                        res.is3rd = that.wx3rdInfo.is3rd;
                        that.checkUserInfo(res);
                    }
                    resolve();
                },
                error: function (err) {
                    console.error("error: ", err);
                    reject(err);
                }
            })
        });
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
        params.data['userId'] = params.data['userId'] || wx.getStorageSync("userInfo").id || "";
        params.data['teamId'] = params.data['teamId'] || wx.getStorageSync("userInfo").teamId || "";
        let accessToken = '';
        if (wx.getStorageSync('userInfo') && wx.getStorageSync('userInfo').tokenInfo) {
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
                if (ret.statusCode === 403) {
                    wx.reLaunch({
                        url: "/pages/forbidden/forbidden"
                    })
                }
                if (ret.statusCode === 401) {
                    const pages = getCurrentPages()
                    if(pages[pages.length-1].route.indexOf('pages/auth/auth') === -1){
                        that.toast('登录信息已失效~');
                        setTimeout(()=>{
                            wx.navigateTo({
                                url: '/pages/auth/auth?type=getToken'
                            })
                        }, 2000)
                    }
                }
                if(ret.statusCode === 400 && ret.data.code === '402002'){
                    wx.navigateTo({
                        url: '/pages/account/subpages/unbound/unbound'
                    })
                }
                var retData = ret.data;
                if (ret.statusCode >= 400) {
                    params.toastTrigger = true;
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
            },
            error: function (err) {
                if(params.toastTrigger){
                    wx.showToast({
                        title: err.msg,
                        icon: 'none',
                        duration: 2000,
                    });
                }
                wx.hideLoading()
            },
            fail: err => {
                if(params.toastTrigger){
                    wx.showToast({
                        title: err.msg,
                        icon: 'none',
                        duration: 2000,
                    });
                }
                wx.hideLoading()
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

    getAccessToken(e) {
        const that = this;
        const {iv, encryptedData} = e.detail;
        const accessTokenPromise = new Promise((resolve, reject) => {
            this.doAjax({
                url: 'wework/auth/ma_access_token',
                method: 'POST',
                data: {
                    authCode: wx.getStorageSync('authCode'),
                    iv,
                    encryptedData,
                },
                success(res) {
                    wx.setStorageSync('userInfo', res);
                    that.globalData.userInfo = res;
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
                    wx.setStorageSync('userInfo', res);
                    that.globalData.userInfo = res;
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
                    userId: wx.getStorageSync("userInfo").id,
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
        if(!releaseRecordId){
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
                fail(err){
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
        const {userInfo} = e.detail;
        userInfo.avatar = userInfo.avatarUrl
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
                url: `wework/users/${wx.getStorageSync('userInfo').id}`,
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
                resolve(err) {
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

    setDataOfPlatformInfo(that) {
        // 获取getApp()实例，避免混淆this
        const app = getApp();
        const platformInfo = {
            isWxWork: app.wxWorkInfo.isWxWork,
            isWxWorkAdmin: app.checkAdmin(),
            is3rd: app.wx3rdInfo.is3rd,
            is3rdAdmin: app.checkAdmin(),
            isGetAccessToken: app.checkAccessToken()
        };
        that.setData({
            ...platformInfo
        })
    },

    getAuthCode() {
        if(this.checkAccessToken()){
            return;
        }
        const that = this;
        const p = new Promise((resolve, reject) => {
            if (that.wxWorkInfo.isWxWork) {
                wx.qy.login({
                    success: res => {
                        that.wxWorkUserLogin(res.code).then(res=>{
                            resolve()
                        }).catch(err => {
                            console.log(err);
                            reject(err)
                        });
                    },
                    fail: function (err) {
                        reject(err)
                    }
                })
            } else {
                wx.login({
                    success: res => {
                        that.userLogin(res.code).then(res=>{
                            resolve()
                        }).catch(err => {
                            console.error(err);
                            reject(err)
                        });
                    },
                    fail: err=>{
                        console.error(err);
                        reject(err)
                    }
                });
            }
        })
        return p;
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
                    resolve(res)
                },
                error: function (err) {
                    reject(err);
                }
            });
        });
        return p;
    },

    prueLogin() {
        const that = this;
        const p = new Promise((resolve, reject) => {
            if (this.wxWorkInfo.isWxWork) {
                wx.qy.login({
                    success: res => {
                        that.getPrueAuthCode(res.code).then(res=>{
                            const {authCode, tokenInfo, userInfo} = res;
                            if(tokenInfo && tokenInfo.accessToken){
                                userInfo.tokenInfo = tokenInfo
                                wx.setStorageSync('userInfo', userInfo)
                            }
                            wx.setStorageSync('authCode', authCode)
                            resolve()
                        }).catch(err=>{
                            reject(err)
                        });
                    },
                    fail: function (err) {
                        console.error(err);
                        reject(err)
                    }
                })
            }
            else {
                wx.login({
                    success: res => {
                        that.getPrueAuthCode(res.code).then(res=>{
                            const {authCode, tokenInfo, userInfo} = res;
                            if(tokenInfo && tokenInfo.accessToken){
                                userInfo.tokenInfo = tokenInfo
                                wx.setStorageSync('userInfo', userInfo)
                            }
                            wx.setStorageSync('authCode', authCode)
                            resolve()
                        }).catch(err=>{
                            reject(err)
                        })
                    },
                    fail: function (err) {
                        reject(err)
                        console.error(err);
                    }
                })
            }
        });
        return p;
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
                error(err){
                    reject(err)
                }
            })
        });
        return p;
    },
});
