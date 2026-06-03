interface SectionDividerProps {
  variant?: "wave" | "gradient" | "dots" | "curve";
  flip?: boolean;
}

const SectionDivider = ({ variant = "gradient", flip = false }: SectionDividerProps) => {
  if (variant === "wave") {
    return (
      <div className={`relative w-full overflow-hidden ${flip ? "rotate-180" : ""}`}>
        <svg
          className="w-full h-12 md:h-16"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,0 C150,60 350,0 600,50 C850,100 1050,40 1200,80 L1200,120 L0,120 Z"
            className="fill-current text-background"
          />
        </svg>
      </div>
    );
  }

  if (variant === "gradient") {
    return (
      <div className="relative w-full h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className="relative w-full py-8">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/30" />
          <div className="w-2 h-2 rounded-full bg-primary/50" />
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-primary/50" />
          <div className="w-2 h-2 rounded-full bg-primary/30" />
        </div>
      </div>
    );
  }

  if (variant === "curve") {
    return (
      <div className={`relative w-full overflow-hidden ${flip ? "rotate-180" : ""}`}>
        <svg
          className="w-full h-8 md:h-12"
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,60 Q600,0 1200,60 L1200,60 L0,60 Z"
            className="fill-current text-white"
          />
        </svg>
      </div>
    );
  }

  return null;
};

export default SectionDivider;
