"use client";

import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">
      {/* Left side - Auth Form */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 px-4">{children}</div>
      </div>

      {/* Right side - Image and Branding */}
      <div className="hidden lg:flex flex-1 bg-blue-600 dark:bg-blue-800">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-800/90 dark:from-blue-900/90 dark:to-blue-950/90 z-10" />
          <Image
            src="https://picsum.photos/1000/1000?random=1"
            alt="Office workspace"
            fill
            className="object-cover"
          />
          <div className="relative z-20 flex flex-col justify-center h-full px-12 text-white">
            <h2 className="text-4xl font-bold mb-6">Welcome to TaskFlow</h2>
            <p className="text-xl text-blue-100">
              Streamline your workflow and boost productivity with our powerful
              task management platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
