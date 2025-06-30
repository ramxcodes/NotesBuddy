"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "John Doe",
    image: "https://github.com/shadcn.png",
    text: "This is a testimonial",
  },
  {
    name: "Jane Doe",
    image: "https://github.com/shadcn.png",
    text: "This is a testimonial",
  },
  {
    name: "John Doe",
    image: "https://github.com/shadcn.png",
    text: "This is a testimonial",
  },
];

export default function Hero() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      <div>
        <Badge className="font-ranade border-0 px-4 py-2 text-sm border-b-4 border-gray-500">
          Learn like a Pro!
        </Badge>
      </div>

      <div className="space-y-4 text-center">
        <h1 className="font-satoshi text-center text-4xl leading-tight font-bold text-gray-900 md:text-6xl">
          All Your Study <br /> with{" "}
          <span className="font-ranade font-medium tracking-tighter">Notes Buddy</span>
        </h1>
        <p className="font-ranade mx-auto max-w-2xl text-center text-lg text-gray-600 md:text-xl">
          Get your notes, one-shots, PYQs, Quizzes and more.
        </p>
      </div>
      {/* Testimonials Section */}
      <div className="flex items-center space-x-4">
        <div className="flex">
          {testimonials.map((testimonial, idx) => (
            <Avatar
              key={testimonial.name + idx}
              className={`h-10 w-10 border-3 border-white transition-all duration-200 ${
                idx !== 0 ? "-ml-3" : ""
              } shadow-lg`}
              style={{ zIndex: testimonials.length - idx }}
            >
              <AvatarImage src={testimonial.image || "/placeholder.svg"} />
              <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="flex items-center justify-center">
          <p className="font-excon font-medium text-gray-700">
            Trusted by 1,700+ students!
          </p>
        </div>
      </div>
      <div>
      </div>
    </div>
  );
}
