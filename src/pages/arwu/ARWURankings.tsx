import { Header, SkeletonWrapper } from "../../components";
import { ARWU_BASE_URL, getARWUWoldRankings, type ARWUWoldRanking, type ARWUWoldRankingsResponse } from "../../api";
import { useEffect, useMemo, useState } from "react";
import { arwuYears, arwuCountries, PAGE_SIZE } from "../../constant";
import { Dropdown, ErrorBlock, Grid, List, Image, Space, InfiniteScroll, Picker, Toast } from "antd-mobile";
import { DownFill, EnvironmentOutline, FireFill } from "antd-mobile-icons";
import { useLocation } from "wouter";
import { sleep } from "../../utils";
import { useUniversityStore } from "../../store";
import queryString from "query-string";

export function ARWURankings() {
  const navigate = useLocation()[1];
  // 排名数据
  const [arwuRankings, setARWURankings] = useState<ARWUWoldRanking[]>([]);
  const initialized = useUniversityStore((state) => state.initialized);
  const [loading, setLoading] = useState<boolean>(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearPickerValue, setYearPickerValue] = useState<[string]>([arwuYears[0]]);
  const [showCountriesPicker, setShowCountriesPicker] = useState(false);
  const [countriesPickerValue, setCountriesPickerValue] = useState<[string]>([arwuCountries[0]]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const filteredRankings = useMemo(() => {
    return arwuRankings.filter((r) =>
      countriesPickerValue[0] === arwuCountries[0] ? true : r.region === countriesPickerValue[0]
    );
  }, [arwuRankings, countriesPickerValue]);
  const totalPages = useMemo(() => Math.ceil(filteredRankings.length / PAGE_SIZE), [filteredRankings.length]);
  const displayedRankings = useMemo(
    () => filteredRankings.slice(0, currentPage * PAGE_SIZE),
    [filteredRankings, currentPage]
  );

  useEffect(() => {
    if (initialized) {
      setLoading(true);
      getARWUWoldRankings(yearPickerValue[0])
        .then((res) => {
          const data = res.data?.[0];
          // 只存储中国内地和港澳台的高校
          setARWURankings(data?.univData?.filter((u) => arwuCountries.includes(u.region)) || []);
        })
        .catch((err) => {
          console.error("报错了", err);
          Toast.show({
            icon: "fail",
            content: "获取软科排名数据失败了...",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [yearPickerValue, initialized]);

  return (
    <>
      <Header title="软科世界排名" />
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
        loading={loading}
        lineCount={15}
        style={{ margin: 12, backgroundColor: "var(--adm-color-background)", padding: 12 }}
      >
        <List mode="card" header={`共查询到 ${filteredRankings.length} 所高校`}>
          {filteredRankings?.length ? (
            <>
              {displayedRankings.map((univ) => (
                <List.Item
                  key={univ.univUp + univ.univUpEn}
                  prefix={
                    <Image lazy src={`${ARWU_BASE_URL}/_uni/${univ.univLogo}`} fit="cover" width={40} height={40} />
                  }
                  description={univ.univNameCn}
                  extra={
                    <Space style={{ "--gap-horizontal": "4px" }}>
                      <EnvironmentOutline />
                      {univ.region}
                    </Space>
                  }
                  onClick={() => {
                    const params = queryString.stringify({
                      up: univ.univUp || univ.univUpEn,
                      year: yearPickerValue[0],
                    });
                    window.location.hash = `/arwu/rank?${params}`;
                  }}
                >
                  <Space style={{ "--gap-horizontal": "4px", color: "var(--adm-color-danger)" }}>
                    <FireFill />
                    {univ.ranking}
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
        value={yearPickerValue}
        columns={[arwuYears.map((y) => ({ label: y, value: y }))]}
        title="选择年份"
        visible={showYearPicker}
        onClose={() => {
          setShowYearPicker(false);
        }}
        onConfirm={(value) => {
          if (value[0] !== yearPickerValue[0]) {
            setCurrentPage(1); // 重置页数
            setYearPickerValue(value as [string]);
          }
        }}
      />

      <Picker
        value={countriesPickerValue}
        columns={[arwuCountries.map((c) => ({ label: c, value: c }))]}
        title="选择国家"
        visible={showCountriesPicker}
        onClose={() => {
          setShowCountriesPicker(false);
        }}
        onConfirm={(value) => {
          if (value[0] !== countriesPickerValue[0]) {
            setCurrentPage(1); // 重置页数
            setCountriesPickerValue(value as [string]);
          }
        }}
      />
    </>
  );
}
