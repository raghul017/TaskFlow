"use client";

import {
  ArrowRight,
  Building2,
  Users2,
  Briefcase,
  Target,
  Rocket,
  Puzzle,
} from "lucide-react";
import Image from "next/image";

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 sm:pt-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Solutions for every team
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              Discover how TaskFlow can help your team achieve more. Our
              flexible solutions adapt to your unique needs and workflows.
            </p>
          </div>
        </div>
      </div>

      {/* Solutions Grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution) => (
            <div
              key={solution.title}
              className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-8 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className={`${solution.iconClass} p-3 rounded-xl`}>
                  <solution.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {solution.title}
                </h3>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                {solution.description}
              </p>
              <ul className="mt-8 space-y-3">
                {solution.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center text-gray-600 dark:text-gray-400"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                Learn more
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case Studies */}
      <div className="bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Success Stories
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              See how leading organizations are transforming their workflows
              with TaskFlow
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {caseStudies.map((study) => (
              <div key={study.company} className="relative group">
                <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-white dark:bg-gray-900">
                  <Image
                    src={study.image}
                    alt={study.company}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
                  <div className="absolute bottom-0 p-6 text-white">
                    <p className="text-sm font-medium text-blue-400">
                      {study.industry}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">
                      {study.company}
                    </h3>
                    <p className="mt-2 text-gray-300">{study.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Ready to transform your workflow?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-400">
              Get started with TaskFlow today and see the difference it can make
              for your team.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/sign-up"
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get started
              </a>
              <a
                href="/contact"
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Contact sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const solutions = [
  {
    title: "Enterprise",
    description:
      "Scale your organization with enterprise-grade task management.",
    icon: Building2,
    iconClass:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
    features: [
      "Advanced security controls",
      "Custom workflows",
      "Priority support",
      "Dedicated success manager",
    ],
  },
  {
    title: "Teams",
    description: "Empower your teams with collaborative tools and insights.",
    icon: Users2,
    iconClass:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
    features: [
      "Real-time collaboration",
      "Team analytics",
      "Resource management",
      "Team templates",
    ],
  },
  {
    title: "Startups",
    description: "Move fast and stay organized as you grow your business.",
    icon: Rocket,
    iconClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
    features: [
      "Quick setup",
      "Flexible workflows",
      "Integration ready",
      "Affordable pricing",
    ],
  },
  {
    title: "Agencies",
    description: "Manage client projects and deliverables efficiently.",
    icon: Briefcase,
    iconClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
    features: [
      "Client portals",
      "Time tracking",
      "Project templates",
      "Resource allocation",
    ],
  },
  {
    title: "Product Teams",
    description: "Ship better products faster with agile task management.",
    icon: Puzzle,
    iconClass:
      "bg-rose-50 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400",
    features: [
      "Agile boards",
      "Sprint planning",
      "Roadmap views",
      "Release management",
    ],
  },
  {
    title: "Marketing Teams",
    description: "Plan and execute campaigns with precision.",
    icon: Target,
    iconClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400",
    features: [
      "Campaign planning",
      "Content calendar",
      "Asset management",
      "Performance tracking",
    ],
  },
];

const caseStudies = [
  {
    company: "TechCorp Inc.",
    industry: "Technology",
    description: "Increased team productivity by 45% with TaskFlow",
    image: "https://picsum.photos/800/600?random=1",
  },
  {
    company: "Creative Agency Co.",
    industry: "Marketing",
    description: "Streamlined client projects and improved delivery times",
    image: "https://picsum.photos/800/600?random=2",
  },
  {
    company: "Global Solutions Ltd.",
    industry: "Consulting",
    description: "Scaled operations across 12 countries efficiently",
    image: "https://picsum.photos/800/600?random=3",
  },
];
