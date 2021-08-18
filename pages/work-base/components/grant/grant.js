Page({
    data: {
        nav: [
            {
                name: "已完成",
                checked: true
            },
            {
                name: "作答中",
                checked: false
            },
        ],
    },
    onLoad(options) {},
    onChangeTab(e) {
        const {nav} = this.data;
        const {index, name} = e.currentTarget.dataset;
        const targetNav = nav.map((item, key)=>{
            item.checked = key === Number(index);
            return item;
        });
        this.setData({
            nav: targetNav
        })
    }
});
