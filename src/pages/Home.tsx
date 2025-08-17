import { Card, List, Button, ErrorBlock, SwipeAction, SafeArea, Tabs } from "antd-mobile";
import { HistogramOutline, TravelOutline, UnorderedListOutline } from "antd-mobile-icons";
import { useLocation } from "wouter";
import { FavoriteSwipeAction, Header, HMTUnivListItem, UnivListItem } from "../components";
import { useFavoriteUnivStore, useHMTUniversityStore, useUniversityStore } from "../store";

export function Home() {
  const navigate = useLocation()[1];
  const favoriteUps = useFavoriteUnivStore((state) => state.favoriteUps);
  const removeFavorite = useFavoriteUnivStore((state) => state.removeFavorite);
  const univList = useUniversityStore((state) => state.univList);
  const hmtUnivList = useHMTUniversityStore((state) => state.hmtUnivList);
  const favoriteUnivList = favoriteUps.map((upInfo) => univList.find((u) => u.up === upInfo?.up)).filter(Boolean);
  const favoriteHMTUnivList = favoriteUps
    .map((upInfo) => hmtUnivList.find((u) => u.univUp === upInfo?.up))
    .filter(Boolean);

  return (
    <div style={{ paddingBottom: "calc(60px + env(safe-area-inset-bottom))" }}>
      <Header title="首页" showBack={false} />
      <List header="导航" mode="card">
        <List.Item
          clickable
          prefix={<UnorderedListOutline />}
          onClick={() => {
            navigate("/universities");
          }}
        >
          内地高校
        </List.Item>
        <List.Item
          clickable
          prefix={<TravelOutline />}
          onClick={() => {
            navigate("/hmt/universities");
          }}
        >
          港澳台高校
        </List.Item>
        <List.Item
          clickable
          prefix={<HistogramOutline color="var(--adm-color-yellow)" />}
          onClick={() => {
            navigate("/qs");
          }}
        >
          QS 排名
        </List.Item>
        <List.Item
          clickable
          prefix={<HistogramOutline color="#b70d7f" />}
          onClick={() => {
            navigate("/the");
          }}
        >
          泰晤士排名
        </List.Item>
        <List.Item
          clickable
          prefix={<HistogramOutline color="var(--adm-color-danger)" />}
          onClick={() => {
            navigate("/arwu");
          }}
        >
          软科排名
        </List.Item>

        <List.Item
          clickable
          prefix={<HistogramOutline color="var(--adm-color-primary)" />}
          onClick={() => {
            navigate("/usnews");
          }}
        >
          U.S.News 排名
        </List.Item>
      </List>
      <List header="收藏" mode="card">
        <Tabs>
          <Tabs.Tab title="内地高校" key="mainland">
            {favoriteUnivList.length ? (
              favoriteUnivList.map((univ) => (
                <FavoriteSwipeAction key={univ?.up} univUp={univ?.up as string}>
                  <UnivListItem univ={univ!} />
                </FavoriteSwipeAction>
              ))
            ) : (
              <Card>
                <ErrorBlock status="empty" title="暂无收藏的内地高校" description="前往内地高校列表添加收藏">
                  <Button
                    block
                    color="primary"
                    onClick={() => {
                      navigate("/universities");
                    }}
                  >
                    前往添加
                  </Button>
                </ErrorBlock>
              </Card>
            )}
          </Tabs.Tab>
          <Tabs.Tab title="港澳台高校" key="hmt">
            {favoriteHMTUnivList.length ? (
              favoriteHMTUnivList.map((univ) => (
                <FavoriteSwipeAction key={univ?.univUp} univUp={univ?.univUp as string} hmt>
                  <HMTUnivListItem univ={univ!} />
                </FavoriteSwipeAction>
              ))
            ) : (
              <Card>
                <ErrorBlock status="empty" title="暂无收藏的港澳台高校" description="前往港澳台高校列表添加收藏">
                  <Button
                    block
                    color="primary"
                    onClick={() => {
                      navigate("/hmt/universities");
                    }}
                  >
                    前往添加
                  </Button>
                </ErrorBlock>
              </Card>
            )}
          </Tabs.Tab>
        </Tabs>
      </List>
    </div>
  );
}
