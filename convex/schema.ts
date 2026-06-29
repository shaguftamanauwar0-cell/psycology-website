import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Private messages left through the website contact form.
  messages: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    createdAt: v.number(),
    handled: v.optional(v.boolean()),
  }).index("by_createdAt", ["createdAt"]),
});
