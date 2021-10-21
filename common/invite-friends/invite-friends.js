Component({
    properties: {
        image: {
            type: String,
            default: ''
        }
    },
    data: {
        isShow: true
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
        }
    }
});
