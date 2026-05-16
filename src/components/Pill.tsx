import React from "react";

export function Pill({
  tone,
  children,
  dot,
}: {
  tone: string;
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span className={"pill " + tone}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}
