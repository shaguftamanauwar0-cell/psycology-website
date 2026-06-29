import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Private "just say hello" messages from the website contact form.
  messages: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    createdAt: v.number(),
    handled: v.optional(v.boolean()),
  }).index("by_createdAt", ["createdAt"]),

  // Pre-booking intake forms completed before requesting an appointment.
  intakes: defineTable({
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
    createdAt: v.number(),
    handled: v.optional(v.boolean()),
  }).index("by_createdAt", ["createdAt"]),
});
