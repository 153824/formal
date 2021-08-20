Component({
    data: {
        isShow: false,
        stepName: 'record'
    },
    methods: {
        hide() {
           this.setData({
               isShow: false
           })
        },
        show() {
            this.setData({
                isShow: true
            })
        },
        submit() {
            console.log('done');
            this.setData({
                stepName: 'done'
            })
        }
    }
});
