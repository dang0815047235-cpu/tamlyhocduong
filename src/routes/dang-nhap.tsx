import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HeartHandshake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const Route = createFileRoute("/dang-nhap")({
  head: () => ({
    meta: [
      { title: "Đăng nhập | Trợ lý tâm lý học đường THPT Phạm Văn Đồng" },
      {
        name: "description",
        content: "Đăng nhập hoặc tạo tài khoản học sinh, giáo viên để sử dụng trợ lý tư vấn tâm lý học đường.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Đăng nhập | Trợ lý tâm lý học đường" },
      { property: "og:description", content: "Tài khoản dành cho học sinh và giáo viên Trường THPT Phạm Văn Đồng." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, role, isAdmin, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState<"student" | "teacher">("student");
  const [sentEmail, setSentEmail] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: isAdmin ? "/quan-tri" : role === "teacher" ? "/giao-vien" : "/tro-chuyen", replace: true });
    }
  }, [user, role, isAdmin, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.includes("@") ? loginEmail.trim() : `${loginEmail.trim().toLowerCase()}@pvd.local`,
      password: loginPassword,
    });
    setBusy(false);
    if (error) {
      toast.error(
        error.message.includes("Invalid login")
          ? "Email hoặc mật khẩu chưa đúng."
          : error.message.includes("confirm")
            ? "Bạn cần mở email và bấm vào liên kết xác nhận trước khi đăng nhập."
            : error.message,
      );
      return;
    }
    toast.success("Đăng nhập thành công!");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 6) {
      toast.error("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail.trim(),
      password: signupPassword,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: name.trim(), class_name: className.trim(), role: signupRole },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(
        error.message.includes("already registered")
          ? "Email này đã có tài khoản. Bạn hãy đăng nhập nhé."
          : error.message,
      );
      return;
    }
    if (!data.session) {
      setSentEmail(true);
      toast.success("Đã gửi email xác nhận. Bạn hãy mở hộp thư và bấm vào liên kết.");
    } else {
      toast.success("Tạo tài khoản thành công!");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <Link to="/" className="mb-6 flex items-center gap-2">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <HeartHandshake className="size-5" />
        </span>
        <span>
          <span className="block font-bold">Trợ lý tâm lý học đường</span>
          <span className="block text-xs text-muted-foreground">Trường THPT Phạm Văn Đồng</span>
        </span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tài khoản của bạn</CardTitle>
          <CardDescription>
            Đăng nhập để trò chuyện, đặt lịch tư vấn và theo dõi báo cáo đã gửi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sentEmail ? (
            <div className="space-y-3 text-sm">
              <p className="font-medium">Hãy kiểm tra hộp thư của bạn.</p>
              <p className="text-muted-foreground">
                Chúng tôi đã gửi một liên kết xác nhận tới <strong>{signupEmail}</strong>. Sau khi bấm vào liên
                kết đó, bạn quay lại đây và đăng nhập.
              </p>
              <Button variant="outline" onClick={() => setSentEmail(false)}>
                Quay lại
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                <TabsTrigger value="signup">Tạo tài khoản</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form className="space-y-4 pt-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email hoặc tên đăng nhập</Label>
                    <Input
                      id="login-email"
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="email@vidu.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mật khẩu</Label>
                    <Input
                      id="login-password"
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Đang xử lý..." : "Đăng nhập"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form className="space-y-4 pt-4" onSubmit={handleSignup}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bạn là</Label>
                    <RadioGroup
                      value={signupRole}
                      onValueChange={(v) => setSignupRole(v as "student" | "teacher")}
                      className="flex gap-4"
                    >
                      <label className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="student" /> Học sinh
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="teacher" /> Giáo viên
                      </label>
                    </RadioGroup>
                  </div>
                  {signupRole === "teacher" && (
                    <p className="rounded-xl bg-secondary p-3 text-xs text-secondary-foreground">
                      Tài khoản giáo viên cần được quản trị viên phê duyệt trước khi dùng các tính năng giáo viên.
                    </p>
                  )}
                  {signupRole === "student" && (
                    <div className="space-y-2">
                      <Label htmlFor="class">Lớp</Label>
                      <Input
                        id="class"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="Ví dụ: 10A2"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mật khẩu</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Đang xử lý..." : "Tạo tài khoản"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Link to="/" className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:underline">
        Quay về trang chủ
      </Link>
    </div>
  );
}
