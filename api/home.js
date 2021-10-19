const app = getApp()

export function loadSubscriber(data) {
    const p = new Promise((resolve, reject) => {
        app.doAjax({
            url: 'wework/event/subscriber',
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

export function loadIsSubscribed(data) {
    const p = new Promise((resolve, reject) => {
        app.doAjax({
            url: 'wework/mp/check_if_subscribed',
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
    return p;
}
