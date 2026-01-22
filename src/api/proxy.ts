import axios from "axios";

export const WORKER_URL = "https://china-uni-rank-worker.stephen-yin.workers.dev";

// 用于转发请求绕过 cors 限制的 bff 层的 worker
export const workerAxios = axios.create({
  baseURL: WORKER_URL,
});
