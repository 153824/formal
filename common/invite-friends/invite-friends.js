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
        }
    }
});
