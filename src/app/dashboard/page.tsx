"use client";

import {
  Calendar,
  CheckCircle,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Layout,
  Clock,
  BarChart,
  Bell,
  GitBranch,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { handleAPIError, isAuthError } from "@/utils/error";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { SoundManager } from "@/utils/audio";
import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isToday,
  startOfDay,
  isThisWeek,
  isThisMonth,
  isSameDay,
} from "date-fns";

// Types
interface User {
  id: string;
  name: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "pending" | "completed";
  dueDate?: string;
  priority: "low" | "medium" | "high";
  timerSettings: {
    pomodoroLength: number;
    shortBreak: number;
    longBreak: number;
    shortBreakSeconds?: number;
    longBreakSeconds?: number;
  };
  timeSpent: number;
  timeEstimate?: number;
  trackedSessions?: {
    startTime: Date;
    endTime: Date;
    duration: number;
  }[];
}

const priorityConfig = {
  high: {
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-900/10",
    label: "High",
  },
  medium: {
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/10",
    label: "Medium",
  },
  low: {
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-900/10",
    label: "Low",
  },
} as const;

const defaultTimerSettings = {
  pomodoroLength: 25,
  shortBreak: 5,
  longBreak: 15,
  shortBreakSeconds: 0,
  longBreakSeconds: 0,
} as const;

// Helper function to get priority config
const getPriorityConfig = (priority?: Task["priority"]) => {
  return priorityConfig[priority || "medium"] || priorityConfig.medium;
};

// Helper function to format time
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    dueDate: string;
    priority: Task["priority"];
    timerSettings: typeof defaultTimerSettings;
  }>({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    timerSettings: { ...defaultTimerSettings },
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sortBy, setSortBy] = useState<"priority" | "dueDate" | "status">(
    "priority"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<
    "all" | Task["priority"]
  >("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<
    "list" | "calendar" | "analytics" | "timeline" | "settings" | "reports"
  >("list");
  const [selectedDateForNewTask, setSelectedDateForNewTask] =
    useState<Date | null>(null);
  const [soundManager] = useState(
    () => new SoundManager("/sounds/timer-complete.mp3")
  );
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [activeNotification, setActiveNotification] =
    useState<Notification | null>(null);
  const [isTimerComplete, setIsTimerComplete] = useState(false);
  const [timerPosition, setTimerPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTimer, setActiveTimer] = useState<{
    taskId: string;
    timeLeft: number;
    type: "work" | "shortBreak" | "longBreak";
    interval?: NodeJS.Timeout;
  } | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");
  const [localTimerSettings, setLocalTimerSettings] =
    useState(defaultTimerSettings);

  // Add useEffect for fetching tasks
  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/sign-in");
        return;
      }

      try {
        const res = await fetch("/api/tasks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [router]);

  // Add filtered tasks computation
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      if (filterPriority === "all") return true;
      return task.priority === filterPriority;
    })
    .filter((task) => {
      if (!searchTerm) return true;
      return task.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

  // Analytics data calculations
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
  const totalTimeTracked = tasks.reduce(
    (acc, task) => acc + (task.timeSpent || 0),
    0
  );

  const toggleTaskStatus = async (taskId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    const newStatus = task.status === "completed" ? "pending" : "completed";

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update task");
      }

      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === taskId ? { ...t, status: newStatus } : t
        )
      );
    } catch (error) {
      console.error("Failed to toggle task status:", error);
      const { message } = handleAPIError(error);
      setError(message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((prevTasks) => prevTasks.filter((t) => t._id !== taskId));
    } catch (error) {
      console.error("Failed to delete task:", error);
      const { message } = handleAPIError(error);
      setError(message);
    }
  };

  const startTimer = (
    taskId: string,
    type: "work" | "shortBreak" | "longBreak"
  ) => {
    if (activeTimer) {
      stopTimer();
    }

    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    let duration = 0;
    switch (type) {
      case "work":
        duration = task.timerSettings.pomodoroLength * 60;
        break;
      case "shortBreak":
        duration =
          task.timerSettings.shortBreak * 60 +
          (task.timerSettings.shortBreakSeconds || 0);
        break;
      case "longBreak":
        duration =
          task.timerSettings.longBreak * 60 +
          (task.timerSettings.longBreakSeconds || 0);
        break;
    }

    const interval = setInterval(() => {
      setActiveTimer((current) => {
        if (!current) return null;

        const newTimeLeft = current.timeLeft - 1;
        if (newTimeLeft <= 0) {
          clearInterval(interval);
          setIsTimerComplete(true);
          soundManager.play().catch(console.error);
          return { ...current, timeLeft: 0 };
        }
        return { ...current, timeLeft: newTimeLeft };
      });
    }, 1000);

    setActiveTimer({
      taskId,
      timeLeft: duration,
      type,
      interval,
    });
  };

  const stopTimer = () => {
    if (activeTimer?.interval) {
      clearInterval(activeTimer.interval);
    }
    setActiveTimer(null);
    setIsTimerComplete(false);
  };

  const toggleSound = () => {
    if (soundVolume > 0) {
      setSoundVolume(0);
      soundManager.mute();
    } else {
      setSoundVolume(0.5);
      soundManager.unmute();
    }
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX - timerPosition.x;
    const startY = e.clientY - timerPosition.y;

    const handleMouseMove = (e: MouseEvent) => {
      setTimerPosition({
        x: e.clientX - startX,
        y: e.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/tasks/${editingTask._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingTask),
      });

      if (!res.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await res.json();
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
      setShowEditModal(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Failed to update task:", error);
      const { message } = handleAPIError(error);
      setError(message);
    }
  };

  const handleNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const taskData = {
        ...newTask,
        status: "pending",
        timeSpent: 0,
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        throw new Error("Failed to create task");
      }

      const createdTask = await res.json();
      setTasks((prevTasks) => [...prevTasks, createdTask]);
      setShowNewTaskModal(false);
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        timerSettings: { ...defaultTimerSettings },
      });
    } catch (error) {
      console.error("Failed to create task:", error);
      const { message } = handleAPIError(error);
      setError(message);
    }
  };

  // Add this after the filteredAndSortedTasks computation
  const groupedTasks = useMemo(() => {
    let filteredTasks = [...tasks];

    // Apply timeline filter
    if (timelineFilter !== "all") {
      const today = startOfDay(new Date());
      filteredTasks = filteredTasks.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = startOfDay(new Date(task.dueDate));
        switch (timelineFilter) {
          case "today":
            return isSameDay(dueDate, today);
          case "week":
            return isThisWeek(dueDate);
          case "month":
            return isThisMonth(dueDate);
          default:
            return true;
        }
      });
    }

    // Group tasks by date
    const groups: { date: string; tasks: Task[] }[] = [];
    const tasksByDate = new Map<string, Task[]>();

    filteredTasks.forEach((task) => {
      if (!task.dueDate) return;
      const dateKey = startOfDay(new Date(task.dueDate)).toISOString();
      const existingTasks = tasksByDate.get(dateKey) || [];
      tasksByDate.set(dateKey, [...existingTasks, task]);
    });

    // Convert map to sorted array
    Array.from(tasksByDate.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .forEach(([date, tasks]) => {
        groups.push({ date, tasks });
      });

    return groups;
  }, [tasks, timelineFilter]);

  const handleTimerSettingChange = (
    setting: keyof typeof defaultTimerSettings,
    value: number
  ) => {
    setLocalTimerSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  // Add this with other functions in the DashboardPage component
  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/sign-in");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#111111]">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161616] fixed md:relative h-full z-30 ${
          isSidebarOpen ? "" : "translate-x-0"
        }`}
      >
        {/* Sidebar content */}
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            {isSidebarOpen && (
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                TaskFlow
              </h1>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${
                !isSidebarOpen ? "w-full flex justify-center" : ""
              }`}
            >
              <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 space-y-2">
            <button
              onClick={() => setView("list")}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                view === "list"
                  ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <Layout className="h-4 w-4 flex-shrink-0" />
              {isSidebarOpen && <span className="ml-3">All Tasks</span>}
            </button>

            <button
              onClick={() => setView("calendar")}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                view === "calendar"
                  ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <Calendar className="h-4 w-4 flex-shrink-0" />
              {isSidebarOpen && <span className="ml-3">Calendar</span>}
            </button>

            <button
              onClick={() => setView("timeline")}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                view === "timeline"
                  ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <GitBranch className="h-4 w-4 flex-shrink-0" />
              {isSidebarOpen && <span className="ml-3">Timeline</span>}
            </button>

            <button
              onClick={() => setView("analytics")}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                view === "analytics"
                  ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <BarChart className="h-4 w-4 flex-shrink-0" />
              {isSidebarOpen && <span className="ml-3">Analytics</span>}
            </button>

            <button
              onClick={() => setView("reports")}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                view === "reports"
                  ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <FileText className="h-4 w-4 flex-shrink-0" />
              {isSidebarOpen && <span className="ml-3">Reports</span>}
            </button>
          </nav>

          {/* Settings at bottom */}
          <div className="mt-[540px] pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setView("settings")}
              className={`flex items-center w-full px-3 py-2 text-sm  font-medium rounded-lg transition-colors ${
                view === "settings"
                  ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              {isSidebarOpen && <span className="ml-3">Settings</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:pl-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white dark:bg-[#161616] border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-4 md:px-6">
            <div className="flex items-center space-x-4">
              <button
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full md:w-64 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </header>

        {/* Analytics Cards - Make them responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:p-6">
          {/* Task Status Card */}
          <div className="bg-white dark:bg-[#161616] rounded-lg p-6 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Task Status
              </h3>
              <CheckCircle className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {completedTasks}/{totalTasks}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tasks completed
              </p>
            </div>
          </div>

          {/* Time Tracked Card */}
          <div className="bg-white dark:bg-[#161616] rounded-lg p-6 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Time Tracked
              </h3>
              <Clock className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatDuration(totalTimeTracked)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total time spent
              </p>
            </div>
          </div>

          {/* Productivity Score Card */}
          <div className="bg-white dark:bg-[#161616] rounded-lg p-6 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Productivity
              </h3>
              <BarChart className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {Math.round(completionRate)}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Completion rate
              </p>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-white dark:bg-[#161616] rounded-lg p-6 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Notifications
              </h3>
              <Bell className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {tasks.filter((t) => new Date(t.dueDate!) <= new Date()).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Due tasks
              </p>
            </div>
          </div>
        </div>

        {/* Task List/Calendar View */}
        <div className="flex-1 p-4 md:p-6">
          <div className="bg-white dark:bg-[#161616] rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Task List Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
              <div className="flex items-center space-x-4">
                <select
                  value={filterPriority}
                  onChange={(e) =>
                    setFilterPriority(e.target.value as typeof filterPriority)
                  }
                  className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            {/* Task Items */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedTasks.map((task) => (
                <div
                  key={task._id}
                  className="group px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleTaskStatus(task._id)}
                      className="flex-shrink-0 mr-4"
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          task.status === "completed"
                            ? "bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600"
                            : "border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500"
                        }`}
                      >
                        {task.status === "completed" && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3
                          className={`text-sm font-medium ${
                            task.status === "completed"
                              ? "text-gray-400 line-through"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {task.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getPriorityConfig(task.priority).color
                          } ${getPriorityConfig(task.priority).bgColor}`}
                        >
                          {getPriorityConfig(task.priority).label}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => startTimer(task._id, "work")}
                          className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700"
                        >
                          Work
                        </button>
                        <button
                          onClick={() => startTimer(task._id, "shortBreak")}
                          className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700"
                        >
                          Short Break
                        </button>
                        <button
                          onClick={() => startTimer(task._id, "longBreak")}
                          className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700"
                        >
                          Long Break
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setShowEditModal(true);
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this task?"
                            )
                          ) {
                            handleDeleteTask(task._id);
                          }
                        }}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timer Panel */}
        {(activeTimer || isTimerComplete) && (
          <div
            style={{
              position: "fixed",
              left: timerPosition.x,
              top: timerPosition.y,
              zIndex: 9999,
              cursor: isDragging ? "grabbing" : "grab",
            }}
            onMouseDown={handleDragStart}
            className="bg-white dark:bg-[#161616] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-[90vw] sm:max-w-md"
          >
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className={`text-2xl font-mono font-bold ${
                    isTimerComplete
                      ? "text-red-500"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {Math.floor((activeTimer?.timeLeft || 0) / 60)}:
                  {((activeTimer?.timeLeft || 0) % 60)
                    .toString()
                    .padStart(2, "0")}
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {tasks.find((t) => t._id === activeTimer?.taskId)?.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    {activeTimer?.type === "work"
                      ? "Work Session"
                      : activeTimer?.type === "shortBreak"
                      ? "Short Break"
                      : "Long Break"}
                    {isTimerComplete && " - Complete!"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={stopTimer}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  Stop
                </button>
                <button
                  onClick={toggleSound}
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {soundVolume > 0 ? "Mute" : "Unmute"}
                </button>
                {soundVolume > 0 && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={soundVolume * 100}
                      onChange={(e) =>
                        setSoundVolume(Number(e.target.value) / 100)
                      }
                      className="w-20"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {showEditModal && editingTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[#161616] rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Edit Task
                </h2>
                <form onSubmit={handleEditTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingTask.title}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingTask.description || ""}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={editingTask.dueDate || ""}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            dueDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Priority
                      </label>
                      <select
                        value={editingTask.priority}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            priority: e.target.value as Task["priority"],
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timer Settings
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Work (min)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={editingTask.timerSettings.pomodoroLength}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              timerSettings: {
                                ...editingTask.timerSettings,
                                pomodoroLength:
                                  Number(e.target.value) ||
                                  defaultTimerSettings.pomodoroLength,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Short Break (min)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={editingTask.timerSettings.shortBreak}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              timerSettings: {
                                ...editingTask.timerSettings,
                                shortBreak:
                                  Number(e.target.value) ||
                                  defaultTimerSettings.shortBreak,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Long Break (min)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={editingTask.timerSettings.longBreak}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              timerSettings: {
                                ...editingTask.timerSettings,
                                longBreak:
                                  Number(e.target.value) ||
                                  defaultTimerSettings.longBreak,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Short Break (sec)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={
                            editingTask.timerSettings.shortBreakSeconds || 0
                          }
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              timerSettings: {
                                ...editingTask.timerSettings,
                                shortBreakSeconds: Number(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Long Break (sec)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={
                            editingTask.timerSettings.longBreakSeconds || 0
                          }
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              timerSettings: {
                                ...editingTask.timerSettings,
                                longBreakSeconds: Number(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingTask(null);
                      }}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {view === "calendar" && (
          <div className="p-6">
            <div className="bg-white dark:bg-[#161616] rounded-lg border border-gray-200 dark:border-zinc-800">
              <div className="p-4">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {format(selectedDate, "MMMM yyyy")}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setSelectedDate(
                          new Date(
                            selectedDate.setMonth(selectedDate.getMonth() - 1)
                          )
                        )
                      }
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => setSelectedDate(new Date())}
                      className="px-3 py-1.5 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg"
                    >
                      Today
                    </button>
                    <button
                      onClick={() =>
                        setSelectedDate(
                          new Date(
                            selectedDate.setMonth(selectedDate.getMonth() + 1)
                          )
                        )
                      }
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {/* Weekday Headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="bg-gray-50 dark:bg-gray-800 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        {day}
                      </div>
                    )
                  )}

                  {/* Calendar Days */}
                  {eachDayOfInterval({
                    start: startOfMonth(selectedDate),
                    end: endOfMonth(selectedDate),
                  }).map((date) => {
                    const dayTasks = tasks.filter(
                      (task) =>
                        task.dueDate &&
                        new Date(task.dueDate).toDateString() ===
                          date.toDateString()
                    );

                    return (
                      <div
                        key={date.toISOString()}
                        className={`group min-h-[100px] bg-white dark:bg-black/40 p-2 ${
                          !isSameMonth(date, selectedDate)
                            ? "text-gray-400 dark:text-gray-600"
                            : isToday(date)
                            ? "bg-orange-50 dark:bg-orange-900/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm ${
                              isToday(date)
                                ? "font-bold text-orange-600 dark:text-orange-400"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {format(date, "d")}
                          </span>
                          <button
                            onClick={() => {
                              const formattedDate = format(date, "yyyy-MM-dd");
                              setNewTask({
                                ...newTask,
                                dueDate: formattedDate,
                                title: "",
                                description: "",
                                priority: "medium",
                                timerSettings: { ...defaultTimerSettings },
                              });
                              setShowNewTaskModal(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-opacity"
                          >
                            <Plus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        </div>

                        {/* Tasks for this day */}
                        <div className="mt-1 space-y-1">
                          {dayTasks.map((task) => (
                            <div
                              key={task._id}
                              className={`group flex items-center gap-2 px-2 py-1 text-xs rounded-lg ${
                                task.status === "completed"
                                  ? "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400"
                                  : `${
                                      getPriorityConfig(task.priority).bgColor
                                    } ${getPriorityConfig(task.priority).color}`
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                                  task.status === "completed"
                                    ? "bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600"
                                    : "border-current"
                                }`}
                              >
                                {task.status === "completed" && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span
                                className={
                                  task.status === "completed"
                                    ? "line-through"
                                    : ""
                                }
                              >
                                {task.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "timeline" && (
          <div className="p-6">
            <div className="bg-white dark:bg-[#161616] rounded-lg border border-gray-200 dark:border-zinc-800">
              <div className="p-4">
                <div className="flex flex-col space-y-8">
                  {/* Timeline Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Timeline View
                    </h2>
                    <select
                      value={timelineFilter}
                      onChange={(e) => setTimelineFilter(e.target.value)}
                      className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                    >
                      <option value="all">All Tasks</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>

                  {/* Timeline Content */}
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                    {/* Timeline Items */}
                    <div className="space-y-6 pl-12">
                      {groupedTasks.map((group) => (
                        <div key={group.date} className="relative">
                          {/* Date Label */}
                          <div className="absolute -left-12 flex items-center">
                            <div className="w-4 h-4 rounded-full bg-orange-500 dark:bg-orange-400 ring-4 ring-white dark:ring-[#161616]" />
                            <span className="ml-4 text-sm font-medium text-gray-900 dark:text-white">
                              {format(new Date(group.date), "MMM d, yyyy")}
                            </span>
                          </div>

                          {/* Tasks for this date */}
                          <div className="mt-8 space-y-4">
                            {group.tasks.map((task) => (
                              <div
                                key={task._id}
                                className="group bg-gray-50 dark:bg-black/40 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-black/60 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() => toggleTaskStatus(task._id)}
                                      className="flex-shrink-0"
                                    >
                                      <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                          task.status === "completed"
                                            ? "bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600"
                                            : "border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500"
                                        }`}
                                      >
                                        {task.status === "completed" && (
                                          <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                    </button>
                                    <div>
                                      <h3
                                        className={`text-sm font-medium ${
                                          task.status === "completed"
                                            ? "text-gray-400 line-through"
                                            : "text-gray-900 dark:text-white"
                                        }`}
                                      >
                                        {task.title}
                                      </h3>
                                      {task.description && (
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                          {task.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        getPriorityConfig(task.priority).color
                                      } ${
                                        getPriorityConfig(task.priority).bgColor
                                      }`}
                                    >
                                      {getPriorityConfig(task.priority).label}
                                    </span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                      <button
                                        onClick={() =>
                                          startTimer(task._id, "work")
                                        }
                                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700"
                                      >
                                        Start Timer
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingTask(task);
                                          setShowEditModal(true);
                                        }}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Task Modal */}
        {showNewTaskModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[#161616] rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  New Task
                </h2>
                <form onSubmit={handleNewTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) =>
                          setNewTask({ ...newTask, dueDate: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Priority
                      </label>
                      <select
                        value={newTask.priority}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            priority: e.target.value as Task["priority"],
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timer Settings
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Work (min)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newTask.timerSettings.pomodoroLength}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              timerSettings: {
                                ...newTask.timerSettings,
                                pomodoroLength:
                                  Number(e.target.value) ||
                                  defaultTimerSettings.pomodoroLength,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Short Break (min)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newTask.timerSettings.shortBreak}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              timerSettings: {
                                ...newTask.timerSettings,
                                shortBreak:
                                  Number(e.target.value) ||
                                  defaultTimerSettings.shortBreak,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Long Break (min)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newTask.timerSettings.longBreak}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              timerSettings: {
                                ...newTask.timerSettings,
                                longBreak:
                                  Number(e.target.value) ||
                                  defaultTimerSettings.longBreak,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Short Break (sec)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={newTask.timerSettings.shortBreakSeconds || 0}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              timerSettings: {
                                ...newTask.timerSettings,
                                shortBreakSeconds: Number(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Long Break (sec)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={newTask.timerSettings.longBreakSeconds || 0}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              timerSettings: {
                                ...newTask.timerSettings,
                                longBreakSeconds: Number(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewTaskModal(false);
                        setNewTask({
                          title: "",
                          description: "",
                          dueDate: "",
                          priority: "medium",
                          timerSettings: { ...defaultTimerSettings },
                        });
                      }}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {view === "analytics" && (
          <div className="p-6">
            <div className="bg-white dark:bg-[#161616] rounded-lg border border-gray-200 dark:border-zinc-800">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Analytics Overview
                </h2>

                {/* Task Distribution */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Task Distribution
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {tasks.filter((t) => t.priority === "high").length}
                      </div>
                      <div className="text-sm text-gray-500">
                        High Priority Tasks
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {tasks.filter((t) => t.priority === "medium").length}
                      </div>
                      <div className="text-sm text-gray-500">
                        Medium Priority Tasks
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {tasks.filter((t) => t.priority === "low").length}
                      </div>
                      <div className="text-sm text-gray-500">
                        Low Priority Tasks
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Analysis */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Time Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatDuration(totalTimeTracked)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total Time Tracked
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatDuration(
                          Math.round(
                            totalTimeTracked / Math.max(completedTasks, 1)
                          )
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Average Time per Task
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports View */}
        {view === "reports" && (
          <div className="p-6">
            <div className="bg-white dark:bg-[#161616] rounded-lg border border-gray-200 dark:border-zinc-800">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Reports
                </h2>

                {/* Task Completion Report */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Task Completion Report
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Count
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            Completed
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {completedTasks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {Math.round(completionRate)}%
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            Pending
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {totalTasks - completedTasks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {Math.round(100 - completionRate)}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings View */}
        {view === "settings" && (
          <div className="p-6">
            <div className="space-y-6">
              {/* Timer Settings */}
              <div className="bg-white dark:bg-[#161616] rounded-lg border border-gray-200 dark:border-zinc-800">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Timer Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Work Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={localTimerSettings.pomodoroLength}
                        onChange={(e) =>
                          handleTimerSettingChange(
                            "pomodoroLength",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Short Break (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={localTimerSettings.shortBreak}
                        onChange={(e) =>
                          handleTimerSettingChange(
                            "shortBreak",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Long Break (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={localTimerSettings.longBreak}
                        onChange={(e) =>
                          handleTimerSettingChange(
                            "longBreak",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        console.log(
                          "Saving timer settings:",
                          localTimerSettings
                        );
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Save Timer Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-white dark:bg-[#161616] rounded-lg border border-gray-200 dark:border-zinc-800">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Notification Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Due Date Reminders
                        </h4>
                        <p className="text-sm text-gray-500">
                          Get notified before tasks are due
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Timer Notifications
                        </h4>
                        <p className="text-sm text-gray-500">
                          Get notified when timers complete
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sound Settings */}
              <div className="bg-white dark:bg-[#161616] rounded-lg border border-gray-200 dark:border-zinc-800">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Sound Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Timer Sound
                        </h4>
                        <p className="text-sm text-gray-500">
                          Play sound when timer completes
                        </p>
                      </div>
                      <button
                        onClick={toggleSound}
                        className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700"
                      >
                        {soundVolume > 0 ? "Mute" : "Unmute"}
                      </button>
                    </div>
                    {soundVolume > 0 && (
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">Volume</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={soundVolume * 100}
                          onChange={(e) =>
                            setSoundVolume(Number(e.target.value) / 100)
                          }
                          className="flex-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Theme Settings */}
              <div className="bg-white dark:bg-[#161616] rounded-lg border border-gray-200 dark:border-zinc-800">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Appearance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Dark Mode
                        </h4>
                        <p className="text-sm text-gray-500">
                          Toggle dark/light theme
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className="bg-white dark:bg-[#161616] rounded-lg border border-gray-200 dark:border-zinc-800">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Account
                  </h3>
                  <div className="space-y-4">
                    <button
                      onClick={() => router.push("/profile")}
                      className="w-full text-left px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
