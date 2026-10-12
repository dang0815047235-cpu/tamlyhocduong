import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, KeyRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function AvatarEditor() {
  const { user, profile } = useAuth();
  const [path, setPath] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setPath(profile?.avatar_url ?? null); }, [profile?.avatar_url]);
  useEffect(() => {
    if (!path) { setUrl(null); return; }
    void supabase.storage.from("avatars").createSignedUrl(path, 3600).then(({ data }) => setUrl(data?.signedUrl ?? null));
  }, [path]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast.error("Bạn hãy chọn một tệp ảnh."); return; }
    if (file.size > 3 * 1024 * 1024) { toast.error("Ảnh cần nhỏ hơn 3MB."); return; }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const newPath = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(newPath, file, { contentType: file.type });
    if (error) { setUploading(false); toast.error("Chưa tải ảnh lên được. Bạn thử lại nhé."); return; }
    const { error: upErr } = await supabase.from("profiles").update({ avatar_url: newPath }).eq("id", user.id);
    setUploading(false);
    if (upErr) { toast.error("Chưa lưu được ảnh đại diện."); return; }
    if (path) void supabase.storage.from("avatars").remove([path]);
    setPath(newPath);
    toast.success("Đã cập nhật ảnh đại diện.");
  };

  const initials = (profile?.display_name ?? "?").trim().split(/\s+/).map((w) => w[0]).slice(-2).join("").toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-20">
        {url && <AvatarImage src={url} alt="Ảnh đại diện" className="object-cover" />}
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <Button size="sm" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
          <Camera className="size-4" /> {uploading ? "Đang tải lên..." : path ? "Đổi ảnh đại diện" : "Tải ảnh đại diện"}
        </Button>
        <p className="text-xs text-muted-foreground">Ảnh JPG, PNG, tối đa 3MB.</p>
      </div>
    </div>
  );
}

export function PasswordChanger() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    if (next.length < 6) { toast.error("Mật khẩu mới cần ít nhất 6 ký tự."); return; }
    if (next !== confirm) { toast.error("Mật khẩu nhập lại chưa khớp."); return; }
    setBusy(true);
    const { error: signErr } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
    if (signErr) { setBusy(false); toast.error("Mật khẩu hiện tại chưa đúng."); return; }
    const { error } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (error) { toast.error(/weak|pwned/i.test(error.message) ? "Mật khẩu này quá dễ đoán, bạn chọn mật khẩu khác nhé." : "Chưa đổi được mật khẩu. Bạn thử lại nhé."); return; }
    toast.success("Đã đổi mật khẩu.");
    setOpen(false); setCurrent(""); setNext(""); setConfirm("");
  };

  return (
    <div className="border-t border-border pt-4">
      {!open ? (
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}><KeyRound className="size-4" /> Đổi mật khẩu</Button>
      ) : (
        <form onSubmit={submit} className="max-w-sm space-y-3">
          <div className="space-y-1"><Label htmlFor="pw-current">Mật khẩu hiện tại</Label><Input id="pw-current" type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} /></div>
          <div className="space-y-1"><Label htmlFor="pw-new">Mật khẩu mới</Label><Input id="pw-new" type="password" required value={next} onChange={(e) => setNext(e.target.value)} placeholder="Ít nhất 6 ký tự" /></div>
          <div className="space-y-1"><Label htmlFor="pw-confirm">Nhập lại mật khẩu mới</Label><Input id="pw-confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
          <div className="flex gap-2"><Button size="sm" type="submit" disabled={busy}>{busy ? "Đang lưu..." : "Lưu mật khẩu"}</Button><Button size="sm" type="button" variant="ghost" onClick={() => setOpen(false)}>Hủy</Button></div>
        </form>
      )}
    </div>
  );
}
