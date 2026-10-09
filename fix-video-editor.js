const fs = require('fs');

let code = fs.readFileSync('frontend/app/tools/video-editor/VideoEditorComponent.tsx', 'utf8');

// Find the start of the orphaned code (around line 65) up to the useEffect
// Basically we want to remove the orphaned code block:
//       if (t) {
//       if (t.toLowerCase() === "aspect") return "Crop";
//       const match = SIDEBAR_ITEMS_IDS.find(id => id.toLowerCase() === t.toLowerCase());
//       if (match) return match;
//     }
//     return "Edit";
//   });
// 
//   useEffect(() => {
//     const t = searchParams.get("tool");
//     if (t) {
//       if (t.toLowerCase() === "aspect" && activeTab !== "Crop") {
//         setActiveTab("Crop");
//       } else {
//         const match = SIDEBAR_ITEMS_IDS.find(id => id.toLowerCase() === t.toLowerCase());
//         if (match && match !== activeTab) {
//           setActiveTab(match);
//         }
//       }
//     }
//   }, [searchParams, activeTab]);

// Let's just use regex to remove from `if (t) {` down to `}, [searchParams, activeTab]);`

code = code.replace(/      if \(t\) \{[\s\S]*?\}, \[searchParams, activeTab\]\);/g, '');

fs.writeFileSync('frontend/app/tools/video-editor/VideoEditorComponent.tsx', code);
