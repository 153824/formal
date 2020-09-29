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
 * eventId:  小神推模板ID
 * assistant 面试助手
 * ********************************************************************************************************************/
const uma = require('umtrack-wx');
const qiniuUpload = require("./utils/qiniuUpload");
const common = require('./utils/common.js');
qiniuUpload.init({
    region: 'SCN',
    domain: 'ihola.luoke101.com',
    uptokenURL: 'https://api.luoke101.com/hola/getQiNiuToken',
    shouldUseQiniuFileName: false
});

App({
    defaultShareObj: {
        imageUrl: "http://ihola.luoke101.com/wxShareImg.png",
    },
    teamName: "",
    teamId: "",
    teamRole: "",
    isLogin: false,
    isIos: false,
    isTest: false,
    qiniuUpload: qiniuUpload,
    isIphoneX: false,
    // host: "http://192.168.0.101:3000",
    // host: "https://api.luoke101.com/v3.0.0",
    host: "https://api.luoke101.com",
    // host: 'https://h5.luoke101.com',
    // host: "http://192.168.0.225:3000",
    // host: "http://api.dev.luoke101.int",
    // host: "https://24c84666cb52.ap.ngrok.io",
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
        eventId: "5ea6b2b26df4251c4a09a4cc",
        assistant: ["5efed573b1ef0200062a85f7"]
    },
    wxWorkInfo: {
        wxWorkUserId: "",
        wxWorkTeamId: "",
        isWxWork: false,
        isWxWorkAdmin: false,
        wxWorkUserInfo: {},
    },
    umengConfig: {
        appKey: '5f6d5902906ad81117141b70', //由友盟分配的APP_KEY
        // 使用Openid进行统计，此项为false时将使用友盟+uuid进行用户统计。
        // 使用Openid来统计微信小程序的用户，会使统计的指标更为准确，对系统准确性要求高的应用推荐使用Openid。
        useOpenid: true,
        // 使用openid进行统计时，是否授权友盟自动获取Openid，
        // 如若需要，请到友盟后台"设置管理-应用信息"(https://mp.umeng.com/setting/appset)中设置appId及secret
        autoGetOpenid: true,
        debug: true, //是否打开调试模式
        uploadUserInfo: true // 自动上传用户信息，设为false取消上传，默认为false
    },
    onLaunch: function (options) {
        const that = this;
        const referrerInfo = options.referrerInfo;
        const menuBtnObj = wx.getMenuButtonBoundingClientRect();
        const sysMsg = wx.getSystemInfoSync();
        this.isIphoneX = false;
        this.isIos = false;
        this.isLogin = false;
        this.fromAppId = '';
        this.teamId = '';
        this.rate = sysMsg.windowWidth / 750;
        if (referrerInfo && referrerInfo.appid) {
            this.fromAppId = referrerInfo.appid
        }
        wx.onMemoryWarning(function (res) {
            console.log('onMemoryWarningReceive', res)
        });
        /*获取机型 **/
        if (sysMsg.model.indexOf('iPhone X') !== -1) {
            this.isIphoneX = true
        }
        if (sysMsg.system.indexOf('iOS') !== -1) {
            this.isIos = true
        }
        if (sysMsg.environment === 'wxwork') {
            this.wxWorkInfo.isWxWork = true;
        }
        if (this.wxWorkInfo.isWxWork) {
            const that = this;
            this.doAjax({
                url: 'wework/app/health',
                method: 'get',
                success: function (res) {
                    console.log("app/health: ",res);
                }
            });
            wx.qy.login({
                success: res => {
                    that.wxWorkUserLogin(res.code).then(data => {
                        if (that.wxWorkInfo.isWxWorkAdmin) {
                            setTimeout(()=>{
                                wx.reLaunch({
                                    url: "/pages/work-base/work-base?isWxWorkAdmin=true&maskTrigger=true",
                                    success: function () {
                                        let page = getCurrentPages().pop();
                                        if (page == undefined || page == null) return;
                                        page.onLoad({isWxWorkAdmin: true, maskTrigger: true});
                                    }
                                })
                            },500)
                        }else{
                            setTimeout(()=>{
                                wx.switchTab({
                                    url: "/pages/work-base/work-base?isWxWorkAdmin=false&maskTrigger=true",
                                    success: function () {
                                        let page = getCurrentPages().pop();
                                        if (page == undefined || page == null) return;
                                        page.onLoad({isWxWorkAdmin: false, maskTrigger: true});
                                    }
                                })
                            },500)
                        }
                    }).catch(err => {
                        wx.reLaunch({
                            url: "/pages/work-base/work-base?msg=err&maskTrigger=true",
                            success: function () {
                                let page = getCurrentPages().pop();
                                if (page == undefined || page == null) return;
                                page.onLoad();
                            }
                        })
                    })
                },
                fail: function (err) {
                    console.error(err);
                }
            })
        } else {
            /**
             * @Description: 登录
             * @author: WE!D
             * @name: wx.login
             * @args: Object
             * @return: Object {openId, sessionKey, unionId}
             * @date: 2020/7/21
             */
            wx.login({
                success: res => {
                    this.userLogin(res.code).then(res => {
                    }).catch(err => {
                        console.error(err)
                    });
                },
            });
        }

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
        const userLoginPromise = new Promise((resolve, reject) => {
            that.doAjax({
                url: 'userLogin',
                method: 'POST',
                data: {
                    fromAppId: that.fromAppId,
                    appid: that.globalData.appid,
                    code: code,
                },
                noLoading: true,
                success: function (res) {
                    that.globalData.userMsg = res.userMsg || {};
                    var userData = res.data;
                    wx.hideLoading();
                    if (0 === res.code) {
                        var userMsg = that.globalData.userMsg;
                        wx.setStorageSync('userInfo', userData);
                        wx.setStorageSync('openId', userData.openid || userMsg.openid);
                        that.globalData.userInfo = Object.assign(userData,
                            that.globalData.userInfo || {})
                        that.isLogin = true;
                        that.getMyTeamList(that.checkUser);
                        resolve({openId: userData.openid || userMsg.openid})
                    } else {
                        wx.showModal({
                            title: '登入失败！',
                            content: '网络故障，请退出重新进入小程序。',
                            showCancel: !1,
                            confirmText: '确定',
                            confirmColor: '#0099ff',
                            success: function (e) {
                            },
                        })
                        reject({openId: ''})
                    }

                },
                complete: function () {
                    wx.hideLoading()
                },
            })
        });
        return userLoginPromise
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
                url: `wework/auth/ma`,
                method: 'get',
                data: {
                    code: code
                },
                success: function (res) {
                    if (res.isAdmin) {
                        that.wxWorkInfo.isWxWorkAdmin = true;
                        wx.setStorageSync('isWxWorkAdmin', true);
                    }
                    that.globalData.userMsg = res.userMsg || {};
                    const userData = res;
                    const userMsg = that.globalData.userMsg;
                    wx.setStorageSync('userInfo', userData);
                    wx.setStorageSync('openId', userData.openid || userMsg.openid);
                    that.globalData.userInfo = Object.assign(userData,
                        that.globalData.userInfo || {});
                    that.teamId = res.teamId;
                    that.isLogin = true;
                    resolve({openId: userData.openid || userMsg.openid});
                },
                error: function (err) {
                    console.log("error: ", err);
                    reject(err);
                }
            })
        });
    },

    /**
     * @Description: 获取用户信息
     * @author: WE!D
     * @name: getUserInfo
     * @args: Function
     * @return: none
     * @date: 2020/7/21
     */
    getUserInfo: function (callBack) {
        const that = this;
        if (!wx.getStorageSync('openId') || !this.isLogin) {
            callBack && callBack();
            return;
        }
        const LOCAL_USER_INFO = wx.getStorageSync('USER_DETAIL');
        this.checkUser = null;
        if (LOCAL_USER_INFO.id) {
            common.setUserDetail.apply(that, [LOCAL_USER_INFO]);
            wx.hideLoading();
            that.getMyTeamList(callBack);
        } else {
            this.doAjax({
                url: `wework/users/${that.globalData.userMsg.id || that.globalData.userInfo.id}`,
                method: 'get',
                noLoading: true,
                success: function (res) {
                    wx.setStorage({
                        key: 'USER_DETAIL',
                        data: res
                    });
                    common.setUserDetail.apply(that, [res]);
                    wx.hideLoading();
                    that.getMyTeamList(callBack);
                },
                fail(err) {
                    wx.hideLoading()
                },
            })
        }
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
    doAjax: function (params = {noLoading: true}) {
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
        if (params.url.indexOf('wework/auth/ma') !== -1) {
            url = `${this.host}/wework/auth/ma`;
        }
        if (params.url.indexOf("wework/users") !== -1) {
            url = `${this.host}/wework/users/${that.globalData.userInfo.id}`;
        }
        if(params.url.indexOf('wework/app/health')!==-1){
            url = `${this.host}/wework/app/health`;
        }
        params.data = params.data || {};
        params.data['userId'] = (that.globalData.userInfo || wx.getStorageSync("userInfo")).id || '';
        params.data['teamId'] = that.teamId || wx.getStorageSync("userInfo").teamId || params.data['teamId'] || "";
        params.data['teamRole'] = that.teamRole || "";
        wx.request({
            url: url,
            method: params.method || 'POST',
            data: params.data || {},
            header: params.header || {},
            success: function (ret) {
                wx.hideLoading();
                var retData = ret.data;
                if (retData.code) {
                    if (params.error) return params.error(retData);
                    wx.showToast({
                        title: retData.msg,
                        icon: 'none',
                        duration: 2000,
                    });
                    return;
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
                console.error(err)
                wx.hideLoading()
            },
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

    /**
     * @Description: 获取团队列表
     * @author: WE!D
     * @name: getMyTeamList
     * @args: Function
     * @return: none
     * @date: 2020/7/21
     */
    getMyTeamList: function (cb, cacheTrigger = true) {
        const that = this;
        if (that.wxWorkInfo.isWxWork) {
            return;
        }
        let LOCAL_MY_TEAM_LIST = wx.getStorageSync('GET_MY_TEAM_LIST');
        if (LOCAL_MY_TEAM_LIST instanceof Array && cacheTrigger) {
            var toAddNew = true;
            LOCAL_MY_TEAM_LIST = LOCAL_MY_TEAM_LIST || []
            if (that.checkUser && !that.isLogin) {
                that.isLogin = true
            }
            LOCAL_MY_TEAM_LIST.forEach(function (n) {
                try {
                    if (n.role == 3 && n.createUser.objectId ==
                        that.globalData.userInfo.id) { //有我创建的团队时不进行自动新增团队
                        toAddNew = false
                    }
                } catch (e) {
                    console.error("At app.js 445, ", e)
                }
            });
            if (LOCAL_MY_TEAM_LIST instanceof Array) {
                var obj = LOCAL_MY_TEAM_LIST[0]
                var teams = []
                that.teamId = obj.objectId
                wx.setStorageSync("MY_TEAM_ID", obj.objectId);
                that.teamName = obj.name
                that.teamRole = obj.role
                that.globalData.team = obj
                LOCAL_MY_TEAM_LIST.forEach((item, key) => {
                    teams.push(item.name)
                })
                that.globalData.teams = teams
                cb && cb(LOCAL_MY_TEAM_LIST)
            }
            if (toAddNew && !LOCAL_MY_TEAM_LIST instanceof Array) {
                that.addNewTeam(cb)
            }
            if (toAddNew && LOCAL_MY_TEAM_LIST instanceof Array) {
                that.addNewTeam()
            }
        } else {
            this.doAjax({
                url: 'myTeamList',
                method: 'get',
                noLoading: true,
                data: {
                    teamId: that.teamId || wx.getStorageSync("userInfo").teamId,
                    page: 1,
                    pageSize: 12,
                    targetTeamId: wx.getStorageSync("TARGET_TEAM_ID") || ""
                },
                success: function (list) {
                    wx.removeStorageSync("TARGET_TEAM_ID");
                    let toAddNew = true;
                    list = list || [];
                    if (list.length) {
                        wx.setStorage({
                            key: 'GET_MY_TEAM_LIST',
                            data: list
                        })
                    }
                    if (that.checkUser && !that.isLogin) {
                        that.isLogin = true;
                    }
                    list.forEach(function (n) {
                        if (n.role == 3 && n.createUser.objectId ==
                            that.globalData.userInfo.id) { //有我创建的团队时不进行自动新增团队
                            toAddNew = false;
                        }
                    });
                    if (list.length) {
                        var obj = list[0]
                        var teams = []
                        that.teamId = obj.objectId
                        wx.setStorageSync("MY_TEAM_ID", obj.objectId);
                        that.teamName = obj.name
                        that.teamRole = obj.role
                        that.globalData.team = obj
                        list.forEach((item, key) => {
                            teams.push(item.name)
                        })
                        that.globalData.teams = teams
                        // that.checkUserVip(obj);
                        cb && cb(list)
                    }
                    if (toAddNew && !list.length) {
                        that.addNewTeam(cb)
                    }
                    if (toAddNew && list.length) {
                        that.addNewTeam()
                    }
                },
            });
        }
    },

    /**
     * @Description: 添加团队(默认会添加一个自己的团队)
     * @author: WE!D
     * @name: addNewTeam
     * @args: Function
     * @return: none
     * @date: 2020/7/21
     */
    addNewTeam: function (cb) {
        var that = this;
        var userInfo = that.globalData.userInfo;
        that.doAjax({
            url: 'updateTeamMember',
            method: 'post',
            noLoading: true,
            data: {
                type: 6,
                name: (userInfo.nickname || userInfo.nickName) + '的团队',
                remark: '自动生成的团队',
            },
            success: function () {
                wx.removeStorageSync('GET_MY_TEAM_LIST');
                that.getMyTeamList(cb);
            },
        })
    }
});
