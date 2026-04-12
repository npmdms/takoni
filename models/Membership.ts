import mongoose from "mongoose";

const MembershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "member"],
      default: "member",
    },
  },
  { timestamps: true },
);

MembershipSchema.index({ user: 1, organization: 1 }, { unique: true });

export const Membership =
  mongoose.models.Membership || mongoose.model("Membership", MembershipSchema);
