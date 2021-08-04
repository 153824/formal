import {umaEvent, getEnv} from "../../../../uma.config";

Component({
    properties: {
        evaluationId: String,
        title: String,
        topic: String,
        tip: String,
        cover: String,
        tag: String,
        location: String,
        isRichTextModel: {
            type: Boolean,
            default: false
        }
    },
    data: {},
    methods: {
        goToEvaluationDetail(e) {
            const {location} = this.properties;
            const {evaluationId} = e.currentTarget.dataset;
            wx.navigateTo({
                url: `/pages/station/components/detail/detail?id=${evaluationId}`
            });
            if(location){
                const umaConfig = umaEvent.evaluationDetail;
                wx.uma.trackEvent(umaConfig.tag, {origin: umaConfig.origin[location], env: getEnv(wx)});
            }
        }
    }
});
