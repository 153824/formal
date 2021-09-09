import {umaEvent, getEnv, getTag, Tracker} from "../../../../uma.config";

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
            const {evaluationId, evaluationName} = e.currentTarget.dataset;
            wx.navigateTo({
                url: `/pages/station/components/detail/detail?id=${evaluationId}`
            });
            if(location){
                try{
                    const umaConfig = umaEvent.evaluationDetail;
                    new Tracker(wx).generate(umaConfig.tag, {origin: umaConfig.origin[location], name: evaluationName});
                    if(location === 'home'){
                        const umaConfig = umaEvent.evaluationDetailByHome;
                        new Tracker(wx).generate(umaConfig.tag);
                    }
                }
                catch (e) {
                    console.log('友盟数据统计',e);
                }
            }
        }
    }
});
