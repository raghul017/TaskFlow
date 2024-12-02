import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const defaultTimerSettings = {
  pomodoroLength: 25,
  shortBreak: 5,
  longBreak: 15,
  shortBreakSeconds: 0,
  longBreakSeconds: 0,
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const userId = new ObjectId(session.user.id);
    const tasks = await db
      .collection("tasks")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    const serializedTasks = tasks.map((task) => ({
      ...task,
      _id: task._id.toString(),
      userId: task.userId.toString(),
      timerSettings: {
        ...defaultTimerSettings,
        ...task.timerSettings,
      },
    }));

    return NextResponse.json(serializedTasks);
  } catch (error) {
    console.error("Error in tasks API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const userId = new ObjectId(session.user.id);
    const task = {
      ...data,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending",
      priority: data.priority || "medium",
      timerSettings: {
        ...defaultTimerSettings,
        ...data.timerSettings,
      },
    };

    const result = await db.collection("tasks").insertOne(task);

    const createdTask = {
      ...task,
      _id: result.insertedId.toString(),
      userId: userId.toString(),
    };

    return NextResponse.json(createdTask);
  } catch (error) {
    console.error("Error in tasks API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
