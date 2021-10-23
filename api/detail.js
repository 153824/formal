const app = getApp()

export function getWechatMpQrcode() {
    const p = new Promise((resolve, reject) => {
        app.doAjax({
            url: 'evaluations/wechatMpQrcode',
            method: 'GET',
            data: {},
            success(res) {
                resolve(res)
            },
            error(err) {
                reject(err)
            }
        })
    })
    return p
}

export function getEvaluationExist(data) {
    const p = new Promise((resolve, reject) => {
        app.doAjax({
            url: 'wework/evaluations/column/check_evaluation_exist',
            method: 'GET',
            data,
            success(res) {
                resolve(res)
            },
            error(err) {
                reject(err)
            }
        })
    })
    return p
}

export function getAssignment(){
    const p = new Promise((resolve, reject) => {
        app.doAjax({
            url: 'wework/evaluations/assignment/settings',
            method: 'GET',
            success(res) {
                resolve(res)
            },
            error(err) {
                reject(err)
            }
        })
    })
    return p
}