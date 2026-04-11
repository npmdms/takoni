import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="grow w-full max-w-xl mx-auto p-6 bg-white">{children}</div>
      </div>
    </>
  );
}
