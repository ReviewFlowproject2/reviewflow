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

      // Supabase 会自动处理 URL hash 中的 access_token
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.push("/login?error=auth_failed");
        return;
      }

      // 检查是否是新用户（Google 登录），如果是则创建 business 记录
      const { data: existingBiz } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!existingBiz) {
        await supabase.from("businesses").insert({
          user_id: session.user.id,
          name: session.user.user_metadata?.full_name || "My Clinic",
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          google_review_link: "",
          plan: "free",
        });
      }

      router.push("/dashboard");
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
