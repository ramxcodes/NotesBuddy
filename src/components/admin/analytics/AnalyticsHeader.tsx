"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { TimeRange, CustomDateRange } from "@/types/umami";

interface AnalyticsHeaderProps {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  customRange?: CustomDateRange;
  setCustomRange: (range: CustomDateRange | undefined) => void;
}

export function AnalyticsHeader({
  timeRange,
  setTimeRange,
  customRange,
  setCustomRange,
}: AnalyticsHeaderProps) {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>();

  const handleTimeRangeChange = (value: string) => {
    const range = value as TimeRange;
    setTimeRange(range);
    if (range !== "custom") {
      setCustomRange(undefined);
    }
  };

  const handleCustomDateApply = () => {
    if (selectedDates?.from && selectedDates?.to) {
      setCustomRange({
        startDate: selectedDates.from,
        endDate: selectedDates.to,
      });
      setTimeRange("custom");
      setIsCustomOpen(false);
    }
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "24h":
        return "Last 24 Hours";
      case "7d":
        return "Last 7 Days";
      case "15d":
        return "Last 15 Days";
      case "30d":
        return "Last 30 Days";
      case "custom":
        if (customRange) {
          return `${customRange.startDate.toLocaleDateString()} - ${customRange.endDate.toLocaleDateString()}`;
        }
        return "Custom Range";
      default:
        return "Last 30 Days";
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-md border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] sm:flex-row sm:items-center sm:justify-between dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-xl font-black text-black dark:text-white">
          <Clock className="h-5 w-5" />
          Time Range
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {getTimeRangeLabel()}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-48 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="15d">Last 15 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {timeRange === "custom" && (
          <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] hover:bg-gray-50 dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:bg-zinc-700"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Select Dates
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto border-2 border-black bg-white p-0 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
              <div className="space-y-4 p-4">
                <CalendarComponent
                  mode="range"
                  selected={selectedDates}
                  onSelect={setSelectedDates}
                  numberOfMonths={2}
                  className="rounded-md"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCustomOpen(false)}
                    className="border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCustomDateApply}
                    disabled={!selectedDates?.from || !selectedDates?.to}
                    className="border-2 border-black bg-black text-white shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#757373]"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
