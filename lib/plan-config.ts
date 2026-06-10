// ============================================================
// ReviewFlow 套餐权限配置 — 单一真实来源
// ============================================================

export type PlanTier = "free" | "pro" | "agency";

export interface PlanLimits {
  maxPatients: number;
  maxCompetitors: number;
  maxClinics: number;
  maxTeamMembers: number;
  historicalDataDays: number;
  emailAutomation: boolean;
  reviewAlerts: boolean;
  competitorTracking: boolean;
  multiClinic: boolean;
  whiteLabel: boolean;
  apiAccess: boolean;
  dailyDigest: boolean;
  priorityAlerts: boolean;
  multiRecipientAlerts: boolean;
  dedicatedSupport: boolean;
  exportReports: boolean;
  removeBranding: boolean;
}

export interface PlanInfo {
  name: string;
  price: string;
  color: string;
  bg: string;
  features: string[];
}

// ==================== 套餐限制定义 ====================
export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxPatients: 50,
    maxCompetitors: 1,
    maxClinics: 1,
    maxTeamMembers: 1,
    historicalDataDays: 7,
    emailAutomation: false,
    reviewAlerts: false,
    competitorTracking: true,   // 仅 1 个
    multiClinic: false,
    whiteLabel: false,
    apiAccess: false,
    dailyDigest: false,
    priorityAlerts: false,
    multiRecipientAlerts: false,
    dedicatedSupport: false,
    exportReports: false,
    removeBranding: false,
  },
  pro: {
    maxPatients: 1000,
    maxCompetitors: 3,
    maxClinics: 1,
    maxTeamMembers: 1,
    historicalDataDays: 30,
    emailAutomation: true,
    reviewAlerts: true,
    competitorTracking: true,
    multiClinic: false,
    whiteLabel: false,
    apiAccess: false,
    dailyDigest: false,
    priorityAlerts: false,
    multiRecipientAlerts: false,
    dedicatedSupport: false,
    exportReports: false,
    removeBranding: true,
  },
  agency: {
    maxPatients: 10000,
    maxCompetitors: 20,
    maxClinics: 10,
    maxTeamMembers: 5,
    historicalDataDays: Infinity,
    emailAutomation: true,
    reviewAlerts: true,
    competitorTracking: true,
    multiClinic: true,
    whiteLabel: true,
    apiAccess: true,
    dailyDigest: true,
    priorityAlerts: true,
    multiRecipientAlerts: true,
    dedicatedSupport: true,
    exportReports: true,
    removeBranding: true,
  },
};

// ==================== 套餐信息（用于 UI 展示）====================
export const PLAN_INFO: Record<PlanTier, PlanInfo> = {
  free: {
    name: "Free",
    price: "$0",
    color: "text-gray-500",
    bg: "bg-gray-50",
    features: [
      "QR code generation",
      "Basic dashboard",
      "50 patients",
      "1 competitor tracking",
      "1 clinic",
    ],
  },
  pro: {
    name: "Pro",
    price: "$39/mo",
    color: "text-brand-blue",
    bg: "bg-brand-soft",
    features: [
      "Everything in Free",
      "Email automation",
      "1,000 patients",
      "Review alerts",
      "3 competitor tracking",
      "Remove branding",
    ],
  },
  agency: {
    name: "Agency",
    price: "$69/mo",
    color: "text-amber-600",
    bg: "bg-amber-50",
    features: [
      "Everything in Pro",
      "Multi-clinic (10)",
      "White-label",
      "API access",
      "10,000 patients",
      "Daily Digest",
      "Priority alerts",
    ],
  },
};

// ==================== 有效套餐计算 ====================
export interface EffectivePlan {
  tier: PlanTier;
  limits: PlanLimits;
  info: PlanInfo;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  isPaid: boolean;
  trialEndsAt: string | null;
}

/**
 * 根据 business 记录计算当前有效套餐
 *
 * 逻辑：
 * 1. 如果有活跃订阅 (subscription_status === 'active') → 使用 subscription_tier
 * 2. 如果 trial 未过期 → 使用数据库中的 plan
 * 3. 如果 trial 已过期 → 退回到 Free
 */
export function getEffectivePlan(business: {
  plan?: string | null;
  trial_ends_at?: string | null;
  subscription_status?: string | null;
  subscription_tier?: string | null;
} | null): EffectivePlan {
  if (!business) {
    return {
      tier: "free",
      limits: PLAN_LIMITS.free,
      info: PLAN_INFO.free,
      isTrialActive: false,
      isTrialExpired: true,
      isPaid: false,
      trialEndsAt: null,
    };
  }

  const now = new Date();
  const trialEnd = business.trial_ends_at ? new Date(business.trial_ends_at) : null;
  const isTrialExpired = trialEnd ? trialEnd <= now : false;
  const isTrialActive = trialEnd ? trialEnd > now : false;
  const isPaid = business.subscription_status === "active";

  // 有付费订阅 → 使用订阅等级
  if (isPaid && business.subscription_tier) {
    const tier = (business.subscription_tier as PlanTier) || "free";
    return {
      tier,
      limits: PLAN_LIMITS[tier],
      info: PLAN_INFO[tier],
      isTrialActive: false,
      isTrialExpired: false,
      isPaid: true,
      trialEndsAt: business.trial_ends_at || null,
    };
  }

  // 用户手动设置了 plan（pro/agency）但 subscription_status 未配置 → 尊重 plan
  const dbPlan = (business.plan as PlanTier) || "free";
  if (dbPlan !== "free" && !business.subscription_status) {
    return {
      tier: dbPlan,
      limits: PLAN_LIMITS[dbPlan],
      info: PLAN_INFO[dbPlan],
      isTrialActive: isTrialActive,
      isTrialExpired: isTrialExpired,
      isPaid: false,
      trialEndsAt: business.trial_ends_at || null,
    };
  }

  // Trial 未过期 → 使用当前 plan
  if (isTrialActive) {
    const tier = (business.plan as PlanTier) || "free";
    return {
      tier,
      limits: PLAN_LIMITS[tier],
      info: PLAN_INFO[tier],
      isTrialActive: true,
      isTrialExpired: false,
      isPaid: false,
      trialEndsAt: business.trial_ends_at || null,
    };
  }

  // Trial 已过期 → 退回到 Free
  return {
    tier: "free",
    limits: PLAN_LIMITS.free,
    info: PLAN_INFO.free,
    isTrialActive: false,
    isTrialExpired: true,
    isPaid: false,
    trialEndsAt: business.trial_ends_at || null,
  };
}

/**
 * 获取 trial 剩余天数和日期范围
 */
export function getTrialInfo(trialEndsAt: string | null | undefined) {
  if (!trialEndsAt) {
    return { daysLeft: 0, dateRange: "—", isExpired: true };
  }
  const endDate = new Date(trialEndsAt);
  const now = new Date();
  const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isExpired = daysLeft <= 0;
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const dateRange = `${fmt(startDate)} - ${fmt(endDate)}`;
  return { daysLeft, dateRange, isExpired };
}

/**
 * 检查特定功能是否可用
 */
export function canUseFeature(
  plan: EffectivePlan,
  feature: keyof PlanLimits
): boolean {
  return plan.limits[feature] === true;
}

/**
 * 获取数量限制
 */
export function getLimit(
  plan: EffectivePlan,
  limit: keyof PlanLimits
): number {
  const val = plan.limits[limit];
  if (typeof val === "number") return val;
  return 0;
}
