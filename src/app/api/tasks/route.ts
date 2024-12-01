import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const defaultTimerSettings = {
  pomodoroLength: 25,
  shortBreak: 5,
  longBreak: 15,
  shortBreakSeconds: 0,
  longBreakSeconds: 0,
};

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Convert string ID to ObjectId for query
    const userId = new ObjectId(decoded.id);

    // Find all tasks for this user
    const tasks = await db
      .collection("tasks")
      .find({ userId }) // Query by userId
      .sort({ createdAt: -1 })
      .toArray();

    // Convert ObjectIds to strings for response
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
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const data = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Create task with proper userId
    const userId = new ObjectId(decoded.id);
    const task = {
      ...data,
      userId, // Store userId as ObjectId
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

    // Return the task with string IDs
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
