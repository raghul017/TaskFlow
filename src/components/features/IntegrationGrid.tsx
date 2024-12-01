"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

const integrations = [
  {
    name: "Slack",
    description: "Real-time messaging and notifications",
    image: "https://picsum.photos/100/100?random=1",
  },
  {
    name: "GitHub",
    description: "Code repository integration",
    image: "https://picsum.photos/100/100?random=2",
  },
  {
    name: "Google Drive",
    description: "File storage and sharing",
    image: "https://picsum.photos/100/100?random=3",
  },
  {
    name: "Zoom",
    description: "Video conferencing integration",
    image: "https://picsum.photos/100/100?random=4",
  },
  {
    name: "Jira",
    description: "Project tracking and management",
    image: "https://picsum.photos/100/100?random=5",
  },
  {
    name: "Dropbox",
    description: "Cloud storage solution",
    image: "https://picsum.photos/100/100?random=6",
  },
];

export default function IntegrationGrid() {
  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Integrate with your favorite tools
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Connect with the tools you already use and love
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="relative bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Image
                    src={integration.image}
                    alt={integration.name}
                    width={48}
                    height={48}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {integration.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {integration.description}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            View all integrations
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
