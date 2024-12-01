"use client";

import { Zap, Users, Lock, Bell } from "lucide-react";

const features = [
  {
    name: "Lightning Fast",
    description:
      "Experience instant updates and real-time collaboration with our optimized platform.",
    icon: Zap,
  },
  {
    name: "Team Collaboration",
    description:
      "Work seamlessly with your team members, share tasks, and track progress together.",
    icon: Users,
  },
  {
    name: "Enterprise Security",
    description:
      "Your data is protected with enterprise-grade security and encryption protocols.",
    icon: Lock,
  },
  {
    name: "Smart Notifications",
    description:
      "Stay updated with intelligent notifications that matter to your workflow.",
    icon: Bell,
  },
];

export default function Features() {
  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Everything you need to manage tasks effectively
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Powerful features to help you manage your tasks and team
            efficiently.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <span className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-md">
                  <feature.icon
                    className="h-6 w-6 text-blue-600"
                    aria-hidden="true"
                  />
                </span>
              </div>
              <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                {feature.name}
              </h3>
              <p className="mt-2 text-base text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
