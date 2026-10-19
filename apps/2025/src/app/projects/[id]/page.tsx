import useProjects from "@/lib/hooks/useProjects";
import Project from "./Project";

export const dynamicParams = false;

export function generateStaticParams() {
  return useProjects().map(({ id }) => ({ id }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <Project params={params} />;
}
