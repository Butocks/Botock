import re

with open("frontend/app/blog/page.tsx", "r") as f:
    content = f.read()

# Replace hardcoded colors with tailwind classes
content = content.replace('categoryColor: "amber"', 'categoryColor: "bg-amber-500/20 text-amber-500 dark:text-amber-300 border-amber-500/30"')
content = content.replace('categoryColor: "blue"', 'categoryColor: "bg-blue-500/20 text-blue-500 dark:text-blue-300 border-blue-500/30"')
content = content.replace('categoryColor: "emerald"', 'categoryColor: "bg-emerald-500/20 text-emerald-500 dark:text-emerald-300 border-emerald-500/30"')
content = content.replace('categoryColor: "purple"', 'categoryColor: "bg-purple-500/20 text-purple-500 dark:text-purple-300 border-purple-500/30"')
content = content.replace('categoryColor: "red"', 'categoryColor: "bg-red-500/20 text-red-500 dark:text-red-300 border-red-500/30"')

with open("frontend/app/blog/page.tsx", "w") as f:
    f.write(content)
