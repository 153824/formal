import {Tracker, umaEvent} from "../uma.config";

const app = getApp()

export function getIsExist() {
    const p = new Promise((resolve, reject) => {
        app.doAjax({
            url: 'wework/potential_customer/exist',
            method: 'GET',
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

export function submit(data) {
    const p = new Promise((resolve, reject) => {
        app.doAjax({
            url: 'wework/potential_customer',
            method: 'POST',
            data,
            success(res) {
                resolve(res)
            },
            error(err) {
                reject(err)
            }
        });
    })
    return p
}

export function exchangeEvaluationId(data) {
    const p = new Promise((resolve, reject) => {
        app.doAjax({
            url: `wework/evaluations/receive_info/${data.receiveRecordId}`,
            method: 'GET',
            data,
            success(res) {
                resolve(res)
            },
            error(err) {
                reject(err)
            }
        });
    })
    return p
}