import axios from "axios";
import { setupCache } from "axios-cache-interceptor";

export const WORKER_URL = "https://china-uni-rank-worker.stephen-yin.workers.dev";

// 用于转发请求绕过 cors 限制的 bff 层的 worker, 开启缓存
export const workerAxios = setupCache(
  axios.create({
    baseURL: WORKER_URL,
  }),
);
