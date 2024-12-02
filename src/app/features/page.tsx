"use client";

import {
  ArrowRight,
  BarChart,
  CheckCircle,
  Clock,
  GitBranch,
  Layers,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section with Animation */}
      <div className="relative overflow-hidden pt-20 pb-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block mb-2">Features that power</span>
              <span className="block text-blue-200">modern teams</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">
              Everything you need to manage your tasks, collaborate with your
              team, and boost productivity.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Grid with Hover Effects */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm hover:-translate-y-1"
            >
              <div
                className={`inline-flex p-3 rounded-xl ${feature.iconBackground} ${feature.iconForeground} ring-2 ring-white/20 shadow-lg`}
              >
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-4 text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="mt-6 flex items-center text-blue-500 dark:text-blue-400 font-medium">
                Learn more
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Features with Alternating Layout */}
      <div className="bg-white dark:bg-gray-800">
        {detailedFeatures.map((feature, idx) => (
          <div
            key={feature.title}
            className={`relative ${
              idx % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : ""
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="relative lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
                <div
                  className={`relative ${idx % 2 === 0 ? "" : "lg:order-2"}`}
                >
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-6 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  <ul className="mt-10 space-y-6">
                    {feature.items.map((item) => (
                      <li key={item} className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-6 w-6 text-emerald-500" />
                        </div>
                        <span className="ml-4 text-base text-gray-500 dark:text-gray-400">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`mt-12 lg:mt-0 ${
                    idx % 2 === 0 ? "lg:order-2" : ""
                  }`}
                >
                  <div className="relative mx-auto w-full rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section with Gradient */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-200 mt-2">
              Start your free trial today.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 space-x-4">
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition-colors shadow-lg">
              Get started
            </button>
            <button className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-lg text-white hover:bg-white/10 transition-colors">
              Learn more
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    title: "Task Management",
    description:
      "Create, organize, and track tasks with our intuitive interface. Set priorities, deadlines, and dependencies.",
    icon: Layers,
    iconBackground: "bg-blue-100 dark:bg-blue-900/50",
    iconForeground: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Real-time Collaboration",
    description:
      "Work together seamlessly with your team. Share updates, comments, and files in real-time.",
    icon: Users,
    iconBackground: "bg-purple-100 dark:bg-purple-900/50",
    iconForeground: "text-purple-600 dark:text-purple-400",
  },
  {
    title: "Advanced Analytics",
    description:
      "Track progress and performance with detailed insights and customizable dashboards.",
    icon: BarChart,
    iconBackground: "bg-emerald-100 dark:bg-emerald-900/50",
    iconForeground: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Smart Automation",
    description:
      "Automate repetitive tasks and workflows to save time and reduce errors.",
    icon: Zap,
    iconBackground: "bg-amber-100 dark:bg-amber-900/50",
    iconForeground: "text-amber-600 dark:text-amber-400",
  },
  {
    title: "Time Tracking",
    description:
      "Monitor time spent on tasks and projects with built-in time tracking tools.",
    icon: Clock,
    iconBackground: "bg-rose-100 dark:bg-rose-900/50",
    iconForeground: "text-rose-600 dark:text-rose-400",
  },
  {
    title: "Version Control",
    description:
      "Keep track of changes and maintain a complete history of your projects.",
    icon: GitBranch,
    iconBackground: "bg-indigo-100 dark:bg-indigo-900/50",
    iconForeground: "text-indigo-600 dark:text-indigo-400",
  },
];

const detailedFeatures = [
  {
    title: "Advanced Task Management",
    description:
      "Take control of your projects with our comprehensive task management system.",
    image: "https://picsum.photos/800/600?random=1",
    items: [
      "Intuitive drag-and-drop interface",
      "Custom fields and task templates",
      "Advanced filtering and sorting",
      "Bulk task operations",
      "Task dependencies and relationships",
    ],
  },
  {
    title: "Team Collaboration",
    description:
      "Work together more effectively with built-in collaboration tools.",
    image: "https://picsum.photos/800/600?random=2",
    items: [
      "Real-time updates and notifications",
      "Team chat and discussions",
      "File sharing and version control",
      "Role-based access control",
      "Activity tracking and audit logs",
    ],
  },
  {
    title: "Workflow Automation",
    description:
      "Save time and reduce errors with powerful automation features.",
    image: "https://picsum.photos/800/600?random=3",
    items: [
      "Custom automation rules",
      "Scheduled tasks and reminders",
      "Integration with popular tools",
      "Automated reporting",
      "Workflow templates",
    ],
  },
];
