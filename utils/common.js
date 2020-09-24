/**
 * @Description:  本地存储用户详情，复用逻辑代码块
 * @author: WE!D
 * @name:  setUserDetail
 * @args:  用户详情
 * @return:
 * @date: 2020/8/20
*/
function setUserDetail(LOCAL_USER_INFO) {
    console.log("LOCAL_USER_INFO: ",LOCAL_USER_INFO);
    const userData = LOCAL_USER_INFO;
    if (LOCAL_USER_INFO) {
        console.log("this： ",this);
        const userMsg = this.globalData.userMsg;
        wx.setStorageSync('userInfo', Object.assign(userData,this.globalData.userInfo || {}));
        wx.setStorageSync('openId', userData.openid || userMsg.openid);
        // wx.setStorageSync('unionId', userData.uid || userMsg.unionid);
        this.globalData.userInfo = Object.assign(userData,this.globalData.userInfo || {});
        console.log("Object.assign(this.globalData.userInfo || {}, userData): ",this.globalData.userInfo);
    }
}
/**
 * @Description:  本地存储团队列表，复用逻辑代码块
 * @author: WE!D
 * @name:  setTeams
 * @args:  团队信息，回调函数
 * @return:
 * @date: 2020/8/20
*/
function setTeams(LOCAL_MY_TEAM_LIST,cb){
    let toAddNew = true;
    if (this.checkUser && !this.isLogin) {
        this.isLogin = true
    }
    LOCAL_MY_TEAM_LIST.forEach(function (n) {
        if (n.role == 3 && n.createUser.objectId == this.globalData.userInfo.id) {
            //有我创建的团队时不进行自动新增团队
            toAddNew = false;
        }
    });
    if (LOCAL_MY_TEAM_LIST instanceof Array) {
        let obj = LOCAL_MY_TEAM_LIST[0];
        let teams = [];
        this.teamId = obj.objectId;
        this.teamName = obj.name;
        this.teamRole = obj.role;
        this.globalData.team = obj;
        LOCAL_MY_TEAM_LIST.forEach((item, key) => {
            teams.push(item.name)
        });
        this.globalData.teams = teams;
        // this.checkUserVip(obj);
        cb && cb(LOCAL_MY_TEAM_LIST)
    }
    if (toAddNew && !LOCAL_MY_TEAM_LIST instanceof Array) {
        this.addNewTeam(cb)
    }
    if (toAddNew && LOCAL_MY_TEAM_LIST instanceof Array) {
        this.addNewTeam()
    }
}
module.exports = {
    setUserDetail: setUserDetail,
    setTeams: setTeams
};
