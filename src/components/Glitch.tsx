import React from "react";
import { useSpring, animated } from "@react-spring/web";
import "tailwindcss/tailwind.css"; // Assurez-vous d'avoir généré le fichier CSS de Tailwind

const Glitch = ({ children }) => {
  const glitchStyles = useSpring({
    loop: true,
    to: [
      {
        textShadow: "2px -3px 0 red, -2px 3px 0 blue",
        transform: "translate(8px, 0)",
      },
      { textShadow: "none", transform: "none" },
    ],
    from: {
      textShadow: "-2px 3px 0 red, 2px -3px 0 blue",
      transform: "translate(-8px, 0)",
    },
    config: { duration: 2000 },
  });

  return (
    <div className="relative inline-block font-bold text-4xl text-white">
      <animated.span style={glitchStyles} className="relative">
        {children}
      </animated.span>
      <span className="absolute top-0 left-0 text-white pointer-events-none opacity-80 animate-glitch">
        {children}
      </span>
      <style jsx>{`
        @keyframes glitch {
          0% {
            clip-path: inset(0 0 0 0);
            transform: translate(0);
          }
          2% {
            clip-path: inset(50% 0 0 0);
            transform: translate(10px, -10px);
          }
          4%,
          100% {
            clip-path: inset(0 0 0 0);
            transform: translate(0);
          }
        }
        .animate-glitch {
          animation: glitch 2s infinite alternate-reverse;
        }
      `}</style>
    </div>
  );
};

export default Glitch;
