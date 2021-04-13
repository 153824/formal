// index.js
// 获取应用实例
const app = getApp()

Component({
    data: {
        options: [
            {id: 1, name: 'option1', y: 100, active: false},
            {id: 2, name: 'option2', y: 200, active: false},
            {id: 3, name: 'option3', y: 300, active: false},
            {id: 4, name: 'option4', y: 400, active: false}
        ]
    },
    methods: {
        touchstart(e) {
            console.log('touchstart', e)
            let id = e.currentTarget.dataset.id

            var options = this.data.options
            options.forEach(o => {
                o.active = false;
            })
            var o = options.find(o => o.id == id)
            console.log(o)
            o.active = true

            this.setData({
                options
            })

        },
        touchend(e) {
            var that = this
            console.log('touchend', e)

            this.createSelectorQuery().selectAll('.option').boundingClientRect(rects => {
                rects.forEach(rect => {
                    console.log('rect', rect)
                })

                rects.sort((a, b) => {
                    return a.top - b.top
                })
                console.log('rects', rects)

                var arr = that.data.options.map(o => {
                    var _i = rects.findIndex(r => r.dataset.id == o.id)
                    return {y : _i * 100}
                })
                console.log('arr', arr)

                arr.forEach((o, index) => {
                    console.log("o: ",o)
                    that.setData({
                        ['options['+index+'].y'] : o.y
                    })
                })

            }).exec()



        }

    }
})
