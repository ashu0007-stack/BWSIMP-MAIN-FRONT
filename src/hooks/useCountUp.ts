import { useEffect, useState } from "react";

export const useCountUp = (
  end: number,
  duration: number = 2000 // ⬅️ increase duration (2 seconds)
) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!end) return;

    let start = 0;
    const totalFrames = duration / 16; // ~60fps
    const increment = end / totalFrames;

    const timer = setInterval(() => {
      start += increment;

      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return count;
};
