import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export default function Counter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 80,
  });
  const isDecimal = !Number.isInteger(value);

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (!ref.current) return;
      let display: string;
      if (isDecimal) {
        display = latest.toFixed(1);
      } else if (value >= 10_000) {
        display = new Intl.NumberFormat("en-US", {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(latest);
      } else {
        display = Math.round(latest).toLocaleString("en-US");
      }
      ref.current.textContent = `${display}${suffix}`;
    });
  }, [springValue, suffix, isDecimal, value]);

  return <span ref={ref}>0{suffix}</span>;
}
