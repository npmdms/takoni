import React from "react";
import PublicNavbar from "./components/public-navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <PublicNavbar />
        <div className="grow">{children}</div>
      </div>
    </>
  );
}
