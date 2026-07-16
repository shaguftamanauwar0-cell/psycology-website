export type PlanId = "first" | "single" | "three" | "monthly";

export type Plan = {
  id: PlanId;
  name: string;
  amount: number; // rupees (0 = free)
  unit: string; // short label under the price
  calls: string; // what you get
  blurb: string;
  badge?: string; // optional ribbon label
  highlight?: boolean;
};

export const PLANS: Record<PlanId, Plan> = {
  first: {
    id: "first",
    name: "First session",
    amount: 0,
    unit: "free",
    calls: "1 session · free",
    blurb:
      "Your very first listening & reflection call is completely free — one per person, no payment needed.",
    badge: "Free · first time",
    highlight: true,
  },
  single: {
    id: "single",
    name: "Single session",
    amount: 49,
    unit: "per call",
    calls: "1 session",
    blurb:
      "After your free first call, continue with a one-off session whenever you need it.",
  },
  three: {
    id: "three",
    name: "Three sessions",
    amount: 100,
    unit: "3 calls",
    calls: "3 sessions",
    blurb: "Save with three sessions to use whenever you like.",
    badge: "Best value",
  },
  monthly: {
    id: "monthly",
    name: "Monthly",
    amount: 300,
    unit: "per month",
    calls: "up to 2 calls / week",
    blurb:
      "A full month of support — up to two calls every week, whenever things feel heavy.",
  },
};

export const PLAN_LIST: Plan[] = [
  PLANS.first,
  PLANS.single,
  PLANS.three,
  PLANS.monthly,
];

export function getPlan(id: string | undefined | null): Plan | null {
  if (id && id in PLANS) return PLANS[id as PlanId];
  return null;
}

/** Price shown to users: "Free" when amount is 0, else "₹49". */
export function priceLabel(amount: number): string {
  return amount === 0 ? "Free" : `₹${amount}`;
}
