"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select specializations...",
  className,
}: MultiSelectProps) {
  const [currentSelection, setCurrentSelection] = React.useState<string>("");

  const handleAdd = (value: string) => {
    if (value && !selected.includes(value)) {
      onChange([...selected, value]);
      setCurrentSelection("");
    }
  };

  const handleRemove = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  const availableOptions = options.filter(option => !selected.includes(option.value));

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected items */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((item) => (
            <Badge
              variant="secondary"
              key={item}
              className="flex items-center gap-1"
            >
              {options.find((option) => option.value === item)?.label}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Add new item */}
      <Select value={currentSelection} onValueChange={handleAdd}>
        <SelectTrigger className="h-12">
          <SelectValue placeholder={selected.length === 0 ? placeholder : "Add more specializations..."} />
        </SelectTrigger>
        <SelectContent>
          {availableOptions.length === 0 ? (
            <SelectItem value="" disabled>
              All specializations selected
            </SelectItem>
          ) : (
            availableOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
} 