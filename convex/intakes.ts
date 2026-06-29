import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Store a completed pre-booking intake form. */
export const create = mutation({
  args: {
    name: v.string(),
    age: v.number(),
    gender: v.string(),
    location: v.optional(v.string()),
    email: v.string(),
    reason: v.optional(v.string()),
    feelings: v.array(v.string()),
    topics: v.array(v.string()),
    spokenBefore: v.optional(v.string()),
    language: v.optional(v.string()),
    desiredOutcome: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim().slice(0, 120);
    const email = args.email.trim().slice(0, 200);

    if (!name || !email) {
      throw new Error("Name and email are required.");
    }

    return await ctx.db.insert("intakes", {
      name,
      age: args.age,
      gender: args.gender.trim().slice(0, 60),
      location: args.location?.trim().slice(0, 120) || undefined,
      email,
      reason: args.reason?.trim().slice(0, 4000) || undefined,
      feelings: args.feelings.slice(0, 20).map((f) => f.slice(0, 60)),
      topics: args.topics.slice(0, 20).map((t) => t.slice(0, 60)),
      spokenBefore: args.spokenBefore?.trim().slice(0, 120) || undefined,
      language: args.language?.trim().slice(0, 60) || undefined,
      desiredOutcome: args.desiredOutcome?.trim().slice(0, 4000) || undefined,
      notes: args.notes?.trim().slice(0, 4000) || undefined,
      createdAt: Date.now(),
      handled: false,
    });
  },
});

/** List recent intakes (for the Convex dashboard / future admin view). */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("intakes")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);
  },
});
