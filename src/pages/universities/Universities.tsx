import { useCallback, useState, useMemo, useRef } from "react";
import {
  SearchBar,
  Grid,
  Dropdown,
  Toast,
  Skeleton,
  ErrorBlock,
  List,
  Tag,
  Space,
  Image,
  Badge,
  InfiniteScroll,
  Picker,
  type SearchBarRef,
  SwipeAction,
} from "antd-mobile";
import { useFavoriteUnivStore, useUniversityStore } from "../../store";
import { AppOutline, DownFill, EnvironmentOutline, FireFill, RedoOutline } from "antd-mobile-icons";
import { ARWU_BASE_URL } from "../../api";
import { sleep } from "../../utils";
import { FavoriteSwipeAction, Header, UnivListItem } from "../../components";
import { PAGE_SIZE } from "../../constant";

// TODO: 使用 react-virtualized 提高性能
export function Universities() {
  const univList = useUniversityStore((state) => state.univList);
  const categoryData = useUniversityStore((state) => state.categoryData);
  // 展示的高校列表, 基于当前页数展示从第一项到当前页数最后一页
  const [searchedText, setSearchedText] = useState<string>("");
  const searchRef = useRef<SearchBarRef>(null);
  // pickers 相关
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  // e.g. ['北京'], 有且仅有一个值
  const [provincePickerValue, setProvincePickerValue] = useState<[string]>(["全部省份"]);
  const [showUnivCategoryPicker, setShowUnivCategoryPicker] = useState(false);
  // e.g. ['综合], 有且仅有一个值
  const [univCategoryPickerValue, setUnivCategoryPickerValue] = useState<[string]>(["全部类型"]);
  const [showUnivLevelPicker, setShowUnivLevelPicker] = useState(false);
  // 注意存的是 level 的 code, e.g. [105] 代表双一流, 有且仅有一个值
  const [univLevelPickerValue, setUnivLevelPickerValue] = useState<[number]>([0]);

  // 对高校进行过滤, 包含搜索框的条件和 picker 的条件
  const filteredUnivList = useMemo(() => {
    const univListByText = searchedText
      ? univList.filter((univ) => univ.nameCn.includes(searchedText.trim()))
      : univList;

    return univListByText
      .filter((u) => (provincePickerValue[0] === "全部省份" ? true : u.provinceShort === provincePickerValue[0]))
      .filter((u) => (univCategoryPickerValue[0] === "全部类型" ? true : u.categoryName === univCategoryPickerValue[0]))
      .filter((u) => (univLevelPickerValue[0] === 0 ? true : u.charCode.includes(univLevelPickerValue[0])));
  }, [provincePickerValue, searchedText, univCategoryPickerValue, univLevelPickerValue, univList]);
  // 模拟一个分页, 用于展示一共到第几页的数据做无限滚动
  const [currentPage, setCurrentPage] = useState<number>(1);
  // 最多多少页
  const totalPages = useMemo(() => Math.ceil(filteredUnivList.length / PAGE_SIZE), [filteredUnivList.length]);
  // 最终页面上展示的高校列表
  const displayedUnivList = useMemo(
    () => filteredUnivList.slice(0, currentPage * PAGE_SIZE),
    [filteredUnivList, currentPage],
  );
  // 收藏
  const favoriteUps = useFavoriteUnivStore((state) => state.favoriteUps);
  const addFavorite = useFavoriteUnivStore((state) => state.addFavorite);
  const removeFavorite = useFavoriteUnivStore((state) => state.removeFavorite);

  // 重置所有搜索条件
  const reset = () => {
    // 重置页数
    setCurrentPage(1);
    // 清空搜索文本
    setSearchedText("");
    // 清空搜索框
    searchRef.current?.clear();
    // 重置所有 picker
    setProvincePickerValue(["全部省份"]);
    setUnivCategoryPickerValue(["全部类型"]);
    setUnivLevelPickerValue([0]);
  };

  return (
    <>
      <Header title="内地高校" />
      <div style={{ padding: 12, backgroundColor: "var(--adm-color-background)" }}>
        <SearchBar
          ref={searchRef}
          // 保证只有在点击相关按钮, 例如搜索取消的时候才触发
          onSearch={(value) => {
            setSearchedText(value);
            setCurrentPage(1); // 重置页数
          }}
          onCancel={() => {
            setSearchedText("");
            setCurrentPage(1); // 重置页数
          }}
          onClear={() => {
            setSearchedText("");
            setCurrentPage(1); // 重置页数
          }}
          showCancelButton={() => true}
          placeholder="请输入高校名称"
        />
      </div>
      <Grid columns={3} style={{ backgroundColor: "var(--adm-color-background)" }}>
        <Grid.Item>
          <Dropdown.Item
            key="provinces"
            title={provincePickerValue[0]}
            arrowIcon={<DownFill />}
            onClick={() => {
              setShowProvincePicker(true);
            }}
          />
        </Grid.Item>
        <Grid.Item>
          <Dropdown.Item
            key="univCategories"
            title={univCategoryPickerValue[0]}
            arrowIcon={<DownFill />}
            onClick={() => {
              setShowUnivCategoryPicker(true);
            }}
          />
        </Grid.Item>
        <Grid.Item>
          <Dropdown.Item
            key="univLevels"
            title={
              univLevelPickerValue[0] === 0
                ? "全部特性"
                : categoryData?.univLevels?.find((level) => level.code === univLevelPickerValue[0])?.name || "全部特性"
            }
            arrowIcon={<DownFill />}
            onClick={() => {
              setShowUnivLevelPicker(true);
            }}
          />
        </Grid.Item>
      </Grid>

      <List mode="card" header={`共查询到 ${filteredUnivList.length ?? 0} 所高校`}>
        {filteredUnivList.length ? (
          <>
            {displayedUnivList.map((univ) => {
              return (
                <FavoriteSwipeAction key={univ.up} univUp={univ.up} hmt={false}>
                  <UnivListItem univ={univ} />
                </FavoriteSwipeAction>
              );
            })}
          </>
        ) : (
          <ErrorBlock status="empty" title="暂未搜索到高校" style={{ margin: 12 }} />
        )}
      </List>

      <InfiniteScroll
        loadMore={() => {
          return sleep(800).then(() => {
            console.log("加载更多完成");
            setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
          });
        }}
        hasMore={currentPage < totalPages}
      />

      {/* Pickers */}
      <Picker
        value={provincePickerValue}
        columns={[
          // 这里直接用中文, 因为 univList 里面存取的就是中文, 用中文去匹配
          categoryData?.provinces?.map((province) => ({
            label: province.name == "全部" ? "全部省份" : province.name,
            value: province.name == "全部" ? "全部省份" : province.name,
          })) || [],
        ]}
        title="选择省份"
        visible={showProvincePicker}
        onClose={() => {
          setShowProvincePicker(false);
        }}
        onConfirm={(value) => {
          if (value[0] !== provincePickerValue[0]) {
            setCurrentPage(1);
            setProvincePickerValue(value as [string]);
          }
        }}
      />

      <Picker
        value={univCategoryPickerValue}
        columns={[
          // 这里直接用中文, 因为 univList 里面存取的就是中文, 用中文去匹配
          categoryData?.univCategories?.map((category) => ({
            label: category.name == "全部" ? "全部类型" : category.name,
            value: category.name == "全部" ? "全部类型" : category.name,
          })) || [],
        ]}
        title="选择高校类型"
        visible={showUnivCategoryPicker}
        onClose={() => {
          setShowUnivCategoryPicker(false);
        }}
        onConfirm={(value) => {
          if (value[0] !== univCategoryPickerValue[0]) {
            setCurrentPage(1);
            setUnivCategoryPickerValue(value as [string]);
          }
        }}
      />

      <Picker
        value={univLevelPickerValue}
        columns={[
          // 这里直接用中文, 因为 univList 里面存取的就是中文, 用中文去匹配
          categoryData?.univLevels?.map((level) => ({
            label: level.name == "全部" ? "全部特性" : level.name,
            value: level.code,
          })) || [],
        ]}
        title="选择高校特性"
        visible={showUnivLevelPicker}
        onClose={() => {
          setShowUnivLevelPicker(false);
        }}
        onConfirm={(value) => {
          if (value[0] !== univLevelPickerValue[0]) {
            setCurrentPage(1);
            setUnivLevelPickerValue(value as [number]);
          }
        }}
      />
    </>
  );
}
