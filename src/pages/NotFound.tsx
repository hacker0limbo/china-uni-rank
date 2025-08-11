import { Button, ErrorBlock } from "antd-mobile";
import { useLocation } from "wouter";

export function NotFound() {
  const navigate = useLocation()[1];

  return (
    <ErrorBlock fullPage status="default" title="走丢了..." description="您访问的页面不存在">
      <Button color="primary" onClick={() => navigate("/")}>
        回到首页
      </Button>
    </ErrorBlock>
  );
}
