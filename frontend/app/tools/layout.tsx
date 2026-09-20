export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="tools-suite-container w-full min-h-screen">
      {children}
    </div>
  );
}
