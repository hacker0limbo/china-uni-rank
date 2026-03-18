import React, { useEffect, useMemo, useState } from "react";
import { TabBar, Toast } from "antd-mobile";
import { AppOutline, SetOutline } from "antd-mobile-icons";
import { HashRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Settings, ThemeSetting } from "./pages/settings";
import { Universities, University } from "./pages/universities";
import {
  getUnivListWithCategories,
  getHMTUnivList,
  USNEWS_RANK_KEY,
  THE_RANK_KEY,
  QS_RANK_WORLD_TREND_KEY,
  QS_RANK_ASIAN_TREND_KEY,
  QS_RANK_KEY,
  ARWU_RANK_KEY,
} from "./api";
import { useHMTUniversityStore, useUniversityStore } from "./store";
import { QSRank, QSRankings } from "./pages/qs";
import { THERank, THERankings } from "./pages/the";
import { USNewsRank, USNewsRankings } from "./pages/usnews";
import { ARWURank, ARWURankings } from "./pages/arwu";
import { useSettingsStore } from "./store";
import { HMTUniversities, HMTUniversity } from "./pages/hmt-universities";
import { arwuHMTCountryLabels } from "./constant";
import { SWRConfig } from "swr";

Toast.config({
  duration: 1000,
  maskClickable: false,
});

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUnivList, setCategoryData } = useUniversityStore();
  const { setHMTUnivList } = useHMTUniversityStore();
  const showTabBar = useMemo(
    () => location.pathname === "/" || location.pathname.startsWith("/settings"),
    [location.pathname],
  );
  const theme = useSettingsStore((state) => state.theme);
  const [loadingUnivList, setLoadingUnivList] = useState(false);
  const [loadingHMTUnivList, setLoadingHMTUnivList] = useState(false);

  useEffect(() => {
    // 获取大陆高校数据
    setLoadingUnivList(true);
    getUnivListWithCategories()
      .then((res) => {
        console.log("获取到所有国内高校数据了~~~~");
        const { univList, categoryData } = res?.data?.[0] ?? {};
        // 只保留本科学校, 其他学校不关心
        setUnivList(univList.filter((univ) => univ.eduLevel === 10));
        setCategoryData(categoryData);
      })
      .finally(() => {
        setLoadingUnivList(false);
      });
  }, [setCategoryData, setUnivList]);

  useEffect(() => {
    // 获取港澳台高校数据
    setLoadingHMTUnivList(true);
    getHMTUnivList()
      .then((res) => {
        console.log("获取到所有港澳台高校数据了~~~~");
        const allHMTCountries = arwuHMTCountryLabels.map((c) => c.value);
        setHMTUnivList(res.data?.data?.filter((univ) => allHMTCountries.includes(univ.region)));
      })
      .finally(() => {
        setLoadingHMTUnivList(false);
      });
  }, [setHMTUnivList]);

  useEffect(() => {
    // 根据状态设置主题
    document.documentElement.setAttribute("data-prefers-color-scheme", theme === "dark" ? "dark" : "light");
  }, [theme]);

  useEffect(() => {
    if (loadingUnivList || loadingHMTUnivList) {
      Toast.show({
        content: "加载数据中",
        icon: "loading",
        // 一直显示 loading
        duration: 0,
      });
    } else {
      // 手动清除
      Toast.clear();
    }
  }, [loadingHMTUnivList, loadingUnivList]);

  // 粗糙的写一个定时器, 8s 以后如果还在 loading 的话强制关闭 loading
  useEffect(() => {
    setTimeout(() => {
      Toast.clear();
    }, 8000);
  }, []);

  return (
    <SWRConfig
      value={{
        // 5 分钟内相同 key 的请求只会触发一次,
        dedupingInterval: 5 * 60 * 1000,
        onError: (err, key) => {
          // 统一设置报错消息, 注意这里的 key 是序列化过后的, 如果多参数传递数组这种情况会被序列化为一个 string
          let errorMessage = "";
          if (key.includes(USNEWS_RANK_KEY)) {
            errorMessage = "获取 U.S.News 排名数据失败";
          } else if (key.includes(THE_RANK_KEY)) {
            errorMessage = "获取泰晤士排名数据失败";
          } else if (key.includes(QS_RANK_WORLD_TREND_KEY)) {
            errorMessage = "获取 QS 世界排名趋势数据失败";
          } else if (key.includes(QS_RANK_ASIAN_TREND_KEY)) {
            errorMessage = "获取 QS 亚洲排名趋势数据失败";
          } else if (key.includes(QS_RANK_KEY)) {
            errorMessage = "获取 QS 世界排名数据失败";
          } else if (key.includes(ARWU_RANK_KEY)) {
            errorMessage = "获取软科世界排名数据失败";
          } else {
            errorMessage = "获取数据失败";
          }
          Toast.show({
            icon: "fail",
            content: errorMessage,
            duration: 2500,
          });
        },
      }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/universities" element={<Universities />} />
        <Route path="/universities/:up" element={<University />} />
        <Route path="/hmt/universities" element={<HMTUniversities />} />
        <Route path="/hmt/universities/:up" element={<HMTUniversity />} />
        <Route path="/qs" element={<QSRankings />} />
        <Route path="/qs/rank" element={<QSRank />} />
        <Route path="/the" element={<THERankings />} />
        <Route path="/the/rank" element={<THERank />} />
        <Route path="/usnews" element={<USNewsRankings />} />
        <Route path="/usnews/:id" element={<USNewsRank />} />
        <Route path="/arwu" element={<ARWURankings />} />
        <Route path="/arwu/rank" element={<ARWURank />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/theme" element={<ThemeSetting />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showTabBar ? (
        <TabBar
          safeArea
          style={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            backgroundColor: "var(--adm-color-background)",
          }}
          activeKey={`/${location.pathname.split("/")[1]}`}
          onChange={(key) => {
            navigate(key);
          }}
        >
          <TabBar.Item key="/" icon={<AppOutline />} title="首页" />
          <TabBar.Item key="/settings" icon={<SetOutline />} title="设置" />
        </TabBar>
      ) : null}
    </SWRConfig>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
