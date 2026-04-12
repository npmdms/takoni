import mongoose from "mongoose";

const ChatbotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    systemPrompt: { type: String },
    welcomeMessage: { type: String },
    isActive: { type: Boolean, default: false },
    requirePreChat: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ChatbotSchema.index({ organization: 1 });
ChatbotSchema.index({ slug: 1, organization: 1 }, { unique: true });

export const Chatbot =
  mongoose.models.Chatbot || mongoose.model("Chatbot", ChatbotSchema);
