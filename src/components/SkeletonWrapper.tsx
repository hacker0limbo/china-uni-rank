import { Skeleton } from "antd-mobile";

export type SkeletonWrapperProps = {
  loading?: boolean;
  children?: React.ReactNode;
  showTitle?: boolean;
  lineCount?: number;
  animated?: boolean;
} & React.ComponentPropsWithoutRef<"div">;

// 基于 antd mobile 的 Skeleton 组件简单封装一下, 支持嵌套在别的组件之上使用,
// e.g. <SkeletonWrapper loading={true}>children</SkeletonWrapper>
export function SkeletonWrapper({
  loading,
  animated = true,
  children,
  showTitle = false,
  lineCount = 5,
  ...restProps
}: SkeletonWrapperProps) {
  if (loading) {
    return (
      <div {...restProps}>
        {showTitle && <Skeleton.Title animated={animated} />}
        <Skeleton.Paragraph lineCount={lineCount} animated={animated} />
      </div>
    );
  }
  // 直接渲染子元素, 不需要包裹在 div 中
  return children;
}
