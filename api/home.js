const app = getApp()
console.log('wx: ', wx);

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

export function getFreeEvaluation(data) {
    const p = new Promise((resolve, reject) => {
        app.doAjax({
            url: `wework/homepages/evaluations/${data.columnId}`,
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

export function postCreatSubscriber(data) {
    const p = new Promise((resolve, reject) => {
        app.doAjax({
            url: `wework/event/subscriber/create`,
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