import React, { useEffect, useMemo, useState } from "react";
import { TabBar, Toast, SafeArea } from "antd-mobile";
import { AppOutline, SetOutline } from "antd-mobile-icons";
import { Router, Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Settings, ThemeSetting } from "./pages/settings";
import { Universities, University } from "./pages/universities";
import { getUnivListWithCategories, getHMTUnivList } from "./api";
import { useHMTUniversityStore, useUniversityStore } from "./store";
import { QSRank, QSRankings } from "./pages/qs";
import { THERank, THERankings } from "./pages/the";
import { USNewsRank, USNewsRankings } from "./pages/usnews";
import { ARWURank, ARWURankings } from "./pages/arwu";
import { useSettingsStore } from "./store";
import { HMTUniversities, HMTUniversity } from "./pages/hmt-universities";
import { arwuHMTCountryLabels } from "./constant";

Toast.config({
  duration: 1000,
  // maskClickable: false,
});

function App() {
  const [location, navigate] = useHashLocation();
  const { setUnivList, setCategoryData } = useUniversityStore();
  const { setHMTUnivList } = useHMTUniversityStore();
  const showTabBar = useMemo(() => location === "/" || location.startsWith("/settings"), [location]);
  const theme = useSettingsStore((state) => state.theme);
  const [loadingUnivList, setLoadingUnivList] = useState(false);
  const [loadingHMTUnivList, setLoadingHMTUnivList] = useState(false);

  console.log("loading, ", loadingUnivList, loadingHMTUnivList);

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
    <>
      <Router hook={useHashLocation}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/universities" component={Universities} />
          <Route path="/universities/:up" component={University} />
          <Route path="/hmt/universities" component={HMTUniversities} />
          <Route path="/hmt/universities/:up" component={HMTUniversity} />
          <Route path="/qs" component={QSRankings} />
          {/* NOTE: 这里会需要传比较多的 searchParams, 所以这里需要手动匹配 searchParams, 这里的路由是 /qs/rank?coreId=xx&title=yy... */}
          <Route path={/^\/qs\/rank\?.*$/} component={QSRank} />
          <Route path="/the" component={THERankings} />
          <Route path={/^\/the\/rank\?.*$/} component={THERank} />
          <Route path="/usnews" component={USNewsRankings} />
          <Route path="/usnews/:id" component={USNewsRank} />
          <Route path="/arwu" component={ARWURankings} />
          <Route path={/^\/arwu\/rank\?.*$/} component={ARWURank} />
          <Route path="/settings" component={Settings} />
          <Route path="/settings/theme" component={ThemeSetting} />
          <Route component={NotFound} />
        </Switch>
      </Router>
      {showTabBar ? (
        <TabBar
          safeArea
          style={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            backgroundColor: "var(--adm-color-background)",
          }}
          activeKey={`/${location.split("/")[1]}`}
          onChange={(key) => {
            navigate(key);
          }}
        >
          <TabBar.Item key="/" icon={<AppOutline />} title="首页" />
          <TabBar.Item key="/settings" icon={<SetOutline />} title="设置" />
        </TabBar>
      ) : null}
    </>
  );
}

export default App;
