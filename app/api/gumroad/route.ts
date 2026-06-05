import { NextRequest, NextResponse } from "next/server";

const GUMROAD_ACCESS_TOKEN = process.env.GUMROAD_ACCESS_TOKEN;

// 验证 Gumroad 订阅
export async function POST(request: NextRequest) {
  try {
    const { licenseKey } = await request.json();
    if (!licenseKey) {
      return NextResponse.json({ success: false, error: "License key required" }, { status: 400 });
    }

    const res = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        access_token: GUMROAD_ACCESS_TOKEN || "",
        product_permalink: "reviewflow-pro",
        license_key: licenseKey,
      }),
    });

    const data = await res.json();

    if (data.success && data.uses < 5) {
      return NextResponse.json({
        success: true,
        plan: data.purchase?.variants?.includes("Agency") ? "agency" : "pro",
        email: data.purchase?.email,
      });
    } else {
      return NextResponse.json({ success: false, error: "Invalid or expired license" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 获取 Gumroad 产品信息
export async function GET() {
  try {
    const res = await fetch("https://api.gumroad.com/v2/products", {
      headers: { Authorization: `Bearer ${GUMROAD_ACCESS_TOKEN}` },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
