import { SpinnerIcon } from "@phosphor-icons/react";

const Loader = () => (
  <div className="flex h-full items-center justify-center pt-8">
    <SpinnerIcon className="animate-spin" />
  </div>
);

export default Loader;
