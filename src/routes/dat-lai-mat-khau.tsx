import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/dat-lai-mat-khau")({
  head: () => ({
    meta: [
      { title: "Đặt lại mật khẩu | THPT Phạm Văn Đồng" },
      { name: "description", content: "Tạo mật khẩu mới cho tài khoản trợ lý tâm lý học đường." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Đặt lại mật khẩu" },
      { property: "og:description", content: "Tạo mật khẩu mới cho tài khoản của bạn." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    void supabase.auth.getSession().then(({ data: d }) => { if (d.session) setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) { toast.error("Mật khẩu cần ít nhất 6 ký tự."); return; }
    if (pw !== pw2) { toast.error("Mật khẩu nhập lại chưa khớp."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error("Chưa đặt lại được mật khẩu. Liên kết có thể đã hết hạn."); return; }
    toast.success("Đã đặt mật khẩu mới.");
    void navigate({ to: "/tai-khoan", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Đặt lại mật khẩu</CardTitle>
          <CardDescription>Nhập mật khẩu mới cho tài khoản của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <p className="text-sm text-muted-foreground">
              Hãy mở trang này từ liên kết trong email đặt lại mật khẩu. <Link to="/dang-nhap" className="text-primary underline">Quay lại đăng nhập</Link>
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="np">Mật khẩu mới</Label><Input id="np" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="np2">Nhập lại mật khẩu mới</Label><Input id="np2" type="password" required value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Đang lưu..." : "Lưu mật khẩu mới"}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
