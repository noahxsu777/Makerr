import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

export default function AnimatedNumber({
  value,
  decimals = 2,
}: {
  value: number;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, { damping: 22, stiffness: 140 });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (!ref.current) return;
      ref.current.textContent = latest.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    });
  }, [springValue, decimals]);

  return (
    <span ref={ref}>
      {value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}
