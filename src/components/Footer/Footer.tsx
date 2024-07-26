import { DRIBBBLE_URL, EMAIL, GITHUB_URL, LINKEDIN_URL } from "@/lib/constants";
import Link from "next/link";
import Hi from "./Hi";
import HeartBeat from "./HeartBeat";
import AnimatedLink from "@/components/AnimatedLink";

const Footer = () => {
  return (
    <div className="container py-5">
      <div className="grid grid-cols-8 gap-8 md:gap-0">
        <div className="col-span-8 md:col-span-3">
          <div className="flex items-center gap-1">
            SAY <Hi />
          </div>
          <AnimatedLink href={`mailto:${EMAIL}`}>{EMAIL}</AnimatedLink>
          <div>French developer based in Switzerland.</div>
        </div>
        <div className="col-span-4 md:col-span-2 flex flex-col gap-1">
          <AnimatedLink href={DRIBBBLE_URL} target="_blank">
            Dribbble
          </AnimatedLink>
          <AnimatedLink href={LINKEDIN_URL} target="_blank">
            LinkedIn
          </AnimatedLink>
          <AnimatedLink href={GITHUB_URL} target="_blank">
            Github
          </AnimatedLink>
        </div>
        <div className="col-span-4 md:col-span-3 text-end">
          <span className="inline-flex items-baseline">
            Made with&nbsp;
            <HeartBeat />
            &nbsp; by&nbsp;
            <AnimatedLink href={LINKEDIN_URL} target="_blank">
              Alexandre Joly
            </AnimatedLink>
          </span>
          <div>{new Date().getFullYear()}©</div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
