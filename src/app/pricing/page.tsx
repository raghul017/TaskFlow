"use client";

import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Choose the plan that best fits your needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {/* Free Plan */}
          <div className="relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Free
            </h3>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex-grow">
              Perfect for getting started
            </p>
            <div className="mt-6">
              <p className="flex items-baseline">
                <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                  $0
                </span>
                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                  /month
                </span>
              </p>
            </div>
            <ul className="mt-6 space-y-4">
              {[
                "5 projects",
                "Basic task management",
                "2 team members",
                "1GB storage",
                "Community support",
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <button className="mt-8 block w-full rounded-lg bg-gray-50 dark:bg-gray-700 px-6 py-3 text-center text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="relative flex flex-col rounded-2xl border-2 border-blue-500 dark:border-blue-400 bg-white dark:bg-gray-800 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="absolute -top-4 right-8 inline-flex items-center rounded-full bg-blue-500 px-4 py-1 text-sm font-semibold text-white">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Pro
            </h3>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex-grow">
              Perfect for growing teams
            </p>
            <div className="mt-6">
              <p className="flex items-baseline">
                <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                  $29
                </span>
                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                  /month
                </span>
              </p>
            </div>
            <ul className="mt-6 space-y-4">
              {[
                "Unlimited projects",
                "Advanced task management",
                "Up to 10 team members",
                "10GB storage",
                "Priority support",
                "Custom workflows",
                "Advanced analytics",
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <button className="mt-8 block w-full rounded-lg bg-blue-500 px-6 py-3 text-center text-sm font-medium text-white hover:bg-blue-600 transition-colors">
              Start Free Trial
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Enterprise
            </h3>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex-grow">
              For large organizations
            </p>
            <div className="mt-6">
              <p className="flex items-baseline">
                <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Custom
                </span>
              </p>
            </div>
            <ul className="mt-6 space-y-4">
              {[
                "Everything in Pro",
                "Unlimited team members",
                "Unlimited storage",
                "24/7 priority support",
                "Custom integrations",
                "Advanced security",
                "API access",
                "Dedicated account manager",
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <button className="mt-8 block w-full rounded-lg bg-gray-900 dark:bg-gray-600 px-6 py-3 text-center text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Frequently asked questions
          </h2>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const faqs = [
  {
    question: "How does the free trial work?",
    answer:
      "You can try our Pro plan free for 14 days. No credit card required.",
  },
  {
    question: "Can I change plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards and PayPal.",
  },
  {
    question: "Is there a long-term contract?",
    answer:
      "No, all our plans are month-to-month with no long-term commitment.",
  },
];
