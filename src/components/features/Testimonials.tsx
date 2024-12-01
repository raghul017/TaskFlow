"use client";

import Image from "next/image";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Thompson",
    role: "Product Manager",
    company: "Tech Solutions Inc.",
    image: "https://picsum.photos/100/100?random=7",
    content:
      "This platform has transformed how our team manages tasks. The intuitive interface and powerful features have significantly improved our productivity.",
  },
  {
    name: "Michael Chen",
    role: "Engineering Lead",
    company: "Innovation Labs",
    image: "https://picsum.photos/100/100?random=8",
    content:
      "The collaboration features are outstanding. We've seen a 40% increase in project completion rates since implementing this solution.",
  },
  {
    name: "Emily Rodriguez",
    role: "Operations Director",
    company: "Global Enterprises",
    image: "https://picsum.photos/100/100?random=9",
    content:
      "The best task management platform we've used. The customer support is exceptional, and the platform keeps getting better with regular updates.",
  },
];

export default function Testimonials() {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Trusted by teams worldwide
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            See what our customers have to say about their experience
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-gray-50 p-6 rounded-lg shadow-sm"
            >
              <div className="flex space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6">{testimonial.content}</p>
              <div className="flex items-center space-x-3">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <h4 className="font-medium text-gray-900">
                    {testimonial.name}
                  </h4>
                  <div className="text-sm text-gray-500">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
