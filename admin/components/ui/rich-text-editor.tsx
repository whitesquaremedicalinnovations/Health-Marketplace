"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { cn } from "../../lib/utils";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { 
  ssr: false,
  loading: () => <div className="h-32 bg-muted animate-pulse rounded-md" />
});

// Import Quill styles
import "react-quill/dist/quill.snow.css";

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
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["link", "image"],
          ["clean"],
        ],
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "indent",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "border rounded-md overflow-hidden",
          disabled && "opacity-50 pointer-events-none"
        )}
        style={{
          "--quill-editor-height": height,
        } as React.CSSProperties}
      >
        <style jsx>{`
          :global(.ql-container) {
            height: var(--quill-editor-height);
            font-family: inherit;
          }
          :global(.ql-editor) {
            min-height: calc(var(--quill-editor-height) - 42px);
            font-size: 14px;
            line-height: 1.5;
          }
          :global(.ql-toolbar) {
            border-bottom: 1px solid hsl(var(--border));
            background: hsl(var(--background));
          }
          :global(.ql-container) {
            border: none;
            font-family: inherit;
          }
          :global(.ql-editor.ql-blank::before) {
            color: hsl(var(--muted-foreground));
            font-style: normal;
          }
          :global(.ql-snow .ql-picker.ql-expanded .ql-picker-label) {
            border-color: hsl(var(--primary));
          }
          :global(.ql-snow .ql-picker.ql-expanded .ql-picker-options) {
            background: hsl(var(--background));
            border: 1px solid hsl(var(--border));
            border-radius: 6px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
          :global(.ql-snow .ql-tooltip) {
            background: hsl(var(--background));
            border: 1px solid hsl(var(--border));
            border-radius: 6px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
          :global(.ql-snow .ql-tooltip input[type=text]) {
            background: hsl(var(--background));
            border: 1px solid hsl(var(--input));
            color: hsl(var(--foreground));
            border-radius: 4px;
          }
          :global(.ql-snow .ql-tooltip a.ql-action::after) {
            color: hsl(var(--primary));
          }
          :global(.ql-snow .ql-tooltip a.ql-remove::before) {
            color: hsl(var(--destructive));
          }
        `}</style>
        <ReactQuill
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          theme="snow"
        />
      </div>
    </div>
  );
};