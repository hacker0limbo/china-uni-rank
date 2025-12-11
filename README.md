# China Uni Rank

国内大学(包括港澳台地区)四大排名总览

## 截图

<p>
  <img src="demos/demo1.png" width="18%">
  <img src="demos/demo2.png" width="18%">
  <img src="demos/demo3.png" width="18%">
  <img src="demos/demo4.png" width="18%">
  <img src="demos/demo5.png" width="18%">
</p>

## 本地启动

```bash
npm install
npm run dev
```

## 数据问题

- 软科/高校排名做了防盗链检查, 需要对应的 referrer 才能加载, 目前暂无法解决
- 泰晤士官网改过, 暂时不再暴露接口了, 后续再看怎么处理
- - usnews 为手动爬取, 脚本在 `scripts/usnews.js`
