import { DRIBBBLE_URL, EMAIL, GITHUB_URL, LINKEDIN_URL } from "@/lib/constants";
import Link from "next/link";
import Hi from "./Hi";
import HeartBeat from "./HeartBeat";

const Footer = () => {
  return (
    <div className="container py-5">
      <div className="grid grid-cols-8 gap-8 md:gap-0">
        <div className="col-span-8 md:col-span-3">
          <div className="flex items-center gap-1">
            SAY <Hi />
          </div>
          <Link href={`mailto:${EMAIL}`}>{EMAIL}</Link>
          <div>French developer based in Switzerland.</div>
        </div>
        <div className="col-span-4 md:col-span-2 flex flex-col gap-1">
          <Link href={DRIBBBLE_URL}>Dribble</Link>
          <Link href={LINKEDIN_URL}>LinkedIn</Link>
          <Link href={GITHUB_URL}>Github</Link>
        </div>
        <div className="col-span-4 md:col-span-3 text-end">
          <Link href={LINKEDIN_URL}>
            Made with <HeartBeat /> by Alexandre Joly
          </Link>
          <div>{new Date().getFullYear()}©</div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
