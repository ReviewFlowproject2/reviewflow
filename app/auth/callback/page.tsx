"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 处理 URL 中的 code 参数（magic link / email confirmation / recovery）
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const type = url.searchParams.get("type");

      if (code) {
        // 交换 code 获取 session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("Auth callback error:", error);
          router.push("/login?error=auth_failed");
          return;
        }
      }

      // 获取 session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.push("/login?error=auth_failed");
        return;
      }

      // 检查是否是新用户，如果是则创建 business 记录
      const { data: existingBiz } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!existingBiz) {
        await supabase.from("businesses").insert({
          user_id: session.user.id,
          owner_email: session.user.email,
          name: session.user.user_metadata?.full_name || "My Clinic",
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          google_review_link: "",
          plan: "free",
        });
      }

      // 根据 type 参数决定跳转目标
      // type=recovery -> Dashboard（密码重置对话框在 dashboard 中弹出）
      // type=signup/invite -> 验证成功页面
      // 其他 -> Dashboard
      if (type === "recovery") {
        router.push("/dashboard?type=recovery");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-brand-muted text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
