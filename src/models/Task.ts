import mongoose from "mongoose";

const automationRuleSchema = new mongoose.Schema({
  condition: {
    type: String,
    enum: ["on_completion", "on_due_date", "on_creation"],
    required: true,
  },
  action: {
    type: String,
    enum: ["create_followup", "notify_team", "mark_complete"],
    required: true,
  },
  parameters: {
    type: Map,
    of: String,
    default: new Map(),
  },
});

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    dueDate: Date,
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    automationRules: [automationRuleSchema],
    isAutomated: {
      type: Boolean,
      default: false,
    },
    timerSettings: {
      pomodoroLength: { type: Number, default: 25 },
      shortBreak: { type: Number, default: 5 },
      longBreak: { type: Number, default: 15 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model("Task", taskSchema);
