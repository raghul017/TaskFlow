"use client";

import {
  Book,
  FileText,
  Video,
  Download,
  ArrowRight,
  Search,
  Bookmark,
  PlayCircle,
  FileCode,
  GraduationCap,
} from "lucide-react";
import Image from "next/image";

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gray-50 dark:bg-gray-800 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Resources & Learning
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              Everything you need to master TaskFlow and boost your productivity
            </p>
            <div className="mt-10 relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Resources */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Featured Resources
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredResources.map((resource) => (
              <div
                key={resource.title}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <div className="aspect-video relative">
                  <Image
                    src={resource.image}
                    alt={resource.title}
                    fill
                    className="object-cover"
                  />
                  {resource.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <PlayCircle className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <resource.icon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-500 font-medium">
                      {resource.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {resource.duration}
                    </span>
                    <button className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium inline-flex items-center">
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Categories */}
      <div className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Browse by Category
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.title}
                className="group bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <div className={`${category.iconClass} p-3 rounded-lg w-fit`}>
                  <category.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {category.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
                <div className="mt-4 flex items-center text-blue-500 font-medium">
                  Explore
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Paths */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Learning Paths
            </h2>
            <button className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium inline-flex items-center">
              View all paths
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {learningPaths.map((path) => (
              <div
                key={path.title}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {path.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {path.duration} · {path.modules} modules
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {path.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {path.enrolled}+ enrolled
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4">
                  <button className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                    Start learning →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const featuredResources = [
  {
    title: "Getting Started with TaskFlow",
    description: "Learn the basics and set up your first project",
    image: "https://picsum.photos/800/400?random=1",
    category: "Guide",
    icon: Book,
    duration: "15 min read",
    type: "article",
  },
  {
    title: "Advanced Task Management",
    description: "Master task organization and workflow optimization",
    image: "https://picsum.photos/800/400?random=2",
    category: "Tutorial",
    icon: Video,
    duration: "20 min watch",
    type: "video",
  },
  {
    title: "Team Collaboration Best Practices",
    description: "Learn how to work effectively with your team",
    image: "https://picsum.photos/800/400?random=3",
    category: "Guide",
    icon: FileText,
    duration: "10 min read",
    type: "article",
  },
];

const categories = [
  {
    title: "Documentation",
    description: "Comprehensive guides and API references",
    icon: Book,
    iconClass:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
  },
  {
    title: "Tutorials",
    description: "Step-by-step guides for common tasks",
    icon: Video,
    iconClass:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
  },
  {
    title: "API Reference",
    description: "Detailed API documentation and examples",
    icon: FileCode,
    iconClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
  },
  {
    title: "Downloads",
    description: "Resources, templates, and tools",
    icon: Download,
    iconClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
  },
];

const learningPaths = [
  {
    title: "TaskFlow Fundamentals",
    description: "Master the basics of task management and team collaboration",
    duration: "2 hours",
    modules: 5,
    enrolled: 1234,
  },
  {
    title: "Advanced Workflows",
    description: "Learn advanced techniques for workflow optimization",
    duration: "3 hours",
    modules: 7,
    enrolled: 856,
  },
  {
    title: "Team Leadership",
    description: "Develop skills to lead and manage teams effectively",
    duration: "4 hours",
    modules: 8,
    enrolled: 642,
  },
];
