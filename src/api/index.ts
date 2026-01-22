import axios, { type AxiosResponse } from "axios";
import queryString from "query-string";
import "./interceptors.ts";
import { WORKER_URL, workerAxios } from "./proxy.ts";
import { qsLatestYearNid, theYears, usnewsCountries, arwuYears, theLatestYear } from "../constant";

// 软科中文站地址
export const ARWU_BASE_URL = "https://www.shanghairanking.cn";
// 软科英文站地址
export const ARWU_EN_BASE_URL = "https://www.shanghairanking.com";

// qs 官网地址
export const QS_BASE_URL = "https://www.topuniversities.com";

// 泰晤士官网
export const THE_BASE_URL = "https://www.timeshighereducation.com";

// USNews 官网地址
export const USNEWS_BASE_URL = "https://www.usnews.com";

// 港澳台学校详情
export type HMTUniversityARWUDetail = {
  nameEn: string;
  univLogo: string;
  univUp: string;
  introEn: string;
  website: string;
  // 建校时间 e.g. 1981
  foundYear: number;
  // 所在地
  region: string;
  regionDetail: string;
  // 学校地址
  address: string;
  // 哪个排名
  rankingInfo: string;
  // arwu 排名
  ranking: string;
  detail: {
    arwu: UniversityARWUDetail["details"]["arwu"];
    gras: UniversityARWUDetail["details"]["gras"];
  };
};

// 港澳台具体某个大学他详细信息
type HMTInstitutionUnivARWUResponse = {
  data: [{ univData: HMTUniversityARWUDetail }];
  fetch: object;
  mutations: [];
};

// 获取港澳台具体某个大学的详细信息
export async function getHMTUnivDetailsFromARWU(univUp: string): Promise<HMTInstitutionUnivARWUResponse> {
  return new Promise((resolve, reject) => {
    // 创建模拟的函数, 拿到高校数据, arwu_uni_hmt_detail 为自定义的函数名, 替换掉 __NUXT_JSONP__ 防止重复
    (window as any).arwu_uni_hmt_detail = function (_url: string, payload: HMTInstitutionUnivARWUResponse) {
      resolve(payload);
    };
    const script = document.createElement("script");
    script.src = `${WORKER_URL}/arwu/uni/hmt/${univUp}`;
    console.log("脚本", script.src);
    script.onload = () => {
      console.log(`加载获取${univUp}港澳台高校脚本成功`);
      // 移除脚本 避免重复创建
      document.body.removeChild(script);
    };
    script.onerror = (err) => {
      console.log(`加载获取${univUp}港澳台高校脚本失败`);
      document.body.removeChild(script);
      reject(err);
    };
    document.body.appendChild(script);
  });
}

// 港澳台大学基本信息, 用于列表展示
export type HMTUniversityARWU = {
  // 英文名
  nameEn: string;
  univLogo: string;
  // up 值, 唯一 id
  univUp: string;
  // 地区
  region: string;
  // 排名信息 e.g. ARWU 2024
  rankingInfo: string;
  // e.g. 1
  ranking: string;
};

export type HMTUniversityARWUListResponse = {
  code: number;
  msg: string;
  data: HMTUniversityARWU[];
};

// 获取所有港澳台地区高校
export function getHMTUnivList() {
  // query string 直接写死, 因为不支持多地区参数查询, 直接一次性查所有数据
  return workerAxios.get<HMTUniversityARWUListResponse>("/arwu/uni/hmt");
}

// 大学列表的分类数据
export type UniversityCategoriesARWU = {
  // 所有省份枚举, e.g. [{ name: 全部, code: 0 }, { name: 北京, code: 11 }]
  provinces: { name: string; code: number }[];
  // 所有学校类型分类, e.g. [{ name: 全部, code: 0 }, { name: 理工, code: 1 }]
  univCategories: { name: string; code: number }[];
  // 所有学校等级, 双一流, 985, 211, 教育部直属等 e.g. [{ name: 全部, code: 0 }, { name: 双一流, code: 105 }]
  univLevels: { name: string; code: number }[];
  // 学校等级, 本科/专科等, e.g. [{ name: 全部, code: 0 }, { name: 普通本科, code: 10 }, { name: 职业专科, code: 15 }]
  eduLevels: { name: string; code: number }[];
};

// 大学的基本信息, 用于列表展示
export type UniversityARWU = {
  // e.g. tsinghua-university
  up: string;
  // 学校编码, e.g. RC00001
  univCode: string;
  // 中文名称, e.g. 清华大学
  nameCn: string;
  // 英文名称 e.g. Tsinghua University
  nameEn: string;
  // log 地址, e.g. logo/27532357.png
  logo: string;
  // 学校的标签, e.g. ["双一流", "985", "211"]
  tags: string[];
  // 是否被收藏
  liked: boolean;
  // 在那个省 e.g. 北京
  provinceShort: string;
  // 那个市 e.g. 杭州市
  cityName: string;
  // 对应上面的 univCategories, e.g. 综合
  categoryName: string;
  // 最新中国大学排名
  rankBcur: string;
  // 对应上面的 univLevels, e.g. 双一流
  level: string;
  // 对应上面的 eduLevels, e.g. 10
  eduLevel: number;
  univEnv: {
    // 咨询电话
    consultPhone: string | null;
    // 咨询邮箱
    email: string | null;
    // 基础设施
    inds:
      | {
          id: number;
          // 不同的设施标题, e.g. 宿舍条件
          name: string;
          children: {
            id: number;
            // 设施具体情况, e.g. 两人间
            name: string;
            // 具体设施的值, e.g. 34, 或者为空字符串, 代表这个设施数量
            val: string;
          }[];
        }[]
      | null;
    // 学校图片
    pubPicture:
      | {
          id: number;
          // 图片路径 e.g. "/univ_env/2021/11/25/9a6e5dce-c37f-4681-a98d-edd0a860f6ad.jpg";
          imgUrl: string;
        }[]
      | null;
    // 学校这些信息的发布日期
    publishedAt: string | null;
    // 纯文字, 包括这个学校的理由
    reason: string[] | null;
  };
  // 对应上面的 univLevels, 包含所有的标签, e.g. [105, 985, 211, 11]
  charCode: number[];
};

// 所有大学列表简介的 payload
type InstitutionARWUResponse = {
  data: [{ categoryData: UniversityCategoriesARWU; univList: UniversityARWU[]; filterList: UniversityARWU[] }];
  fetch: object;
  mutations: [];
};

// 基于软科中文官网获取所有大学列表
export async function getUnivListWithCategories(): Promise<InstitutionARWUResponse> {
  return new Promise((resolve, reject) => {
    // 创建模拟的函数, 拿到高校数据
    (window as any).arwu_uni_cn_list = function (_url: string, payload: InstitutionARWUResponse) {
      resolve(payload);
    };
    const script = document.createElement("script");
    script.src = `${WORKER_URL}/arwu/uni/cn`;
    script.onload = () => {
      console.log("加载获取所有大陆高校脚本成功");
      // 移除脚本 避免重复创建
      document.body.removeChild(script);
    };
    script.onerror = (err) => {
      console.log("加载获取所有大陆高校脚本失败");
      document.body.removeChild(script);
      reject(err);
    };
    document.body.appendChild(script);
  });
}

// 具体某个大学的详细信息
export type UniversityARWUDetail = {
  // 历史沿革
  intro: string | null;
  // 学校官网地址
  url: string | null;
  // 学校简介
  uicIntro: string | null;
  // 排名, 学科等具体信息
  details: {
    // 中国大学排名
    bcur: {
      datasetId: number;
      // 关于这个排名的简介
      intro: string;
      latestVerNo: number;
      rkCategory: {
        name: string;
        rankChange: number;
        // 最新排名
        ranking: string;
      };
      rkHistory: {
        // 排名 e.g. 3
        ranking: string;
        // 年份, e.g. 2023
        yr: number;
      }[];
    };
    // 世界大学排名
    arwu: {
      datasetId: number;
      // 关于这个排名的简介
      intro: string;
      latestVerNo: number;
      rkHistory: {
        // 排名 e.g. 3
        ranking: string;
        // 年份, e.g. 2023
        yr: number;
      }[];
      rkLatest: {
        name: string;
        // 最新排名
        ranking: string;
      };
    };
    // 软科中国最好学科排名
    bcsr: {
      // 榜上有名的学科数量, e.g. {title: 上榜学科数, value: 5}
      bcsrCount: {
        title: "string";
        value: number;
      }[];
      // 最新更新日期: 2024
      latestVerNo: number;
      numOnList: number;
      // 优势学科
      subjAdva: {
        // e.g. 0803
        code: string;
        // e.g. 光学工程
        name: string;
        // e.g. 前3%
        rankTopLevel: string;
        // e.g. 3
        ranking: number;
      }[];
      // 所有学科
      subjCategory: {
        // 大类名称, e.g. 经济学
        name: string;
        // 具体细分类
        subj: {
          // e.g. 0803
          code: string;
          // e.g. 理论经济学
          name: string;
          // e.g. 前3%
          rankTopLevel: string;
          // e.g. 3
          ranking: number;
          // 索引
          index: number;
        }[];
      }[];
    };
    // 世界一流学科排名
    gras: {
      grasCount: {
        // e.g. 上榜学科数
        title: string;
        value: number;
      }[];
      latestVerNo: number;
      numOnList: number;
      // 优势学科
      subjAdva: {
        // 学科代码
        code: string;
        // e.g. 食品科学与工程
        name: string;
        // 排名
        ranking: "3";
      }[];
      // 所有学科
      subjCategory: {
        // 学科大类
        name: string;
        subj: {
          // 学科代码
          code: string;
          // e.g. 数学
          name: string;
          // 排名区间范围 e.g. 51-75
          ranking: string;
          index: number;
        }[];
      }[];
    };
    // 软科中国大学专业排名
    bcmr: {
      latestVerNo: number;
      bcmrCount: {
        // e.g. 上榜专业数
        title: "string";
        value: number;
      }[];
      // 全部专业, 细分到所有的小专业
      majorAll: [
        {
          name: "全部";
          children: {
            id: number;
            pid: number;
            // e.g. 哲学
            name: string;
            // 专业代码
            code: string;
            ordNo: number;
            remark: string;
            children: any;
            // 排名
            ranking: number;
            // 专业评级
            grade: string;
          }[];
        },
      ];
      // 优势专业
      majorAdva: {
        id: number;
        pid: number;
        // e.g. 哲学
        name: string;
        // 专业代码
        code: string;
        ordNo: number;
        remark: string;
        children: any;
        // 排名
        ranking: number;
        // 专业评级
        grade: string;
      }[];
      // A+ 专业
      majorAPlus: {
        // A+专业
        name: string;
        children: {
          id: number;
          pid: number;
          // e.g. 哲学
          name: string;
          // 专业代码
          code: string;
          ordNo: number;
          remark: string;
          children: any;
          // 排名
          ranking: number;
          // 专业评级
          grade: string;
        }[];
      };
    };
  };
} & UniversityARWU;

// 具体某个大学的详细信息的 payload,
type InstitutionUnivARWUResponse = {
  data: [{ univData: UniversityARWUDetail; title: string; descContent: string }];
  fetch: object;
  mutations: [];
};

// 基于软科中文官网获取某个大学的详细信息
export async function getUnivDetailsFromARWU(univUp: string): Promise<InstitutionUnivARWUResponse> {
  return new Promise((resolve, reject) => {
    // 创建模拟的函数, 拿到高校数据
    (window as any).arwu_uni_cn_detail = function (_url: string, payload: InstitutionUnivARWUResponse) {
      resolve(payload);
    };
    const script = document.createElement("script");
    script.src = `${WORKER_URL}/arwu/uni/cn/${univUp}`;
    script.onload = () => {
      console.log(`加载获取${univUp}高校脚本成功`);
      // 移除脚本 避免重复创建
      document.body.removeChild(script);
    };
    script.onerror = (err) => {
      console.log(`加载获取${univUp}高校脚本失败`);
      document.body.removeChild(script);
      reject(err);
    };
    document.body.appendChild(script);
  });
}

export type ARWUWoldRanking = {
  // 排名
  ranking: string;
  // 学校编码
  univCode: string;
  // 中文名
  univNameCn: string;
  // up 值, 作为唯一值, e.g. tsinghua-university
  univUp: string;
  // 如果是国外学校用这个作为唯一值, 包括香港, 澳门和台湾都没有 univUp, 只有 univUpEn
  univUpEn: string;
  // logo 地址
  univLogo: string;
  inbound: boolean;
  univLikeCount: number;
  liked: boolean;
  region: string;
  // 地区排名
  regionRanking: string;
  // 总得分
  score: number;
  // 各个指标的得分, key 为 indList 里面的 code, value 为得分
  indData: Record<string, number>;
};

export type ARWUWoldRankingsResponse = {
  data: [
    {
      reportData: object;
      year: string;
      yearList: { label: string; value: number }[];
      // 所有指标的索引
      indList: {
        // id, e.g. 159
        code: string;
        // 得分标题, e.g. "校友获奖"
        nameCn: string;
        weight: null;
        id: number;
      }[];
      // 所有地区
      regionList: { name: string; value: string }[];
      univData: ARWUWoldRanking[];
    },
  ];
  fetch: object;
  mutations: [];
};

// 获取软科世界排名
export async function getARWUWoldRankings(year = arwuYears[0]): Promise<ARWUWoldRankingsResponse> {
  return workerAxios.get(`/arwu/rank/${year}`);
}

// qs 排名

export type QSWorldRankingsRequestOptions = {
  // e.g. 4061771, 对应 2026
  nid?: string;
  // 第几页
  page?: number;
  // 每页多少条数据
  items_per_page?: number;
  // e.g. indicators
  tab?: string;
  region?: string;
  // e.g. [cn,hk,tw,mo]
  countries?: string[];
  cities?: string[];
  search?: string;
  star?: string;
  sort_by?: string;
  order_by?: string;
  program_type?: string;
  scholarship?: string;
  fee?: string;
  english_score?: string;
  academic_score?: string;
  mix_student?: string;
  loggedincache?: string;
};

export type QSWorldRanking = {
  // e.g. 4067199
  score_nid: string;
  // e.g. 294256
  nid: string;
  advanced_profile: number;
  // 用于发送后续具体某个学校 qs 详情的 id, e.g. 268
  core_id: string;
  // e.g. The University of Hong Kong
  title: string;
  // e.g. "/universities/university-hong-kong"
  path: string;
  // e.g. "Asia";
  region: string;
  // e.g. "Hong Kong SAR";
  country: string;
  // e.g. "Hong Kong";
  city: string;
  // e.g. "https://www.topuniversities.com/sites/default/files/the-university-of-hong-kong_268_medium.jpg";
  logo: string;
  // 总分, e.g. "94.2";
  overall_score: string;
  // 展示的排名, e.g. 11
  rank_display: string;
  // 排名, e.g. =11
  rank: string;
  stars: string;
  dagger: boolean;
  redact: boolean;
  isShortlisted: number;
  more_info: {
    // e.g. International Fees
    label: string;
    value: string;
  }[];
  scores: Record<string, { indicator_id: string; indicator_name: string; rank: string; score: string }[]>;
};

export type QSWorldRankingsResponse = {
  current_user: number;
  total_record: number;
  current_page: number;
  items_per_page: number;
  total_pages: number;
  score_nodes: QSWorldRanking[];
};

// 拿所有学校的 QS 排名
export function getQSWorldRankings(options: QSWorldRankingsRequestOptions) {
  const defaultOptions: QSWorldRankingsRequestOptions = {
    // 默认拿最新的数据
    nid: qsLatestYearNid,
    page: 0,
    items_per_page: 20,
    tab: "indicators",
    // 默认查询中国香港、澳门、台湾和大陆的高校
    countries: ["cn", "hk", "tw", "mo"],
  };
  return workerAxios.get<QSWorldRankingsResponse>(
    `qs/rank?${queryString.stringify(
      { ...defaultOptions, ...options },
      {
        arrayFormat: "comma",
        skipEmptyString: true,
        skipNull: true,
        // 禁止对 key 排序, 否则会导致请求失败
        sort: false,
      },
    )}`,
  );
}

export type QSUnivRankByYear = {
  // x 为年份
  x: number;
  // y 为排名
  y: number;
  // 真实排名
  r: string;
};

// 注意这个 response 会返回包含三个数据的数组, 第二个元素是需要的值
export type QSUnivRankTrendResponse = {
  command: string;
  merge: boolean;
  settings: {
    qs_profiles: {
      json_data: QSUnivRankByYear[];
      json_zones: object[];
    };
  };
}[];

// qs 世界排名趋势
export function getQSUnivRankTrend(coreId: string) {
  return workerAxios.get<QSUnivRankTrendResponse>(`/qs/rank/world-trend/${coreId}`);
}

// qs 亚洲排名趋势
export function getQSUnivRankTrendAsian(coreId: string) {
  return workerAxios.get<QSUnivRankTrendResponse>(`qs/rank/asian-trend/${coreId}`);
}

// 泰晤士排名

export type THEWorldRanking = {
  rank_order: string;
  // 排名, e.g. 1
  rank: string;
  // 中文名字
  name: string;
  // 总得分
  scores_overall: string;
  // 总得分排名, 这里数据有点问题, 会多一个 0, 例如排名是 1, 这里会是 10
  scores_overall_rank: string;
  // 教学得分
  scores_teaching: string;
  // 教学得分排名
  scores_teaching_rank: string;
  // 研究环境得分
  scores_research: string;
  // 研究环境得分排名
  scores_research_rank: string;
  // 研究质量得分
  scores_citations: string;
  // 研究质量得分排名
  scores_citations_rank: string;
  // 产业得分
  scores_industry_income: string;
  // 产业得分排名
  scores_industry_income_rank: string;
  // 国际展望得分
  scores_international_outlook: string;
  // 国际展望得分排名
  scores_international_outlook_rank: string;
  record_type: string;
  member_level: string;
  // 对应泰晤士官网学校的详情, e.g. "/cn/world-university-rankings/university-oxford";
  url: string;
  // 学校唯一值
  nid: number;
  // 所在地, e.g. 英国
  location: string;
  // 全职学生数量 e.g. 26000
  stats_number_students: string;
  // 每位教职员对学生的数量 e.g. 10.8
  stats_student_staff_ratio: string;
  // 国际学生比例 e.g. 43%
  stats_pc_intl_students: string;
  // 女生对男生比例 e.g. 51:49
  stats_female_male_ratio: string;
  // 别名 e.g. Tsinghua University Qinghua University Tsing hua University Qing hua University
  aliases: string;
  // 提供的学科, e.g. a,b,c
  subjects_offered: string;
  closed: boolean;
  unaccredited: boolean;
  disabled: boolean;
  apply_link: string;
  cta_button: object;
};

export type THEWorldRankingsResponse = {
  data: THEWorldRanking[];
  locations: object;
  pillars: object;
  subjects: object;
};

export type THEUnivRankTrendItem = {
  // 排名分类, e.g. World University Rankings
  ranking: string;
  // 哪些指标, e.g. [Overall, teaching]
  indicators: string[];
  // 不同年份的排名, e.g. { 2011: 37, 2022: 36 }
  rank: Record<string, string>;
  // key 为年份, value 为对应 indicator 的的得分, e.g. { 2011: [70, 60], 2022: [80, 90] }
  scores: Record<string, number[]>;
};

export type THEUnivRankTrendResponse = {
  // 所有分类的排名的名称
  rankingSchema: string[];
  config: object[];
  // 不同分类下的排名情况, 例如世界排名, 亚洲排名等等
  data: THEUnivRankTrendItem[];
};

// 获取泰晤士所有世界排名
export function getTHEWorldRankings(year: (typeof theYears)[number] = theLatestYear) {
  // 默认拿最新一年的数据
  return workerAxios.get<THEWorldRankingsResponse>(`/the/rank/${year}`);
}

export function getTHEUnivRankTrend(nid: string): Promise<AxiosResponse<THEUnivRankTrendResponse>> {
  // @ts-ignore
  return Promise.resolve({
    data: {
      rankingSchema: [],
      config: [],
      data: [],
    },
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
  });
}

// USNews

export type USNewsWorldRankingOptions = {
  format?: string;
  name?: string;
  country?: string[] | string;
  page?: number;
};

export type USNewsWorldRanking = {
  url: string;
  // 学校唯一 id
  id: number;
  // e.g. Tsinghua University
  name: string;
  // 所在城市
  city: string;
  country_name: keyof typeof usnewsCountries;
  three_digit_country_code: string;
  ranks: [
    {
      // 排名, 如果未排名, 则为 Unranked
      value: string;
      // 是否并列排名
      is_tied: false;
      // 是否有排名
      is_ranked: false;
      // string 排名类型, e.g. "Best Global Universities"
      label: string;
    },
  ];
  // 一些数据, e.g. { value: "100", label: "Global Score" }
  stats: {
    value: string;
    label: string;
  }[];
  blurb: "";
};

// 获取 USNews 世界大学排名
/**
 * 由于 USnews 的设置, 无法直接通过请求获取, 请使用 /store/usnews.json 作为数据来源
 * @param options @deprecated
 */
export function getUSNewsWorldRankings(options?: USNewsWorldRankingOptions) {
  const defaultOptions: USNewsWorldRankingOptions = {
    format: "json",
    country: ["china", "hong-kong", "macau", "taiwan"],
    page: 1,
  };
  return axios.get(
    `${USNEWS_BASE_URL}/education/best-global-universities/api/search?${queryString.stringify(
      {
        ...defaultOptions,
        ...options,
      },
      {
        arrayFormat: "none",
        skipEmptyString: true,
        skipNull: true,
        sort: false,
      },
    )}`,
    {
      headers: {
        referrer: "https://www.usnews.com/",
      },
    },
  );
}
