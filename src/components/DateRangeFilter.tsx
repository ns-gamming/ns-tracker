import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface DateRangeFilterProps {
  onDateChange: (startDate: Date | undefined, endDate: Date | undefined) => void;
}

export const DateRangeFilter = ({ onDateChange }: DateRangeFilterProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    onDateChange(date, endDate);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    onDateChange(startDate, date);
  };

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    onDateChange(undefined, undefined);
  };

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start);
    setEndDate(end);
    onDateChange(start, end);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center animate-fade-in">
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              {startDate ? format(startDate, "MMM dd, yyyy") : "Start Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} initialFocus />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              {endDate ? format(endDate, "MMM dd, yyyy") : "End Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={endDate} onSelect={handleEndDateChange} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => handlePreset(7)}>
          7 Days
        </Button>
        <Button variant="secondary" size="sm" onClick={() => handlePreset(30)}>
          30 Days
        </Button>
        <Button variant="secondary" size="sm" onClick={() => handlePreset(90)}>
          90 Days
        </Button>
        <Button variant="secondary" size="sm" onClick={() => handlePreset(365)}>
          1 Year
        </Button>
      </div>

      {(startDate || endDate) && (
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset
        </Button>
      )}
    </div>
  );
};
