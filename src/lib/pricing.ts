export type PlanId = "single" | "three" | "monthly";

export type Plan = {
  id: PlanId;
  name: string;
  amount: number; // rupees
  unit: string; // short label under the price
  calls: string; // what you get
  blurb: string;
  highlight?: boolean;
};

export const PLANS: Record<PlanId, Plan> = {
  single: {
    id: "single",
    name: "Single session",
    amount: 49,
    unit: "one call",
    calls: "1 session",
    blurb: "A single 30-minute listening & reflection call. Perfect to try it out.",
  },
  three: {
    id: "three",
    name: "Three sessions",
    amount: 100,
    unit: "3 calls",
    calls: "3 sessions",
    blurb: "Three calls to use whenever you need them. Better value if you'd like to continue.",
    highlight: true,
  },
  monthly: {
    id: "monthly",
    name: "Monthly",
    amount: 300,
    unit: "per month",
    calls: "up to 2 calls / week",
    blurb: "A full month of support — up to two calls every week, whenever things feel heavy.",
  },
};

export const PLAN_LIST: Plan[] = [PLANS.single, PLANS.three, PLANS.monthly];

export function getPlan(id: string | undefined | null): Plan | null {
  if (id && id in PLANS) return PLANS[id as PlanId];
  return null;
}
