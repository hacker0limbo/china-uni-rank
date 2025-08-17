import { useMemo, useState } from "react";
import { FavoriteSwipeAction, Header, HMTUnivListItem } from "../../components";
import { useHMTUniversityStore } from "../../store";
import { arwuHMTCountryLabels, PAGE_SIZE } from "../../constant";
import { Dropdown, ErrorBlock, Grid, InfiniteScroll, List, Picker } from "antd-mobile";
import { DownFill } from "antd-mobile-icons";
import { sleep } from "../../utils";

// 港澳台高校
export function HMTUniversities() {
  const hmtUnivList = useHMTUniversityStore((state) => state.hmtUnivList);
  const [showCountriesPicker, setShowCountriesPicker] = useState(false);
  const [countriesPickerValue, setCountriesPickerValue] = useState<[string]>([arwuHMTCountryLabels[0].value]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const filteredUnivList = useMemo(() => {
    return hmtUnivList.filter((univ) =>
      countriesPickerValue[0] === "all" ? true : univ.region === countriesPickerValue[0]
    );
  }, [hmtUnivList, countriesPickerValue]);
  const totalPages = useMemo(() => Math.ceil(filteredUnivList.length / PAGE_SIZE), [filteredUnivList.length]);
  const displayedUnivList = useMemo(
    () => filteredUnivList.slice(0, currentPage * PAGE_SIZE),
    [filteredUnivList, currentPage]
  );

  return (
    <>
      <Header title="港澳台高校" />
      <Grid columns={1} style={{ backgroundColor: "var(--adm-color-background)" }}>
        <Grid.Item>
          <Dropdown.Item
            key="provinces"
            title={arwuHMTCountryLabels.find((item) => item.value === countriesPickerValue[0])?.label}
            arrowIcon={<DownFill />}
            onClick={() => {
              setShowCountriesPicker(true);
            }}
          />
        </Grid.Item>
      </Grid>

      <List mode="card" header={`共查询到 ${filteredUnivList.length ?? 0} 所高校`}>
        {filteredUnivList.length ? (
          <>
            {displayedUnivList.map((univ) => (
              <FavoriteSwipeAction key={univ.univUp} univUp={univ.univUp}>
                <HMTUnivListItem univ={univ} />
              </FavoriteSwipeAction>
            ))}
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
        value={countriesPickerValue}
        columns={[
          arwuHMTCountryLabels.map((country) => ({
            label: country.label,
            value: country.value,
          })),
        ]}
        title="选择地区"
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
