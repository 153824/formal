import {Tracker, umaEvent} from "../../uma.config";

Component({
    properties: {
        image: {
            type: String,
            default: ''
        }
    },
    data: {
        isShow: false
    },
    methods: {
        show() {
            this.setData({
                isShow: true
            })
        },
        hide() {
            this.setData({
                isShow: false
            })
        },
        getLongPressEvent() {
            try{
                const umaConfig = umaEvent.longPressToShare;
                new Tracker(wx).generate(umaConfig.tag);
            }
            catch (e) {
                console.log('友盟数据统计',e);
            }
        }
    }
});
