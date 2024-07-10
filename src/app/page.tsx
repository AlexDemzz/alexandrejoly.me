import Drawer from "@/components/Drawer";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Link href="/projects/a">Project A</Link>
      <Drawer />
    </main>
  );
}
