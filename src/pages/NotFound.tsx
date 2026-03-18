import { Button, ErrorBlock } from "antd-mobile";
import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <ErrorBlock fullPage status="default" title="走丢了..." description="您访问的页面不存在">
      <Button color="primary" onClick={() => navigate("/")}>
        回到首页
      </Button>
    </ErrorBlock>
  );
}
