// 列表页每页显示的高校数量
export const PAGE_SIZE = 20;

// 软科港澳台地区枚举 TODO: 这里的 value 可能会变更, 需要定期去官网确认
export const arwuHMTCountryLabels = [
  {
    label: "全部地区",
    value: "all",
  },
  {
    label: "中国香港",
    value: "Hong Kong, China",
  },
  {
    label: "中国澳门",
    value: "Macau, China",
  },
  {
    label: "中国台湾",
    value: "Taiwan, China",
  },
];

// 软科排名支持的年份
export const arwuYears = ["2025", "2024", "2023", "2022"];

// NOTE: 注意这里国家不能修改, 因为是官网的 region 选项
export const arwuCountries = ["全部地区", "中国", "中国香港", "中国台湾", "中国澳门"];

// qs 里的 nid 来匹配年份
export const qsNidToYear = {
  "4061771": 2026,
  "3990755": 2025,
  "3897789": 2024,
  "3816281": 2023,
};

// 拿到 qs 最新年份的 nid
export const qsLatestYearNid = Math.max(
  ...Object.keys(qsNidToYear).map(Number),
)?.toString() as keyof typeof qsNidToYear;

// qs 排名的国家筛选
export const qsCountryLabels = [
  {
    label: "全部地区",
    value: "All",
    queryValue: ["cn", "hk", "tw", "mo"],
  },
  {
    label: "中国内地",
    value: "China (Mainland)",
    queryValue: ["cn"],
  },
  {
    label: "中国香港",
    value: "Hong Kong SAR",
    queryValue: ["hk"],
  },
  {
    label: "中国台湾",
    value: "Taiwan",
    queryValue: ["tw"],
  },
  {
    label: "中国澳门",
    value: "Macau SAR",
    queryValue: ["mo"],
  },
];

// 泰晤士排名支持的年份
export const theYears = ["2025", "2024", "2023"] as const;

// 泰晤士所有国家
export const theCountries = ["全部地区", "China", "Hong Kong", "Taiwan", "Macao"];

// 拿最新的年份
export const theLatestYear = theYears[0];

export const usnewsCountries = {
  All: "全部地区",
  China: "中国内地",
  "Hong Kong": "中国香港",
  Taiwan: "中国台湾",
  Macau: "中国澳门",
};
