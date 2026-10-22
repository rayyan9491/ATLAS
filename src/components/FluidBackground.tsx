import { useEffect, useRef } from "react";
import { fluidSimulation } from "./fluidSimulation";

export default function FluidBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const destroy: any = fluidSimulation(canvas); // engine returns destroy()
    return () => {
      if (typeof destroy === "function") destroy();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="fs-canvas" />;
}
