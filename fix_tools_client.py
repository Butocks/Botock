with open('frontend/app/tools/ToolsDirectoryClient.tsx', 'r') as f:
    content = f.read()

# Add imports
content = content.replace('import { useState } from "react";', 'import { useState, useEffect, Suspense } from "react";\nimport { useSearchParams } from "next/navigation";')

# Rename the component
content = content.replace('export default function ToolsDirectoryClient() {', 'function ToolsDirectoryInner() {')

# Add the search params logic
# Find: const [activeCategory, setActiveCategory] = useState("All");
import re
new_state = """
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat");
  
  // Map "cat" param to actual categories if needed
  const categoryMap: Record<string, string> = {
    video: "Video & Audio",
    ai: "Generative AI",
    pdf: "PDF Tools",
    image: "Image Tools"
  };
  
  const defaultCategory = initialCat && categoryMap[initialCat] ? categoryMap[initialCat] : "All";
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  
  useEffect(() => {
    if (initialCat && categoryMap[initialCat]) {
      setActiveCategory(categoryMap[initialCat]);
    }
  }, [initialCat]);
"""

content = re.sub(r'const \[activeCategory, setActiveCategory\] = useState\("All"\);', new_state.strip(), content)

# Add the wrapper at the bottom
wrapper = """
export default function ToolsDirectoryClient() {
  return (
    <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center text-slate-500">Loading tools directory...</div>}>
      <ToolsDirectoryInner />
    </Suspense>
  );
}
"""
content += "\n" + wrapper

with open('frontend/app/tools/ToolsDirectoryClient.tsx', 'w') as f:
    f.write(content)
