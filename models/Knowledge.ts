import mongoose from "mongoose";

const KnowledgeSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    chatbotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chatbot",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "general",
        "product",
        "pricing",
        "support",
        "faq",
        "policy",
        "other",
      ],
      required: true,
    },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    embedding: [{ type: Number }],
  },
  { timestamps: true },
);

KnowledgeSchema.index({ organizationId: 1, chatbotId: 1 });
KnowledgeSchema.index({ chatbotId: 1, category: 1 });

export const Knowledge =
  mongoose.models.Knowledge || mongoose.model("Knowledge", KnowledgeSchema);
