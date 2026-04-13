import { TooltipProvider } from "@/components/ui/tooltip";
import React from "react";
import PrivateNavbar from "./components/private-navbar";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <TooltipProvider>
          <PrivateNavbar />
          <div className="grow w-full max-w-6xl mx-auto p-6 bg-white">
            {children}
          </div>
        </TooltipProvider>
      </div>
    </>
  );
}
