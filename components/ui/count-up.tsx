"use client";

import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

export function CountUp({
  value,
  duration = 1,
  formatter = (v: number) => Math.round(v).toString(),
}: {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        if (ref.current) ref.current.textContent = formatter(latest);
      },
    });
    return () => controls.stop();
  }, [value, duration, formatter]);

  return <span ref={ref}>{formatter(0)}</span>;
}
