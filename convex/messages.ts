import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Store a new contact message from the website. */
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim().slice(0, 120);
    const email = args.email.trim().slice(0, 200);
    const message = args.message.trim().slice(0, 5000);

    if (!name || !email || !message) {
      throw new Error("All fields are required.");
    }

    return await ctx.db.insert("messages", {
      name,
      email,
      message,
      createdAt: Date.now(),
      handled: false,
    });
  },
});

/** List recent messages (for the Convex dashboard / future admin view). */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);
  },
});
