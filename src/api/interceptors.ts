import axios from "axios";

// 代理地址, 用于访问 qs 等网站的数据: https://codetabs.com/cors-proxy/cors-proxy.html, 注意限制是一分钟 5 次请求
const PROXY_URL = "https://api.codetabs.com/v1/proxy?quest=";

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    if (config.url && config.method === "get") {
      // 需要加上 encodeURIComponent 否则后面的 query 参数会被截断
      config.url = `${PROXY_URL}${encodeURIComponent(config.url)}`;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);
