import React from "react";

export default function Badge({ children, className = "", variant = "cyan" }) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1";
  const variants = {
    cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
  };
  const cls = `${base} ${variants[variant] || variants.cyan} ${className}`.trim();
  return <span className={cls}>{children}</span>;
}
