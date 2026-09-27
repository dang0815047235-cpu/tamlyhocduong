import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MessageCircleHeart,
  ClipboardList,
  CalendarHeart,
  ShieldAlert,
  BookOpenText,
  Phone,
} from "lucide-react";
import { AppFooter, AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trợ lý ảo tư vấn tâm lý học đường | THPT Phạm Văn Đồng" },
      {
        name: "description",
        content:
          "Nơi học sinh THPT Phạm Văn Đồng trò chuyện, kiểm tra cảm xúc, đặt lịch tư vấn, gửi báo cáo sự việc và đọc bài viết về sức khỏe tinh thần.",
      },
      { property: "og:title", content: "Trợ lý ảo tư vấn tâm lý học đường | THPT Phạm Văn Đồng" },
      {
        property: "og:description",
        content: "Các hình thức hỗ trợ tâm lý học đường dành cho học sinh: trò chuyện, kiểm tra cảm xúc, đặt lịch, báo cáo, thư viện.",
      },
    ],
  }),
  component: Home,
});

const supports = [
  {
    icon: MessageCircleHeart,
    title: "Trò chuyện cùng trợ lý",
    desc: "Đặt câu hỏi về học tập, bạn bè hay an toàn và nhận gợi ý theo kịch bản đã được thầy cô duyệt trước.",
    to: "/tro-chuyen" as const,
  },
  {
    icon: ClipboardList,
    title: "Kiểm tra cảm xúc ngắn",
    desc: "20 câu hỏi giúp bạn tự nhìn lại cảm xúc gần đây và nhận lời khuyên phù hợp.",
    to: "/kiem-tra-cam-xuc" as const,
  },
  {
    icon: CalendarHeart,
    title: "Đặt lịch gặp thầy cô",
    desc: "Chọn ngày, khung giờ và chủ đề khái quát để gặp giáo viên tư vấn tâm lý của trường.",
    to: "/dat-lich" as const,
  },
  {
    icon: ShieldAlert,
    title: "Báo cáo sự việc",
    desc: "Gửi thông tin về một sự việc cần hỗ trợ. Bạn có thể chọn gửi ẩn danh.",
    to: "/bao-cao" as const,
  },
  {
    icon: BookOpenText,
    title: "Thư viện kiến thức",
    desc: "Bài viết ngắn về giảm căng thẳng, quản lý thời gian, kiểm soát cảm xúc và phòng chống bắt nạt.",
    to: "/thu-vien" as const,
  },
];

function Home() {
  const { user, role } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-[1.2fr_1fr] md:py-16">
          <div>
            <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              Trường THPT Phạm Văn Đồng
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Bạn không phải đi qua chuyện khó một mình
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Trợ lý ảo hỗ trợ tư vấn tâm lý học đường giúp bạn tìm hiểu kiến thức về sức khỏe tinh thần, trò
              chuyện theo kịch bản, tự kiểm tra cảm xúc và kết nối với thầy cô tư vấn của trường.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {user ? (
                <>
                  <Button asChild size="lg">
                    <Link to="/tro-chuyen">Bắt đầu trò chuyện</Link>
                  </Button>
                  {role === "teacher" && (
                    <Button asChild size="lg" variant="outline">
                      <Link to="/giao-vien">Bảng điều khiển giáo viên</Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link to="/dang-nhap">Đăng nhập để bắt đầu</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/thu-vien">Xem thư viện bài viết</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Phone className="size-5" /> Khi bạn cần giúp đỡ ngay
              </CardTitle>
              <CardDescription className="text-foreground/80">
                Nếu bạn đang thấy không an toàn, bị đe dọa hoặc có ý nghĩ làm hại bản thân, hãy tìm người lớn
                ngay lúc này.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Nói ngay với bố mẹ, thầy cô hoặc người lớn ở gần bạn nhất.</p>
              <p>• Tổng đài quốc gia bảo vệ trẻ em: <strong>111</strong> (miễn phí, 24/7).</p>
              <p>• Trường hợp nguy hiểm tức thời: gọi <strong>113</strong>.</p>
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12">
          <h2 className="text-xl font-bold sm:text-2xl">Các hình thức hỗ trợ tâm lý học đường</h2>
          <p className="mt-2 text-muted-foreground">Chọn hình thức phù hợp nhất với điều bạn đang gặp phải.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {supports.map((s) => (
              <Card key={s.title} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <s.icon className="size-5" />
                  </span>
                  <CardTitle className="mt-3 text-lg">{s.title}</CardTitle>
                  <CardDescription>{s.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="secondary" size="sm">
                    <Link to={s.to}>Mở trang</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-6">
          <Card className="bg-secondary/60">
            <CardHeader>
              <CardTitle className="text-lg">Lưu ý về phạm vi sử dụng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>• Đây là sản phẩm học tập, sử dụng dữ liệu minh họa.</p>
              <p>• Trợ lý ưu tiên kịch bản từ khóa; câu hỏi ngoài kịch bản được AI hỗ trợ và chỉ mang tính tham khảo.</p>
              <p>• Bài kiểm tra cảm xúc không phải kết quả chẩn đoán y khoa.</p>
              <p>• Sản phẩm không thay thế giáo viên tư vấn hoặc chuyên gia tâm lý.</p>
            </CardContent>
          </Card>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
