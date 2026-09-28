with open("app/routers/auth_otp.py", "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'raise HTTPException(status_code=400, detail="Too many failed attempts. Code invalidated.")' in lines[i-1]:
        # Around line 760, it's forgot password actually it says "Too many failed attempts. Code invalidated." Wait...
        pass

