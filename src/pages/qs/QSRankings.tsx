import { useCallback, useEffect, useMemo, useState } from "react";
import { getQSWorldRankings, type QSWorldRanking } from "../../api";
import { Card, Space, Toast, Grid, Dropdown, List, Image, ErrorBlock, InfiniteScroll, Picker } from "antd-mobile";
import { AppOutline, DownFill, EnvironmentOutline, FireFill } from "antd-mobile-icons";
import { useLocation } from "wouter";
import { Header, SkeletonWrapper } from "../../components";
import { uniqBy } from "lodash-es";
import { useUniversityStore } from "../../store";
import queryString from "query-string";
import { qsNidToYear, qsCountryLabels, qsLatestYearNid } from "../../constant";
import { getCnNameFromTranslation } from "../../utils";

// 展示所有 qs 排名的学校
export function QSRankings() {
  const navigate = useLocation()[1];
  const [loadingQSRankings, setLoadingQSRankings] = useState(false);
  const [qsRankings, setQSRankings] = useState<QSWorldRanking[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const univList = useUniversityStore((state) => state.univList);
  // picker 相关
  const [showYearPicker, setShowYearPicker] = useState(false);
  // 默认为最新年份, 存的是 nid, e.g. 4061771
  const [yearPickerValue, setYearPickerValue] = useState<[keyof typeof qsNidToYear]>([qsLatestYearNid]);
  const [showCountriesPicker, setShowCountriesPicker] = useState(false);
  const [countriesPickerValue, setCountriesPickerValue] = useState<[string]>(["All"]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  // 筛选的国家
  const countryToFilter = useMemo(() => {
    return qsCountryLabels.find((c) => c.value === countriesPickerValue[0])?.queryValue ?? ["cn", "hk", "tw", "mo"];
  }, [countriesPickerValue]);

  // 这里把 page 通过参数传进来调用, 而不是走状态, 是因为需要走 loadMore 拿到最新的 page
  const loadQSWorldRankings = useCallback(
    (page: number) => {
      setLoadingQSRankings(true);
      return getQSWorldRankings({
        page,
        countries: countryToFilter,
        nid: yearPickerValue[0],
      })
        .then((res) => {
          setQSRankings((prevRankings) => uniqBy([...prevRankings, ...(res.data?.score_nodes ?? [])], "core_id"));
          setCurrentPage(res.data?.current_page ?? 0);
          setTotalPages(res.data?.total_pages ?? 0);
          setTotalRecords(res.data?.total_record ?? 0);
        })
        .catch((err) => {
          Toast.show({
            icon: "fail",
            content: "获取 QS 排名数据失败了...",
          });
        })
        .finally(() => {
          setLoadingQSRankings(false);
        });
    },
    [countryToFilter, yearPickerValue]
  );

  const resetFilter = () => {
    setCurrentPage(0);
    setQSRankings([]);
    setTotalPages(0);
    setTotalRecords(0);
  };

  useEffect(() => {
    loadQSWorldRankings(0);
  }, [loadQSWorldRankings]);

  return (
    <>
      <Header title="QS 世界排名" />
      <Grid columns={2} style={{ backgroundColor: "var(--adm-color-background)" }}>
        <Grid.Item>
          <Dropdown.Item
            key="year"
            title={qsNidToYear[yearPickerValue[0]]}
            arrowIcon={<DownFill />}
            onClick={() => {
              setShowYearPicker(true);
            }}
          />
        </Grid.Item>
        <Grid.Item>
          <Dropdown.Item
            key="countries"
            title={qsCountryLabels.find((c) => c.value === countriesPickerValue[0])?.label}
            arrowIcon={<DownFill />}
            onClick={() => {
              setShowCountriesPicker(true);
            }}
          />
        </Grid.Item>
      </Grid>

      <SkeletonWrapper
        // 重新加载数据或者第一次加载的时候才展示 loading, 已经有数据的情况下走 infinite scroll
        loading={loadingQSRankings && totalRecords === 0}
        lineCount={15}
        style={{ margin: 12, backgroundColor: "var(--adm-color-background)", padding: 12 }}
      >
        <List mode="card" header={`共查询到 ${totalRecords ?? 0} 所高校`}>
          {qsRankings?.length ? (
            qsRankings.map((qsUniv) => (
              <List.Item
                key={qsUniv.core_id}
                prefix={
                  <Image lazy referrerPolicy="no-referrer" src={qsUniv.logo} fit="cover" width={40} height={40} />
                }
                extra={
                  <Space style={{ "--gap-horizontal": "4px" }}>
                    <EnvironmentOutline />
                    {qsUniv.city || qsUniv.country}
                  </Space>
                }
                description={
                  univList?.find((u) => u.nameEn?.toLowerCase() === qsUniv.title?.toLowerCase())?.nameCn ??
                  getCnNameFromTranslation(qsUniv.title)
                }
                onClick={() => {
                  const params = queryString.stringify({
                    coreId: qsUniv.core_id,
                    title: qsUniv.title,
                    yearNid: yearPickerValue[0],
                  });
                  // 这里不使用 navigate 是因为 wouter 的 useLocation 在 hash 模式下会有问题
                  window.location.hash = `/qs/rank?${params}`;
                }}
              >
                <Space style={{ "--gap-horizontal": "4px", color: "var(--adm-color-yellow)" }}>
                  <FireFill />
                  {qsUniv.rank_display}
                </Space>
              </List.Item>
            ))
          ) : (
            <ErrorBlock status="empty" title="暂未搜索到排名" style={{ margin: 12 }} />
          )}
        </List>
      </SkeletonWrapper>

      {totalRecords ? (
        <InfiniteScroll
          loadMore={() => {
            console.log("qs rankings load more");
            const nextPage = currentPage < totalPages - 1 ? currentPage + 1 : currentPage;
            return loadQSWorldRankings(nextPage);
          }}
          // 因为 currentPage 从 0 开始, 所以 totalPages - 1
          hasMore={currentPage < totalPages - 1}
        />
      ) : null}

      {/* Pickers */}
      <Picker
        value={yearPickerValue}
        columns={[
          Object.entries(qsNidToYear).map(([nid, year]) => ({
            label: year,
            value: nid,
          })),
        ]}
        title="选择年份"
        visible={showYearPicker}
        onClose={() => {
          setShowYearPicker(false);
        }}
        onConfirm={(value) => {
          if (value[0] !== yearPickerValue[0]) {
            // 重置状态
            resetFilter();
            setYearPickerValue(value as [keyof typeof qsNidToYear]);
          }
        }}
      />

      <Picker
        value={countriesPickerValue}
        columns={[
          qsCountryLabels.map((countryLabel) => ({
            label: countryLabel.label,
            value: countryLabel.value,
          })),
        ]}
        title="选择国家"
        visible={showCountriesPicker}
        onClose={() => {
          setShowCountriesPicker(false);
        }}
        onConfirm={(value) => {
          if (value[0] !== countriesPickerValue[0]) {
            // 重置状态
            resetFilter();
            setCountriesPickerValue(value as [string]);
          }
        }}
      />
    </>
  );
}
