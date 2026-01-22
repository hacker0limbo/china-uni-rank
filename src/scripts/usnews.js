/**
 * @deprecated 此脚本已废弃, 获取数据改为在 worker 里完成
 */

import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// 获取当前模块文件的绝对路径（__filename 替代）
const __filename = fileURLToPath(import.meta.url);

// 获取当前文件所在目录（__dirname 替代）
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.resolve(__dirname, "../store/usnews.json");

// 获取中国大陆和港澳台地区的 U.S. News 世界大学排名数据
function getUSNewsWorldRankingsData(page = 1) {
  return fetch(
    `https://www.usnews.com/education/best-global-universities/api/search?format=json&country=china&country=hong-kong&country=macau&country=taiwan&page=${page}`,
    {
      headers: {
        accept: "*/*",
        Referer: "https://www.usnews.com/",
      },
      body: null,
      method: "GET",
    },
  )
    .then((res) => res.json())
    .then((data) => {
      const { items, total_pages } = data;
      return { items, total_pages };
    });
}

// 初始化：重写文件内容为空数组
await writeFile(OUTPUT_FILE, "[]", "utf-8");

async function appendToFile(newDataArray) {
  const currentContent = await readFile(OUTPUT_FILE, "utf-8");
  const currentArray = JSON.parse(currentContent); // 原始大数组
  const combined = currentArray.concat(newDataArray); // 合并
  await writeFile(OUTPUT_FILE, JSON.stringify(combined, null, 2), "utf-8"); // pretty 写入
}

async function main() {
  console.log("🚀 开始请求第一页获取 total_pages...");
  const firstPage = await getUSNewsWorldRankingsData(1);

  const totalPages = firstPage.total_pages ?? 1;
  await appendToFile(firstPage.items);
  console.log(`✅ 第 1 页完成，total_pages = ${totalPages}`);

  for (let page = 2; page <= totalPages; page++) {
    const { items } = await getUSNewsWorldRankingsData(page);
    await appendToFile(items);
    console.log(`✅ 第 ${page} 页完成`);
  }

  console.log("🎉 全部页数处理完毕，结果已写入 result.json");
}

main();
