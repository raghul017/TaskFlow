import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const { userId } = verifyToken(token);
    const { taskId, automationType } = await req.json();

    await dbConnect();
    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Handle different automation types
    switch (automationType) {
      case "create_followup":
        const followupTask = await Task.create({
          title: `Follow-up: ${task.title}`,
          description: `Follow-up task for: ${task.description}`,
          userId,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        });
        return NextResponse.json(followupTask);

      case "notify_team":
        // Implement notification logic here
        return NextResponse.json({ message: "Team notified" });

      case "mark_complete":
        task.status = "completed";
        await task.save();
        return NextResponse.json(task);

      default:
        return NextResponse.json(
          { error: "Invalid automation type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Automation error:", error);
    return NextResponse.json(
      { error: "Failed to execute automation" },
      { status: 500 }
    );
  }
}
