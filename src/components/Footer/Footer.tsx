import { DRIBBBLE_URL, EMAIL, GITHUB_URL, LINKEDIN_URL } from "@/lib/constants";
import Link from "next/link";
import Hi from "./Hi";
import HeartBeat from "./HeartBeat";
import AnimatedLink from "@/components/AnimatedLink";

const Footer = () => {
  return (
    <div className="container py-5">
      {/* <div className="gap-4 grid grid-cols-1 md:grid-cols-8 md:gap-0">
        <div className="md:col-span-3 space-y-1">
          <div className="flex items-center gap-1">
            SAY <Hi />
          </div>
          <AnimatedLink href={`mailto:${EMAIL}`} className="font-semibold">
            {EMAIL}
          </AnimatedLink>
          <div className="">French developer based in Geneva.</div>
        </div>
        <div className="md:col-span-2 flex flex-col gap-1">
          <AnimatedLink
            href={DRIBBBLE_URL}
            target="_blank"
            className="font-semibold"
          >
            Dribbble
          </AnimatedLink>
          <AnimatedLink
            href={LINKEDIN_URL}
            target="_blank"
            className="font-semibold"
          >
            LinkedIn
          </AnimatedLink>
          <AnimatedLink
            href={GITHUB_URL}
            target="_blank"
            className="font-semibold"
          >
            Github
          </AnimatedLink>
        </div>
        <div className="md:col-span-3 md:text-end space-y-1">
          <span className="inline-flex items-baseline">
            Made with&nbsp;
            <HeartBeat />
            &nbsp; by&nbsp;
            <AnimatedLink
              href={LINKEDIN_URL}
              target="_blank"
              className="font-semibold"
            >
              Alexandre Joly
            </AnimatedLink>
          </span>
          <div>{new Date().getFullYear()} ©</div>
        </div>
      </div> */}
    </div>
  );
};

export default Footer;
