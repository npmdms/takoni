import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    chatbot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chatbot",
      required: true,
    },
    conversationId: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      enum: ["widget", "preview"],
      default: "widget",
    },
    visitor: {
      name: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
  },
  { timestamps: true },
);

MessageSchema.index({ chatbot: 1, conversationId: 1, createdAt: -1 });
MessageSchema.index({ organization: 1, chatbot: 1, createdAt: -1 });

export const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);
