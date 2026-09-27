import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)


def send_otp_email(to_email: str, otp_code: str, purpose: str = "Admin Login Verification") -> bool:
    """
    Sends a 6-digit OTP code to the recipient email.
    If SMTP credentials are provided, sends a real HTML email.
    Always logs to stdout for development visibility.
    """
    subject = f"🔐 Botock Security Code: {otp_code} ({purpose})"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Botock Verification Code</title>
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0e; color: #f1f5f9; padding: 24px; margin: 0; }}
        .container {{ max-width: 520px; margin: 0 auto; background: #121217; border: 1px solid #26262e; border-radius: 20px; padding: 36px 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }}
        .logo {{ font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-align: center; margin-bottom: 24px; }}
        .logo span {{ color: #6366f1; }}
        .title {{ font-size: 20px; font-weight: 700; color: #f8fafc; text-align: center; margin-bottom: 8px; }}
        .subtitle {{ font-size: 14px; color: #94a3b8; text-align: center; margin-bottom: 30px; line-height: 1.5; }}
        .otp-box {{ background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15)); border: 2px dashed #6366f1; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 28px; }}
        .otp-code {{ font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #a5b4fc; text-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }}
        .warning {{ background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #fca5a5; margin-bottom: 24px; line-height: 1.4; }}
        .footer {{ text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e1e26; padding-top: 20px; margin-top: 20px; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">BOTOCK<span>.AI</span></div>
        <div class="title">{purpose}</div>
        <div class="subtitle">Use the verification code below to authorize your session. This code is strictly confidential.</div>
        
        <div class="otp-box">
          <div class="otp-code">{otp_code}</div>
        </div>
        
        <div class="warning">
          <strong>Security Notice:</strong> This code expires in <strong>10 minutes</strong> and is valid for a maximum of <strong>3 attempts</strong>. Never share this code with anyone.
        </div>
        
        <div class="footer">
          Sent by Botock Platform Security Engine • Automated Message
        </div>
      </div>
    </body>
    </html>
    """
    
    text_content = f"Botock Security Code for {purpose}: {otp_code}\nExpires in 10 minutes (3 attempts max). Do not share."

    # Dev/Terminal visibility
    logger.info("=" * 60)
    logger.info(f"📧 [EMAIL OTP DISPATCH] To: {to_email} | Purpose: {purpose}")
    logger.info(f"🔑 OTP CODE: >>> {otp_code} <<< (Valid for 10 minutes)")
    logger.info("=" * 60)

    # If SMTP is configured, attempt sending real email
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
            msg["To"] = to_email

            msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(msg["From"], [to_email], msg.as_string())
                logger.info(f"✅ Real email successfully sent via SMTP to {to_email}")
                return True
        except Exception as e:
            logger.warning(f"⚠️ SMTP send failed ({e}). Fallback logged to terminal.")
            return True

    return True
