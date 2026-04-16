"use client";

import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
}

export default function WidgetLayout({ children }: Props) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `${window.location.origin}/borneo-sentra-digital/alex/widget.js`;
    script.async = true;
    script.dataset.takoniPreview = "true";

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <>{children}</>;
}
