"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  height?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  disabled = false,
  className,
  height = "300px"
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "border rounded-md overflow-hidden",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style={{ height }}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        Use plain text for now. Rich text editing will be available soon.
      </div>
    </div>
  );
};