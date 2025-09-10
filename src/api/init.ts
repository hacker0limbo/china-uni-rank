import axios from "axios";
import { Toast } from "antd-mobile";

// 缓存 hash 值, key 是 url, value 是 hash, e.g. { "http://www.shanghairanking.cn": "1757297452", "http://www.shanghairanking.com": "1755221973" }
const cachedHash: { [key: string]: string } = {};

// 请求软科中文官网, 然后通过正则拿到其中的 hash 值, 拿不到返回 null
export function getARWUHash(url: string) {
  if (cachedHash[url]) {
    Toast.clear();
    return Promise.resolve(cachedHash[url]);
  } else {
    Toast.show({
      content: "初始化中...",
      icon: "loading",
    });

    return axios
      .get<string>(url)
      .then((res) => {
        // 页面存在某个字符串为: <link rel="preload" href="/_nuxt/static/1757297452/payload.js" as="script">, 通过正则匹配拿到其中的 hash
        const match = res.data.match(/_nuxt\/static\/(\d+)\/payload\.js/);
        if (match) {
          const hash = match[1];
          console.log("获取到软科的 hash 值:", hash);
          cachedHash[url] = hash;
          return hash;
        } else {
          return "";
        }
      })
      .catch((err) => {
        console.log("error: 获取 hash 值失败了", err);
        Toast.clear();
        return "";
      })
      .finally(() => {
        Toast.clear();
      });
  }
}
