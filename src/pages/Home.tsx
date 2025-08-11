import { Card, List, Button, ErrorBlock, SwipeAction, SafeArea } from "antd-mobile";
import { HistogramOutline, UnorderedListOutline } from "antd-mobile-icons";
import { useLocation } from "wouter";
import { Header, UnivListItem } from "../components";
import { useFavoriteUnivStore, useUniversityStore } from "../store";

export function Home() {
  const navigate = useLocation()[1];
  const favoriteUps = useFavoriteUnivStore((state) => state.favoriteUps);
  const removeFavorite = useFavoriteUnivStore((state) => state.removeFavorite);
  const univList = useUniversityStore((state) => state.univList);
  const favoriteUnivList = favoriteUps.map((up) => univList.find((u) => u.up === up)).filter(Boolean);

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
          国内高校
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
        {favoriteUnivList.length ? (
          favoriteUnivList.map((univ) => (
            <SwipeAction
              key={univ?.up}
              onAction={(action) => {
                if (action.key === "unFavorite") {
                  removeFavorite(univ?.up as string);
                }
              }}
              rightActions={[
                {
                  key: "unFavorite",
                  text: "取消收藏",
                  color: "danger",
                },
              ]}
            >
              <UnivListItem univ={univ!} />
            </SwipeAction>
          ))
        ) : (
          <Card>
            <ErrorBlock status="empty" title="暂无收藏的高校" description="前往所有高校添加收藏">
              <Button
                block
                color="primary"
                onClick={() => {
                  navigate("/universities");
                }}
              >
                添加收藏
              </Button>
            </ErrorBlock>
          </Card>
        )}
      </List>
    </div>
  );
}
