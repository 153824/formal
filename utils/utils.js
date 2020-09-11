const moment = require('./moment');

function timeFormat(time) {
    moment.locale('en', {
        longDateFormat: {
            l: "YYYY-MM-DD",
            L: "YYYY-MM-DD HH:mm"
        }
    });
    return moment(time).format('L');
}

export {
    timeFormat,
}
