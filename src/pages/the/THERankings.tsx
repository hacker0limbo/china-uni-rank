import { Dropdown, ErrorBlock, Grid, InfiniteScroll, List, Picker, Space, Toast } from "antd-mobile";
import { AppOutline, DownFill, EnvironmentOutline, FireFill } from "antd-mobile-icons";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { getTHEWorldRankings, type THEWorldRanking } from "../../api";
import { theCountries, PAGE_SIZE, theYearToHash, theLatestYear } from "../../constant";
import { Header, SkeletonWrapper } from "../../components";
import { sleep } from "../../utils";
import queryString from "query-string";

// 展示所有泰晤士排名的学校
export function THERankings() {
  const navigate = useLocation()[1];
  const [theRankings, setTHERankings] = useState<THEWorldRanking[]>([]);
  const [loadingTheRankings, setLoadingTHERankings] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = useMemo(() => Math.ceil(theRankings.length / PAGE_SIZE), [theRankings.length]);
  const [showYearPicker, setShowYearPicker] = useState(false);
  // 存的是年份, e.g. 2025
  const [yearPickerValue, setYearPickerValue] = useState<[keyof typeof theYearToHash]>([theLatestYear]);
  const [showCountriesPicker, setShowCountriesPicker] = useState(false);
  const [countriesPickerValue, setCountriesPickerValue] = useState<[string]>([theCountries[0]]);
  const filteredTHERankings = useMemo(
    () =>
      theRankings.filter((r) =>
        countriesPickerValue[0] === theCountries[0] ? true : r.location === countriesPickerValue[0]
      ),
    [theRankings, countriesPickerValue]
  );
  const displayedTHERankings = useMemo(
    () => filteredTHERankings.slice(0, currentPage * PAGE_SIZE),
    [filteredTHERankings, currentPage]
  );

  useEffect(() => {
    setLoadingTHERankings(true);
    getTHEWorldRankings(yearPickerValue[0])
      .then((res) => {
        // 只保留中国内地和港澳台的高校
        const data = res.data.data?.filter((r) => theCountries.includes(r.location)) || [];
        setTHERankings(data);
      })
      .catch((err) => {
        Toast.show({
          icon: "fail",
          content: "获取泰晤士排名数据失败了...",
        });
      })
      .finally(() => {
        setLoadingTHERankings(false);
      });
  }, [yearPickerValue]);

  return (
    <>
      <Header title="泰晤士高等教育世界排名" />

      <Grid columns={2} style={{ backgroundColor: "var(--adm-color-background)" }}>
        <Grid.Item>
          <Dropdown.Item
            key="year"
            title={yearPickerValue[0]}
            arrowIcon={<DownFill />}
            onClick={() => {
              setShowYearPicker(true);
            }}
          />
        </Grid.Item>
        <Grid.Item>
          <Dropdown.Item
            key="countries"
            title={countriesPickerValue[0]}
            arrowIcon={<DownFill />}
            onClick={() => {
              setShowCountriesPicker(true);
            }}
          />
        </Grid.Item>
      </Grid>

      <SkeletonWrapper
        loading={loadingTheRankings}
        lineCount={15}
        style={{ margin: 15, backgroundColor: "var(--adm-color-background)", padding: 12 }}
      >
        <List mode="card" header={`共查询到 ${filteredTHERankings.length ?? 0} 所高校`}>
          {filteredTHERankings?.length ? (
            <>
              {displayedTHERankings.map((theUniv) => (
                <List.Item
                  key={theUniv.nid}
                  extra={
                    <Space style={{ "--gap-horizontal": "4px" }}>
                      <EnvironmentOutline />
                      {theUniv.location}
                    </Space>
                  }
                  description={theUniv.name}
                  onClick={() => {
                    const params = {
                      year: yearPickerValue[0],
                      nid: theUniv.nid,
                    };
                    window.location.hash = `/the/rank?${queryString.stringify(params)}`;
                  }}
                >
                  <Space style={{ "--gap-horizontal": "4px", color: "#b70d7f" }}>
                    <FireFill />
                    {theUniv.rank !== "Reporter" ? theUniv.rank : "暂无排名"}
                  </Space>
                </List.Item>
              ))}
            </>
          ) : (
            <ErrorBlock status="empty" title="暂未搜索到排名" style={{ margin: 12 }} />
          )}
        </List>
      </SkeletonWrapper>

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
        value={yearPickerValue}
        columns={[
          Object.keys(theYearToHash).map((year) => ({
            label: year,
            value: year,
          })),
        ]}
        title="选择年份"
        visible={showYearPicker}
        onClose={() => {
          setShowYearPicker(false);
        }}
        onConfirm={(value) => {
          if (value[0] !== yearPickerValue[0]) {
            setCurrentPage(1);
            setYearPickerValue(value as [keyof typeof theYearToHash]);
          }
        }}
      />

      <Picker
        value={countriesPickerValue}
        columns={[
          theCountries.map((country) => ({
            label: country,
            value: country,
          })),
        ]}
        title="选择国家"
        visible={showCountriesPicker}
        onClose={() => {
          setShowCountriesPicker(false);
        }}
        onConfirm={(value) => {
          if (value[0] !== countriesPickerValue[0]) {
            setCurrentPage(1);
            setCountriesPickerValue(value as [string]);
          }
        }}
      />
    </>
  );
}
