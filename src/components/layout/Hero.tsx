"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative bg-white">
      <div className="max-w-7xl mx-auto pt-20 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 lg:pr-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Manage tasks with
            <span className="text-blue-600"> efficiency</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl">
            Streamline your workflow, collaborate seamlessly, and achieve more
            with our intuitive task management platform.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/demo"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Get started free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Learn more
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 mt-10 lg:mt-0">
          <Image
            src="https://picsum.photos/600/400"
            alt="Task Management Platform"
            width={600}
            height={400}
            className="rounded-lg shadow-xl"
            priority
          />
        </div>
      </div>
    </div>
  );
}
