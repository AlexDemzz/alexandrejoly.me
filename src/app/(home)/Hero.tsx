import Glitch from "@/components/Glitch";
import MainBlob from "@/components/MainBlob";
import TagIndicator from "@/components/TagIndicator";
import Trail from "@/components/Trail";
import { useApp } from "@/lib/hooks";
import { animated, useSpring } from "@react-spring/web";

const Hero = () => {
  const [{ glassesMode }, setState] = useApp();

  const animationProps = useSpring({
    transform: glassesMode ? "scale(0.7)" : "scale(1)",
    opacity: glassesMode ? 0.3 : 1,
  });

  return (
    <div
      className="container pb-32"
      onClick={() => setState((o) => ({ ...o, glassesMode: !o.glassesMode }))}
      onMouseEnter={() =>
        setState((o) => ({ ...o, canEnabledGlassesMode: true }))
      }
      onMouseLeave={() =>
        setState((o) => ({ ...o, canEnabledGlassesMode: false }))
      }
    >
      <div className="w-full h-[100vh] flex items-center justify-center ml-auto absolute top-0 left-0 right-0 z-10">
        <TagIndicator tag="cursor" position="top" className="">
          <MainBlob />
        </TagIndicator>
      </div>
      <animated.div
        className={`mt-28 mb-10 relative ${glassesMode ? "z-0" : "z-20"}`}
        style={animationProps}
      >
        <h1 className="grid grid-cols-8">
          <TagIndicator
            tag="h1"
            position="top"
            className="col-span-7 col-start-2"
            delay={100}
          >
            <Trail
              className="text-[200px] font-black tracking-tighter leading-none select-none"
              delay={200}
            >
              Creative
            </Trail>
          </TagIndicator>
          <div className="relative col-start-3 col-span-8">
            <Trail
              className="text-[200px] font-black tracking-tighter leading-none select-none"
              delay={400}
            >
              Developer
            </Trail>
          </div>
        </h1>
        <div className="grid grid-cols-8 mt-20">
          <TagIndicator
            tag="p"
            position="top"
            className="col-span-3 col-start-2"
            delay={500}
          >
            <Trail className="text-2xl font-medium select-none" delay={600}>
              I’m a front-end developer and UI/UX designer, I transform ideas
              into dynamic digital experiences. My mission is to create
              stunning, intuitive, and engaging interfaces that meet today's
              needs and adapt to tomorrow's challenges.
            </Trail>
          </TagIndicator>
        </div>
      </animated.div>
    </div>
  );
};

export default Hero;
