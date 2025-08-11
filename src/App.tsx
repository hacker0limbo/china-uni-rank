import React, { useEffect, useMemo } from "react";
import { TabBar, Toast, SafeArea } from "antd-mobile";
import { AppOutline, SetOutline } from "antd-mobile-icons";
import { Router, Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Settings, ThemeSetting } from "./pages/settings";
import { Universities, University } from "./pages/universities";
import { getUnivListWithCategories } from "./api";
import { useUniversityStore } from "./store";
import { QSRank, QSRankings } from "./pages/qs";
import { THERank, THERankings } from "./pages/the";
import { USNewsRank, USNewsRankings } from "./pages/usnews";
import { ARWURank, ARWURankings } from "./pages/arwu";
import { useSettingsStore } from "./store";

Toast.config({
  duration: 1000,
});

function App() {
  const [location, navigate] = useHashLocation();
  const { setUnivList, setCategoryData, setInitialized } = useUniversityStore();
  const showTabBar = useMemo(() => location === "/" || location.startsWith("/settings"), [location]);
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    getUnivListWithCategories().then((res) => {
      const { univList, categoryData } = res?.data?.[0] ?? {};
      console.log("获取到高校数据了~~~~");
      // 只保留本科学校, 其他学校不关心
      setUnivList(univList.filter((univ) => univ.eduLevel === 10));
      setCategoryData(categoryData);
      setInitialized(true);
    });
  }, [setCategoryData, setUnivList, setInitialized]);

  useEffect(() => {
    // 根据状态设置主题
    document.documentElement.setAttribute("data-prefers-color-scheme", theme === "dark" ? "dark" : "light");
  }, [theme]);

  return (
    <>
      <Router hook={useHashLocation}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/universities" component={Universities} />
          <Route path="/universities/:up" component={University} />
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
