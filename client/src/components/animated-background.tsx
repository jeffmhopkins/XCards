import { useEffect, useState } from 'react';

interface Circle {
  id: number;
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
}

export function AnimatedBackground() {
  const [circles, setCircles] = useState<Circle[]>([]);

  useEffect(() => {
    const generateCircles = () => {
      const newCircles: Circle[] = [];
      const colors = ['bg-cyan-500', 'bg-purple-600', 'bg-magenta-neon'];
      
      for (let i = 0; i < 6; i++) {
        newCircles.push({
          id: i,
          size: Math.random() * 80 + 40, // 40-120 size (more variation)
          color: colors[Math.floor(Math.random() * colors.length)],
          initialX: Math.random() * 100,
          initialY: Math.random() * 100,
          duration: Math.random() * 40 + 30, // 30-70 seconds (much slower)
          delay: Math.random() * 15, // 0-15 second delay
        });
      }
      setCircles(newCircles);
    };

    generateCircles();
  }, []);

  return (
    <div className="fixed inset-0 opacity-20 pointer-events-none overflow-hidden">
      {circles.map((circle) => (
        <div
          key={circle.id}
          className={`absolute ${circle.color} rounded-full blur-3xl`}
          style={{
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            left: `${circle.initialX}%`,
            top: `${circle.initialY}%`,
            animation: `floatRandom${circle.id} ${circle.duration}s ease-in-out infinite`,
            animationDelay: `${circle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}