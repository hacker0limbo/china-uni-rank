import axios from "axios";

/**
 * 专门用于访问 QS 排名趋势的代理, 因为需要带上 x-requested-with header, 极度不稳定
 * proxy 备选地址:
 * https://cors-anywhere.sssc.workers.dev/?
 * https://cors-anywhere.com/
 */

const proxy1 = "https://cors-anywhere.sssc.workers.dev/?";
const proxy2 = "https://cors-anywhere.com/";

export const proxyAxios = axios.create({
  headers: {
    "x-requested-with": "XMLHttpRequest",
  },
});

const proxyUrl = proxy2;

// 加上代理的 url
proxyAxios.interceptors.request.use(function (config) {
  config.url = `${proxyUrl}${config.url}`;
  return config;
});
