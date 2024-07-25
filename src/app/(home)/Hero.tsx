import MainBlob from "@/components/MainBlob";
import TagIndicator from "@/components/TagIndicator";
import Trail from "@/components/Trail";
import { INTRO } from "@/lib/constants";
import { useApp } from "@/lib/hooks";
import { motion, useSpring } from "framer-motion";
import { useEffect } from "react";

const Hero = () => {
  const [{ glassesMode }, setState] = useApp();

  const scale = useSpring(1);
  const opacity = useSpring(1);

  useEffect(() => {
    scale.set(glassesMode ? 0.7 : 1);
    opacity.set(glassesMode ? 0.3 : 1);
  }, [glassesMode, scale, opacity]);

  return (
    <div
      className="container h-[100vh] min-h-[700px] flex flex-col justify-center py-32 relative"
      onClick={() => {
        setState((o) => ({ ...o, glassesMode: !o.glassesMode }));
      }}
      onMouseEnter={(e) => {
        setState((o) => ({ ...o, canEnabledGlassesMode: true }));
      }}
      onMouseLeave={(e) => {
        setState((o) => ({ ...o, canEnabledGlassesMode: false }));
      }}
    >
      <div className="w-full flex items-center justify-center ml-auto absolute top-0 left-0 right-0 left-0 bottom-0 z-10">
        <MainBlob />
      </div>
      <motion.div
        className={`pt-28 md:pb-10 relative ${glassesMode ? "z-0" : "z-20"}`}
        style={{ scale, opacity }}
      >
        <h1 className="grid grid-cols-1 md:grid-cols-8">
          <TagIndicator
            tag="h1"
            position="top"
            className="md:col-span-7 md:col-start-2"
            delay={100}
          >
            <Trail
              className="text-7xl md:text-[12vw] 2xl:text-[200px] font-black tracking-tighter leading-none select-none"
              delay={200}
            >
              Creative
            </Trail>
          </TagIndicator>
          <div className="relative md:col-start-3 md:col-span-8">
            <Trail
              className="text-7xl md:text-[12vw] 2xl:text-[200px] font-black tracking-tighter leading-none select-none"
              delay={400}
            >
              Developer
            </Trail>
          </div>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-8 mt-20">
          <TagIndicator
            tag="p"
            position="top"
            className="md:col-span-3 md:col-start-2"
            delay={500}
          >
            <Trail
              className="text-xl md:text-2xl font-medium select-none"
              delay={600}
            >
              {INTRO}
            </Trail>
          </TagIndicator>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
