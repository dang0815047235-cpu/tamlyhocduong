import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { HeartHandshake, Menu, X, LogOut, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const studentLinks = [
  { to: "/", label: "Trang chủ" },
  { to: "/tro-chuyen", label: "Trò chuyện" },
  { to: "/kiem-tra-cam-xuc", label: "Kiểm tra cảm xúc" },
  { to: "/dat-lich", label: "Đặt lịch" },
  { to: "/bao-cao", label: "Báo cáo" },
  { to: "/thu-vien", label: "Thư viện" },
] as const;

export function AppHeader() {
  const { user, profile, role, isAdmin, pendingTeacher, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["appointments", "pending-for-me", user?.id],
    enabled: !!user && role === "teacher",
    refetchInterval: 30000,
    queryFn: async () => {
      const { count } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("counselor_id", user!.id)
        .eq("status", "pending");
      return count ?? 0;
    },
  });

  const links = [
    ...(isAdmin ? [{ to: "/quan-tri", label: "Quản trị" } as const] : []),
    ...(role === "teacher" ? [{ to: "/giao-vien", label: "Giáo viên" } as const] : []),
    ...studentLinks,
    ...(user ? [{ to: "/tai-khoan", label: pendingTeacher || role === "teacher" ? "Tài khoản giáo viên" : "Tài khoản học sinh" } as const] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    void navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <HeartHandshake className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold">Trợ lý tâm lý học đường</span>
            <span className="block text-xs text-muted-foreground">THPT Phạm Văn Đồng</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          {role === "teacher" && (
            <Button asChild variant="ghost" size="icon" className="relative" aria-label="Lịch hẹn chờ duyệt">
              <Link to="/giao-vien">
                <Bell className="size-5" />
                {pendingCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {pendingCount}
                  </span>
                )}
              </Link>
            </Button>
          )}
          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="max-w-[10rem] truncate text-sm text-muted-foreground">
                {profile?.display_name ?? user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="size-4" /> Thoát
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/dang-nhap">Đăng nhập</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Mở menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {pendingTeacher && (
        <div className="bg-secondary px-4 py-2 text-center text-xs text-secondary-foreground">
          Tài khoản giáo viên của bạn đang chờ quản trị viên phê duyệt.
        </div>
      )}

      {role === "teacher" && pendingCount > 0 && (
        <Link to="/giao-vien" className="block bg-primary/10 px-4 py-2 text-center text-xs font-medium text-foreground">
          Bạn có {pendingCount} lịch hẹn mới đang chờ duyệt — bấm để xem.
        </Link>
      )}

      {open && (
        <div className="border-t border-border bg-card px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <Button variant="outline" size="sm" className="mt-2" onClick={handleSignOut}>
                <LogOut className="size-4" /> Đăng xuất
              </Button>
            ) : (
              <Button asChild size="sm" className="mt-2">
                <Link to="/dang-nhap" onClick={() => setOpen(false)}>
                  Đăng nhập
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card/60">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Trường THPT Phạm Văn Đồng</p>
        <p className="mt-1">
          Sản phẩm học tập, sử dụng dữ liệu minh họa. Trang web chỉ hỗ trợ bước đầu, không chẩn đoán tâm lý và
          không thay thế giáo viên tư vấn hoặc chuyên gia.
        </p>
        <p className="mt-2">Khi khẩn cấp: gọi Tổng đài quốc gia bảo vệ trẻ em 111 (miễn phí, 24/7) hoặc 113.</p>
      </div>
    </footer>
  );
}
