import { createFileRoute } from "@tanstack/react-router";

// Temporary one-time setup route. Removed after use.
export const Route = createFileRoute("/api/public/setup-admin")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const email = "admin@pvd.local";
        let userId: string | undefined;
        const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: "123456",
          email_confirm: true,
          user_metadata: { display_name: "Quản trị viên", role: "student" },
        });
        if (error) {
          const { data: list } = await supabaseAdmin.auth.admin.listUsers();
          userId = list.users.find((u) => u.email === email)?.id;
          if (!userId) return Response.json({ ok: false, error: error.message }, { status: 500 });
        } else {
          userId = created.user.id;
        }
        const { error: rErr } = await supabaseAdmin.from("user_roles").upsert(
          [
            { user_id: userId, role: "admin" },
            { user_id: userId, role: "teacher" },
          ],
          { onConflict: "user_id,role" },
        );
        return Response.json({ ok: !rErr, error: rErr?.message ?? null });
      },
    },
  },
});
