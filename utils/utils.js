export function remove(wx,key,prefix) {
    const keys = wx.getStorageInfoSync().keys;
    keys.forEach(function (n) {
        if (n.indexOf("oldAnswer") == 0 && n != sKey) {
            wx.removeStorageSync(n);
        }
    });
}

export function verifyPhoneFormat(phone) {
    const reg = /^1[3456789]\d{9}$/;
    if (!reg.test(phone)) {
        return false;
    }
    return true
}

export function isComplete(text, targetLen) {
    return text.length === targetLen
}

export function getAge(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m <= 0) {
        age--;
    }
    return age;
}
