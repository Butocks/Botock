import re

def update_file(filename):
    with open(filename, "r") as f:
        content = f.read()

    # Find the hardcoded redirect
    content = content.replace('window.location.href = `${getSiteUrl()}/tools/video-generator`;', 'const params = new URLSearchParams(window.location.search);\n          const nextUrl = params.get("next") || "/";\n          window.location.href = `${getSiteUrl()}${nextUrl === "/" ? "" : nextUrl}`;')

    with open(filename, "w") as f:
        f.write(content)

update_file("frontend/app/login/page.tsx")
update_file("frontend/app/signup/page.tsx")

