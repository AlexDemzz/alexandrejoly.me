import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const Portal: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [portalNode, setPortalNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = document.createElement("div");
    document.body.prepend(node);
    setPortalNode(node);

    return () => {
      document.body.removeChild(node);
    };
  }, []);

  return portalNode ? createPortal(children, portalNode) : null;
};

export default Portal;
