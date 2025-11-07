import React from "react";

export function Card({ className = "", children, as: Tag = "article" }) {
  return (
    <Tag className={`rounded-xl border bg-white shadow-sm ${className}`.trim()}>
      {children}
    </Tag>
  );
}

export function CardContent({ className = "", children }) {
  return <div className={`p-4 ${className}`.trim()}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return (
    <h3 className={`font-semibold text-gray-900 ${className}`.trim()}>{children}</h3>
  );
}
