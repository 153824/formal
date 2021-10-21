const app = getApp()

export function getWechatMpQrcode() {
    const p = new Promise((resolve, reject) => {
        app.doAjax({
            url: 'wework/evaluations/wechatMpQrcode',
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