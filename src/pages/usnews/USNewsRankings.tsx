import { Dropdown, ErrorBlock, InfiniteScroll, List, NoticeBar, Picker, Space, Toast } from "antd-mobile";
import { AppOutline, DownFill, EnvironmentOutline, FireFill } from "antd-mobile-icons";
import { useLocation } from "wouter";
import { getUSNewsWorldRankings, type USNewsWorldRanking } from "../../api";
import { useEffect, useMemo, useState } from "react";
import { PAGE_SIZE, usnewsCountries } from "../../constant";
import { formatUSNewsRank, getCnNameFromTranslation, sleep } from "../../utils";
import { useUniversityStore } from "../../store";
import { Header, SkeletonWrapper } from "../../components";

export function USNewsRankings() {
  const navigate = useLocation()[1];
  const [loading, setLoading] = useState(false);
  const [usnewsWorldRankings, setUSNewsWorldRankings] = useState<USNewsWorldRanking[]>([]);
  const [showCountriesPicker, setShowCountriesPicker] = useState(false);
  const [countriesPickerValue, setCountriesPickerValue] = useState<[keyof typeof usnewsCountries]>(["All"]);
  const filteredRankings = useMemo(() => {
    return usnewsWorldRankings.filter((r) =>
      countriesPickerValue[0] === "All" ? true : r.country_name === countriesPickerValue[0],
    );
  }, [countriesPickerValue, usnewsWorldRankings]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = useMemo(() => Math.ceil(filteredRankings.length / PAGE_SIZE), [filteredRankings.length]);
  const displayedRankings = useMemo(
    () => filteredRankings.slice(0, currentPage * PAGE_SIZE),
    [filteredRankings, currentPage],
  );
  const univList = useUniversityStore((state) => state.univList);

  useEffect(() => {
    setLoading(true);
    getUSNewsWorldRankings()
      .then((res) => {
        setUSNewsWorldRankings(res.data);
      })
      .catch((err) => {
        Toast.show({
          icon: "fail",
          content: "获取 USNEWS 排名数据失败了...",
        });
      })

      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header title="U.S.News 世界排名" />
      <NoticeBar color="info" content="注意: U.S.News 数据均通过爬虫获取, 可能存在一定延迟性, 请以官网数据为准" />
      <div style={{ backgroundColor: "var(--adm-color-background)" }}>
        <Dropdown.Item
          key="countries"
          title={usnewsCountries[countriesPickerValue[0]]}
          arrowIcon={<DownFill />}
          onClick={() => {
            setShowCountriesPicker(true);
          }}
        />
      </div>

      <SkeletonWrapper
        lineCount={15}
        loading={loading}
        style={{ margin: 12, backgroundColor: "var(--adm-color-background)", padding: 12 }}
      >
        <List mode="card" header={`共查询到 ${filteredRankings.length} 所高校`}>
          {filteredRankings.length ? (
            <>
              {displayedRankings.map((univ) => (
                <List.Item
                  key={univ.id}
                  extra={
                    <Space style={{ "--gap-horizontal": "4px" }}>
                      <EnvironmentOutline />
                      {usnewsCountries[univ.country_name]}
                    </Space>
                  }
                  description={
                    univList?.find((u) => u.nameEn?.toLowerCase() === univ?.name?.toLowerCase())?.nameCn ??
                    getCnNameFromTranslation(univ.name)
                  }
                  onClick={() => {
                    navigate(`/usnews/${univ.id}`);
                  }}
                >
                  <Space style={{ "--gap-horizontal": "4px", color: "var(--adm-color-primary)" }}>
                    <FireFill />
                    {formatUSNewsRank(univ.ranks)}
                  </Space>
                </List.Item>
              ))}
            </>
          ) : (
            <ErrorBlock status="empty" title="暂未搜索到高校" style={{ margin: 12 }} />
          )}
        </List>
      </SkeletonWrapper>

      <InfiniteScroll
        hasMore={currentPage < totalPages}
        loadMore={() => {
          return sleep(800).then(() => {
            setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
          });
        }}
      />

      {/* Pickers */}
      <Picker
        value={countriesPickerValue}
        columns={[Object.entries(usnewsCountries).map(([value, label]) => ({ label, value }))]}
        title="选择国家"
        visible={showCountriesPicker}
        onClose={() => {
          setShowCountriesPicker(false);
        }}
        onConfirm={(value) => {
          if (value[0] !== countriesPickerValue[0]) {
            setCurrentPage(1); // 重置页数
            setCountriesPickerValue(value as [keyof typeof usnewsCountries]);
          }
        }}
      />
    </>
  );
}
