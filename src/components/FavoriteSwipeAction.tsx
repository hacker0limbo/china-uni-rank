import { SwipeAction, Toast } from "antd-mobile";
import { useFavoriteUnivStore } from "../store";

export type FavoriteSwipeActionProps = {
  children: React.ReactNode;
  // 收藏操作的学校的 up
  univUp: string;
  // 是否是港澳台的标识
  hmt?: boolean;
};

export function FavoriteSwipeAction({ children, univUp, hmt = false }: FavoriteSwipeActionProps) {
  const favoriteUps = useFavoriteUnivStore((state) => state.favoriteUps);
  const addFavorite = useFavoriteUnivStore((state) => state.addFavorite);
  const removeFavorite = useFavoriteUnivStore((state) => state.removeFavorite);
  const isFavorite = favoriteUps?.map((u) => u.up)?.includes(univUp);

  return (
    <SwipeAction
      rightActions={[
        {
          key: "favorite",
          text: isFavorite ? "取消收藏" : "收藏",
          color: isFavorite ? "danger" : "warning",
        },
      ]}
      onAction={(action) => {
        if (action.key === "favorite") {
          if (isFavorite) {
            removeFavorite(univUp);
          } else {
            addFavorite(univUp, hmt);
          }
          Toast.show({
            icon: "success",
            content: isFavorite ? "取消收藏成功" : "收藏成功",
          });
        }
      }}
    >
      {children}
    </SwipeAction>
  );
}
