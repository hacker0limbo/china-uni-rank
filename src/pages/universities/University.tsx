import {
  Card,
  Image,
  Rate,
  Toast,
  Space,
  Tag,
  Divider,
  Grid,
  Swiper,
  Tabs,
  Steps,
  AutoCenter,
  Skeleton,
} from "antd-mobile";
import {
  GlobalOutline,
  HeartOutline,
  LinkOutline,
  MailOutline,
  PhonebookOutline,
  RightOutline,
  StarOutline,
} from "antd-mobile-icons";
import { useLocation, useParams } from "wouter";
import { useFavoriteUnivStore, useSettingsStore, useUniversityStore } from "../../store";
import {
  ARWU_BASE_URL,
  getQSUnivRankTrend,
  getTHEUnivRankTrend,
  getTHEWorldRankings,
  type QSUnivRankByYear,
  type QSWorldRanking,
  type THEUnivRankTrendItem,
  type THEWorldRanking,
  type USNewsWorldRanking,
} from "../../api";
import { useEffect, useMemo, useState } from "react";
import { getUnivDetailsFromARWU, type UniversityARWUDetail, getQSWorldRankings } from "../../api";
import { Header, QSRankStepsWithLogo, RankLogo, Score, SkeletonWrapper } from "../../components";
import { qsNidToYear, qsLatestYearNid, theLatestYear, arwuYears } from "../../constant";
import queryString from "query-string";
import usnews from "../../store/usnews.json";
import { formatUSNewsRank, getTableOption } from "../../utils";
import { ListTable } from "@visactor/react-vtable";
import { type ColumnDefine } from "@visactor/vtable";
import { useTableTheme } from "../../hooks";

// 软科中国大学专业排名
const majorColumns: ColumnDefine[] = [
  {
    field: "code",
    title: "专业代码",
  },
  {
    field: "name",
    title: "专业名称",
  },
  {
    field: "grade",
    title: "专业评级",
  },
  {
    field: "ranking",
    title: "专业排名",
  },
];

// 软科中国最好学科排名
const subjectColumns: ColumnDefine[] = [
  {
    field: "code",
    title: "学科代码",
  },
  {
    field: "name",
    title: "学科名称",
  },
  {
    field: "rankTopLevel",
    title: "排名层次",
  },
  {
    field: "ranking",
    title: "学科排名",
  },
];

// 软科世界一流学科排名
const globalSubjectColumns: ColumnDefine[] = [
  {
    field: "code",
    title: "学科代码",
  },
  {
    field: "name",
    title: "学科名称",
  },
  {
    field: "ranking",
    title: "学科排名",
  },
];

export function University() {
  const navigate = useLocation()[1];
  const { up } = useParams<{ up: string }>();
  const initialized = useUniversityStore((state) => state.initialized);
  const categoryData = useUniversityStore((state) => state.categoryData);
  const [loadingDetailsARWU, setLoadingDetailsARWU] = useState(false);
  const [detailsARWU, setDetailsARWU] = useState<UniversityARWUDetail | null>(null);
  const [qsRankDetails, setQSRankDetails] = useState<QSWorldRanking>();
  const [loadingQSRankDetails, setLoadingQSRankDetails] = useState(false);
  const [theRankDetails, setTheRankDetails] = useState<THEWorldRanking>();
  const [loadingTheRankDetails, setLoadingTheRankDetails] = useState(false);
  const usnewsDetails = usnews.find((u) => u.name.toLowerCase() === detailsARWU?.nameEn?.toLowerCase()) as
    | USNewsWorldRanking
    | undefined;
  const tableTheme = useTableTheme();
  // 收藏
  const favoriteUps = useFavoriteUnivStore((state) => state.favoriteUps);
  const addFavorite = useFavoriteUnivStore((state) => state.addFavorite);
  const removeFavorite = useFavoriteUnivStore((state) => state.removeFavorite);
  const isFavorite = useMemo(() => favoriteUps?.map((u) => u.up)?.includes(up), [favoriteUps, up]);

  useEffect(() => {
    if (up && initialized) {
      setLoadingDetailsARWU(true);
      getUnivDetailsFromARWU(up)
        .then((res) => {
          const { univData } = res?.data?.[0] ?? {};
          setDetailsARWU(univData);
        })
        .catch((error) => {
          Toast.show({
            icon: "fail",
            content: "获取软科高校详情数据失败了...",
          });
        })
        .finally(() => {
          setLoadingDetailsARWU(false);
        });
    }
  }, [up, initialized]);

  useEffect(() => {
    // 只有在查找到对应英文名的情况下才去查 qs 的信息
    if (detailsARWU?.nameEn) {
      setLoadingQSRankDetails(true);
      getQSWorldRankings({
        nid: qsLatestYearNid,
        items_per_page: 1,
        search: detailsARWU.nameEn,
      })
        .then((res) => {
          if (res.data.score_nodes?.length) {
            // 搜索到学校, 直接拿第一所因为是最相关的
            setQSRankDetails(res.data.score_nodes[0]);
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          Toast.show({
            icon: "fail",
            content: "获取该学校 QS 排名详情失败了...",
          });
        })
        .finally(() => {
          setLoadingQSRankDetails(false);
        });
    }
  }, [detailsARWU?.nameEn]);

  useEffect(() => {
    setLoadingTheRankDetails(true);
    getTHEWorldRankings()
      .then((res) => {
        // 直接根据中文名字匹配泰晤士学校
        const details = res.data.data?.find((u) => u.name === detailsARWU?.nameCn);
        setTheRankDetails(details);
      })
      .catch(() => {
        Toast.show({
          icon: "fail",
          content: "获取该学校泰晤士排名详情失败了...",
        });
      })
      .finally(() => {
        setLoadingTheRankDetails(false);
      });
  }, [detailsARWU?.nameCn]);

  return (
    <div style={{ overflowY: "auto" }}>
      <Header title="高校详情" />

      <Card
        style={{ margin: 12 }}
        title="基本信息"
        icon={
          <LinkOutline
            style={{ color: "var(--adm-color-primary)" }}
            fontSize={24}
            onClick={() => {
              window.open(`${ARWU_BASE_URL}/institution/${detailsARWU?.up}`, "_blank");
            }}
          />
        }
        extra={
          <Rate
            value={isFavorite ? 1 : 0}
            count={1}
            onChange={(value) => {
              if (value) {
                addFavorite(up);
              } else {
                removeFavorite(up);
              }
              Toast.show({
                icon: <StarOutline />,
                content: value ? "收藏成功" : "取消收藏成功",
              });
            }}
          />
        }
      >
        <SkeletonWrapper loading={loadingDetailsARWU} showTitle>
          {detailsARWU?.univEnv?.pubPicture?.length ? (
            <Swiper autoplay loop style={{ marginBottom: 12, "--border-radius": "8px" }}>
              {detailsARWU.univEnv.pubPicture.map((pic) => (
                <Swiper.Item key={pic.id}>
                  <Image src={`${ARWU_BASE_URL}/api/static/uimg/${pic.imgUrl}`} fit="cover" width="100%" height={150} />
                </Swiper.Item>
              ))}
            </Swiper>
          ) : null}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Space direction="vertical" style={{ "--gap-vertical": "4px" }}>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>{detailsARWU?.nameCn}</div>
              <div style={{ fontSize: 14, color: "var(--adm-color-weak)" }}>{detailsARWU?.nameEn}</div>
              <Space style={{ fontSize: 14, color: "var(--adm-color-weak)", "--gap-horizontal": "4px" }}>
                {detailsARWU?.provinceShort}·{detailsARWU?.cityName}
              </Space>
              <Space>
                {detailsARWU?.charCode?.map((c) => (
                  <Tag color="primary" fill="outline" key={c}>
                    {categoryData?.univLevels?.find((level) => level.code === c)?.name}
                  </Tag>
                ))}
              </Space>
            </Space>
            <Image src={`${ARWU_BASE_URL}/_uni/${detailsARWU?.logo}`} fit="cover" width={64} height={64} />
          </div>
          <Divider />
          <Grid columns={3} style={{ placeItems: "center" }}>
            <Grid.Item
              onClick={() => {
                if (detailsARWU?.univEnv?.consultPhone) {
                  window.location.href = `tel:${detailsARWU.univEnv.consultPhone}`;
                } else {
                  Toast.show({
                    icon: "fail",
                    content: "暂无联系电话",
                  });
                }
              }}
            >
              <Space align="center" style={{ "--gap-horizontal": "4px", fontSize: 14 }}>
                <PhonebookOutline />
                电话
              </Space>
            </Grid.Item>
            <Grid.Item
              onClick={() => {
                if (detailsARWU?.url) {
                  window.open(detailsARWU.url, "_blank");
                } else {
                  Toast.show({
                    icon: "fail",
                    content: "暂无官网地址",
                  });
                }
              }}
            >
              <Space align="center" style={{ "--gap-horizontal": "4px", fontSize: 14 }}>
                <GlobalOutline />
                官网
              </Space>
            </Grid.Item>
            <Grid.Item
              onClick={() => {
                if (detailsARWU?.univEnv?.email) {
                  window.location.href = `mailto:${detailsARWU.univEnv.email}`;
                } else {
                  Toast.show({
                    icon: "fail",
                    content: "暂无联系邮箱",
                  });
                }
              }}
            >
              <Space align="center" style={{ "--gap-horizontal": "4px", fontSize: 14 }}>
                <MailOutline />
                邮箱
              </Space>
            </Grid.Item>
          </Grid>
        </SkeletonWrapper>
      </Card>

      <Card style={{ margin: 12 }} title="四大最新排名">
        <Tabs>
          <Tabs.Tab title="软科" key="arwu">
            <SkeletonWrapper loading={loadingDetailsARWU}>
              <AutoCenter>
                <div
                  style={{ fontSize: 20, fontWeight: "bold", margin: "12px 0" }}
                  onClick={() => {
                    const params = queryString.stringify({
                      up: detailsARWU?.up,
                      year: arwuYears[0],
                    });
                    window.location.hash = `/arwu/rank?${params}`;
                  }}
                >
                  {arwuYears[0]} 软科世界大学排名 <RightOutline fontSize={16} />
                </div>
              </AutoCenter>
              <RankLogo color="var(--adm-color-danger)" rankInfo={detailsARWU?.details?.arwu?.rkLatest?.ranking} />
            </SkeletonWrapper>
          </Tabs.Tab>

          <Tabs.Tab title="QS" key="qs">
            <SkeletonWrapper loading={loadingQSRankDetails}>
              <AutoCenter>
                <div
                  style={{ fontSize: 20, fontWeight: "bold", margin: "12px 0" }}
                  onClick={() => {
                    const params = queryString.stringify({
                      coreId: qsRankDetails?.core_id,
                      title: qsRankDetails?.title,
                      yearNid: qsLatestYearNid,
                    });
                    if (qsRankDetails?.rank_display) {
                      window.location.hash = `/qs/rank?${params}`;
                    }
                  }}
                >
                  {qsNidToYear[qsLatestYearNid]} QS世界大学排名 <RightOutline fontSize={16} />
                </div>
              </AutoCenter>
              <RankLogo color="var(--adm-color-yellow)" rankInfo={qsRankDetails?.rank} />
            </SkeletonWrapper>
          </Tabs.Tab>

          <Tabs.Tab title="泰晤士" key="the">
            <SkeletonWrapper loading={loadingTheRankDetails}>
              <AutoCenter>
                <div
                  style={{ fontSize: 20, fontWeight: "bold", margin: "12px 0" }}
                  onClick={() => {
                    const params = queryString.stringify({
                      year: theLatestYear,
                      nid: theRankDetails?.nid,
                    });
                    if (theRankDetails?.rank) {
                      window.location.hash = `/the/rank?${params}`;
                    }
                  }}
                >
                  {theLatestYear} 泰晤士世界大学排名 <RightOutline fontSize={16} />
                </div>
              </AutoCenter>
              <RankLogo color="#b70d7f" rankInfo={theRankDetails?.rank} />
            </SkeletonWrapper>
          </Tabs.Tab>

          <Tabs.Tab title="USNews" key="usnews">
            <AutoCenter>
              <div
                style={{ fontSize: 20, fontWeight: "bold", margin: "12px 0" }}
                onClick={() => {
                  if (usnewsDetails?.ranks?.length) {
                    navigate(`/usnews/${usnewsDetails?.id}`);
                  }
                }}
              >
                USNews 世界大学排名 <RightOutline fontSize={16} />
              </div>
            </AutoCenter>
            <RankLogo color="var(--adm-color-primary)" rankInfo={formatUSNewsRank(usnewsDetails?.ranks)} />
          </Tabs.Tab>
        </Tabs>
      </Card>

      <Card
        style={{ margin: 12 }}
        title="软科中国大学专业排名"
        extra={`更新时间: ${detailsARWU?.details?.bcmr?.latestVerNo}`}
      >
        <Tabs>
          <Tabs.Tab title="专业总览" key="bcmrOverview">
            <Grid columns={3}>
              {detailsARWU?.details?.bcmr?.bcmrCount?.map((item) => (
                <Grid.Item key={item.title}>
                  <AutoCenter>
                    <Score title={item.title} score={item.value} color="var(--adm-color-danger)" />
                  </AutoCenter>
                </Grid.Item>
              ))}
            </Grid>
          </Tabs.Tab>
          <Tabs.Tab title="所有上榜专业" key="bcmrAll">
            <ListTable
              option={getTableOption({
                columns: majorColumns,
                records: detailsARWU?.details?.bcmr?.majorAll?.[0]?.children,
                theme: tableTheme,
              })}
              height="300px"
            />
          </Tabs.Tab>
          <Tabs.Tab title="优势专业" key="bcmrAdv">
            <ListTable
              theme={tableTheme}
              option={getTableOption({
                columns: majorColumns,
                records: detailsARWU?.details?.bcmr?.majorAdva,
                theme: tableTheme,
              })}
              height="300px"
            />
          </Tabs.Tab>
          <Tabs.Tab title="A+专业" key="bcmrAPlus">
            <ListTable
              option={getTableOption({
                columns: majorColumns,
                records: detailsARWU?.details?.bcmr?.majorAPlus?.children,
                theme: tableTheme,
              })}
              height="300px"
            />
          </Tabs.Tab>
        </Tabs>
      </Card>

      <Card
        style={{ margin: 12 }}
        title="软科中国最好学科排名"
        extra={`更新时间: ${detailsARWU?.details?.bcsr?.latestVerNo}`}
      >
        <Tabs>
          <Tabs.Tab title="学科总览" key="bcsrOverview">
            <Grid columns={3} style={{ "--gap-vertical": "12px" }}>
              {detailsARWU?.details?.bcsr?.bcsrCount?.map((item) => (
                <Grid.Item key={item.title}>
                  <AutoCenter>
                    <Score title={item.title.replace(/\n/g, "")} score={item.value} color="var(--adm-color-danger)" />
                  </AutoCenter>
                </Grid.Item>
              ))}
            </Grid>
          </Tabs.Tab>
          <Tabs.Tab title="所有学科" key="bcsrAll">
            <ListTable
              option={getTableOption({
                columns: subjectColumns,
                records: detailsARWU?.details?.bcsr?.subjCategory?.map((c) => c.subj)?.flat(),
                theme: tableTheme,
              })}
              height="300px"
            />
          </Tabs.Tab>
          <Tabs.Tab title="优势学科" key="bcsrAdv">
            <ListTable
              option={getTableOption({
                columns: subjectColumns,
                records: detailsARWU?.details?.bcsr?.subjAdva,
                theme: tableTheme,
              })}
              height="300px"
            />
          </Tabs.Tab>
        </Tabs>
      </Card>

      <Card
        style={{ margin: 12 }}
        title="软科世界一流学科排名"
        extra={`更新时间: ${detailsARWU?.details?.gras?.latestVerNo}`}
      >
        <Tabs>
          <Tabs.Tab title="学科总览" key="grasOverview">
            <Grid columns={3} style={{ "--gap-vertical": "12px" }}>
              {detailsARWU?.details?.gras?.grasCount?.map((item) => (
                <Grid.Item key={item.title}>
                  <AutoCenter>
                    <Score title={item.title.replace(/\n/g, "")} score={item.value} color="var(--adm-color-danger)" />
                  </AutoCenter>
                </Grid.Item>
              ))}
            </Grid>
          </Tabs.Tab>
          <Tabs.Tab title="所有学科" key="grasAll">
            <ListTable
              option={getTableOption({
                columns: globalSubjectColumns,
                records: detailsARWU?.details?.gras?.subjCategory?.map((c) => c.subj)?.flat(),
                theme: tableTheme,
              })}
              height="300px"
            />
          </Tabs.Tab>
          <Tabs.Tab title="优势学科" key="grasAdv">
            <ListTable
              option={getTableOption({
                columns: globalSubjectColumns,
                records: detailsARWU?.details?.gras?.subjAdva,
                theme: tableTheme,
              })}
              height="300px"
            />
          </Tabs.Tab>
        </Tabs>
      </Card>
    </div>
  );
}
