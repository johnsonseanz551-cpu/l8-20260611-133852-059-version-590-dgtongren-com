# 国产热门电影

这是根据上传素材生成的纯静态电影网站。

- 影片数据：2000 部
- 独立详情页：2000 个
- 分类频道：10 个
- 入口页面：index.html、categories.html、ranking.html、search.html、sitemap.html
- 样式文件：assets/css/site.css
- 交互文件：assets/js/site.js

图片说明：页面已按顶级目录 1.jpg 到 150.jpg 引用封面与 Hero 图片。如果后续把图片放入网站根目录，页面会自动显示对应图片；未放入时使用 CSS 渐变背景兜底，避免页面空白。

播放说明：详情页播放器使用 m3u8 播放方式，优先绑定原 JS 中提取的播放源，并内置 HLS 加载逻辑。
