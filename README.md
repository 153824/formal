# luoke-hola
好啦测评小程序

## 小程序基本信息

- 原始ID： `gh_1d6200d49ef1`
- appid: `wx85cde7d3e8f3d949`
- appid：`wxdb1dcb4a9e212d32`
## 程序目录说明
```$xslt
├─app.js
├─app.json
├─app.wxss
├─config.js
├─project.config.json
├─README.md
├─sitemap.json
├─utils                             #通用函数库目录
├─pages                             #小程序页面目录
|   ├─user                          #用户中心
|   |  ├─user.js
|   |  ├─user.json
|   |  ├─user.wxml
|   |  ├─user.wxss
|   |  ├─images
|   |  ├─components                 #用户中心副页
|   |  |     ├─ticket
|   |  |     ├─teamTitle
|   |  |     ├─teamTicket
|   |  |     ├─teams
|   |  |     ├─teamInvite
|   |  |     ├─selTeamAdmin
|   |  |     ├─myTeam
|   |  |     ├─invoice
|   |  |     ├─addGroup
|   ├─station                        #人岗匹配
|   |    ├─station.js
|   |    ├─station.json
|   |    ├─station.wxml
|   |    ├─station.wxss
|   |    ├─images
|   |    ├─components                #人岗匹配副页
|   |    |     ├─sharePaper
|   |    |     ├─more
|   |    |     ├─detail
|   ├─report                         #测评报告
|   |   ├─report.js
|   |   ├─report.json
|   |   ├─report.wxml
|   |   ├─report.wxss
|   |   ├─images
|   |   ├─components                 #测评副页
|   |   |     ├─shareReport
|   ├─replying                       #作答中心
|   |    ├─replying.js
|   |    ├─replying.json
|   |    ├─replying.wxml
|   |    ├─replying.wxss
|   |    ├─images
|   |    ├─components                 #作答副页
|   |    |     ├─guide
|   |    |     ├─finish
|   ├─manager                         #测评管理  
|   |    ├─manager.js
|   |    ├─manager.json
|   |    ├─manager.wxml
|   |    ├─manager.wxss
|   |    ├─images
|   |    ├─components                 #测评管理副页  
|   |    |     ├─useHistoryDetail
|   |    |     ├─evaluationReport
|   ├─home
|   |  ├─home.js
|   |  ├─home.json
|   |  ├─home.wxml
|   |  ├─home.wxss
|   |  ├─images
├─images                              #公共图像资源
|   ├─icon
├─common                              #通用组件
|   ├─webView.js
|   ├─webView.json
|   ├─webView.wxml
|   ├─webView.wxss
|   ├─vant-weapp
|   ├─title
|   ├─ticket
|   ├─skill
|   ├─serving
|   ├─press
|   ├─meal
|   ├─mask
|   ├─free
|   ├─follow
|   ├─empty
|   ├─colorui
|   ├─checkout
|   ├─catalog
|   ├─card
```
## 自动构建

- 代码的Push会自动推送钉钉群机器人
- 上传体验版本自动提交代码

## 必要的事

- 测试时请先注释app.js下引入的ald模块。
- 默认开启小神推debug模式，版本需要上线请关闭
- 

## 友盟相关
- 悠悠测评appKey：5f72ad6d80455950e49b2a50
- 好啦测评appKey：5f6d5902906ad81117141b70
```
微信开发者工具IDE->详情->本地设置：配置钩选：启用自定义处理命令，在**上传前预处理** 输入以下指令
git add .;git commit -m '小程序自动发布上传';git push
```
