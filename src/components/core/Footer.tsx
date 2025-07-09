import React from "react";

export default function Footer() {
  return (
    <footer className="bg-background/50 dark:bg-background/50 mt-10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
              Notes Buddy
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Notes Buddy is a platform for students to find and share notes.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
