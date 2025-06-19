import React, { useEffect, useRef, useState } from "react";

type CounterCardProps = {
  title: string;
  count: number;
  icon?: React.ReactNode;
};

const CounterCard: React.FC<CounterCardProps> = ({ title, count, icon }) => {
  const [displayCount, setDisplayCount] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Clean up any previous interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    let start = 0;
    const duration = 800; // ms
    const steps = 30;
    const increment = (count - start) / steps;
    let current = start;
    let step = 0;

    intervalRef.current = window.setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayCount(count);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setDisplayCount(Math.round(current));
      }
    }, duration / steps);

    // If count changes, reset
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [count]);

  return (
    <div style={{background:"darkseagreen"}} className=" shadow-lg rounded-xl p-5 flex items-center gap-4">
      <div className="text-6xl text-blue-600">{icon}</div>
      <div>
        <h4 className="text-dark text-xl font-semibold">{title}</h4>
        <p className="text-2xl font-bold">{displayCount}</p>
      </div>
    </div>
  );
};

export default CounterCard;
