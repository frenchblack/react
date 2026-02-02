import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { authGet } from "util";

export default function AdminRoute() {
  const navigator = useNavigate();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // 서버에서 내 ROLE을 확인하는 API (아래 3번에서 만들 거)
        const res = await authGet("/auth/me", null, navigator);
        if (res.data?.role_cd === "ROLE_ADMIN") {
          setOk(true);
        } else {
          navigator("/", { replace: true });
        }
      } catch (e) {
        navigator("/login", { replace: true });
      }
    })();
  }, []);

  if (!ok) return null;
  return <Outlet />;
}