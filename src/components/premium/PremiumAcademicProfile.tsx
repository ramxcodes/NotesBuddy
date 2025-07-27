"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserIcon,
  GraduationCapIcon,
  BookOpenIcon,
  CalendarIcon,
  StarIcon,
} from "@phosphor-icons/react";
import {
  UNIVERSITY_OPTIONS,
  DEGREE_OPTIONS,
  YEAR_OPTIONS,
  SEMESTER_OPTIONS,
} from "@/utils/constant";

interface PremiumAcademicProfileProps {
  userProfile: {
    university: string;
    degree: string;
    year: string;
    semester: string;
  };
}

export function PremiumAcademicProfile({
  userProfile,
}: PremiumAcademicProfileProps) {
  // Format academic details for display
  const academicDetails = {
    university:
      UNIVERSITY_OPTIONS[
        userProfile.university as keyof typeof UNIVERSITY_OPTIONS
      ]?.title || userProfile.university,
    degree:
      DEGREE_OPTIONS[userProfile.degree as keyof typeof DEGREE_OPTIONS]
        ?.title || userProfile.degree,
    year:
      YEAR_OPTIONS[userProfile.year as keyof typeof YEAR_OPTIONS]?.title ||
      userProfile.year,
    semester:
      SEMESTER_OPTIONS[userProfile.semester as keyof typeof SEMESTER_OPTIONS]
        ?.title || userProfile.semester,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <Card className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <UserIcon className="h-5 w-5 text-black dark:text-white" />
            <span className="font-excon text-xl font-black text-black dark:text-white">
              Academic Profile
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <GraduationCapIcon className="h-4 w-4 text-black dark:text-white" />
              <div>
                <span className="font-satoshi font-bold text-black dark:text-white">
                  University:
                </span>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  {academicDetails.university}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpenIcon className="h-4 w-4 text-black dark:text-white" />
              <div>
                <span className="font-satoshi font-bold text-black dark:text-white">
                  Degree:
                </span>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  {academicDetails.degree}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-black dark:text-white" />
              <div>
                <span className="font-satoshi font-bold text-black dark:text-white">
                  Year:
                </span>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  {academicDetails.year}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StarIcon className="h-4 w-4 text-black dark:text-white" />
              <div>
                <span className="font-satoshi font-bold text-black dark:text-white">
                  Semester:
                </span>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  {academicDetails.semester}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
