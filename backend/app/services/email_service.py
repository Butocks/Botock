import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)


def _get_smtp_server():
    """Establishes an authenticated SMTP connection based on port and SSL/TLS configuration."""
    host = settings.SMTP_HOST or "smtppro.zoho.com"
    port = settings.SMTP_PORT or 587
    user = settings.SMTP_USER or "info@botock.app"
    password = settings.SMTP_PASSWORD.strip() if settings.SMTP_PASSWORD else ""

    if not password:
        raise ValueError("SMTP_PASSWORD is not configured in environment.")

    # Port 465 uses direct SSL
    if port == 465 or getattr(settings, "SMTP_USE_SSL", False):
        server = smtplib.SMTP_SSL(host, port, timeout=15)
        server.ehlo()
        server.login(user, password)
        return server
    else:
        # Port 587 uses STARTTLS
        server = smtplib.SMTP(host, port, timeout=15)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(user, password)
        return server


def send_otp_email(to_email: str, otp_code: str, purpose: str = "Admin Login Verification") -> bool:
    """
    Sends a 6-digit OTP code to the recipient email via Zoho SMTP.
    Fallback logs to stdout for development visibility.
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
        <div class="logo">BOTOCK<span>.APP</span></div>
        <div class="title">{purpose}</div>
        <div class="subtitle">Use the verification code below to authorize your session. This code is strictly confidential.</div>
        
        <div class="otp-box">
          <div class="otp-code">{otp_code}</div>
        </div>
        
        <div class="warning">
          <strong>Security Notice:</strong> This code expires in <strong>10 minutes</strong> and is valid for a maximum of <strong>3 attempts</strong>. Never share this code with anyone.
        </div>
        
        <div class="footer">
          Sent by Botock Platform Security Engine • info@botock.app
        </div>
      </div>
    </body>
    </html>
    """
    
    text_content = f"Botock Security Code for {purpose}: {otp_code}\nExpires in 10 minutes (3 attempts max). Do not share."

    # Terminal visibility
    logger.info("=" * 60)
    logger.info(f"📧 [EMAIL OTP DISPATCH] To: {to_email} | Purpose: {purpose}")
    logger.info(f"🔑 OTP CODE: >>> {otp_code} <<< (Valid for 10 minutes)")
    logger.info("=" * 60)

    # Attempt real Zoho SMTP delivery if password provided
    if settings.SMTP_PASSWORD:
        try:
            from_addr = settings.SMTP_FROM_EMAIL or "Botock <info@botock.app>"
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = from_addr
            msg["To"] = to_email

            msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            server = _get_smtp_server()
            server.sendmail(from_addr, [to_email], msg.as_string())
            server.quit()
            logger.info(f"✅ Real email successfully sent via Zoho SMTP to {to_email}")
            return True
        except Exception as e:
            logger.warning(f"⚠️ Zoho SMTP send failed ({e}). Fallback logged to terminal.")
            return True

    return True


def send_update_email(to_email: str, subject: str, headline: str, message_body: str, cta_text: str = None, cta_link: str = None) -> bool:
    """
    Sends an announcement or account update email to a user from info@botock.app.
    """
    cta_html = ""
    if cta_text and cta_link:
        cta_html = f"""
        <div style="text-align: center; margin: 30px 0;">
          <a href="{cta_link}" style="background: #6366f1; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
            {cta_text} &rarr;
          </a>
        </div>
        """

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>{subject}</title>
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0e; color: #f1f5f9; padding: 24px; margin: 0; }}
        .container {{ max-width: 560px; margin: 0 auto; background: #121217; border: 1px solid #26262e; border-radius: 20px; padding: 36px 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }}
        .logo {{ font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-align: center; margin-bottom: 24px; }}
        .logo span {{ color: #6366f1; }}
        .title {{ font-size: 22px; font-weight: 800; color: #f8fafc; margin-bottom: 12px; }}
        .body-text {{ font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 24px; white-space: pre-line; }}
        .footer {{ text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e1e26; padding-top: 20px; margin-top: 28px; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">BOTOCK<span>.APP</span></div>
        <div class="title">{headline}</div>
        <div class="body-text">{message_body}</div>
        {cta_html}
        <div class="footer">
          Botock AI Platform • info@botock.app • https://botock.app
        </div>
      </div>
    </body>
    </html>
    """

    if settings.SMTP_PASSWORD:
        try:
            from_addr = settings.SMTP_FROM_EMAIL or "Botock <info@botock.app>"
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = from_addr
            msg["To"] = to_email

            msg.attach(MIMEText(message_body, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            server = _get_smtp_server()
            server.sendmail(from_addr, [to_email], msg.as_string())
            server.quit()
            logger.info(f"✅ Update email sent to {to_email}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to send update email: {e}")
            return False

    return False


def test_smtp_connection(test_recipient: str = None) -> dict:
    """
    Tests the Zoho SMTP connection and attempts to send a verification ping.
    Useful for manual admin testing.
    """
    if not settings.SMTP_PASSWORD:
        return {
            "success": False,
            "message": "SMTP_PASSWORD is missing in backend/.env. Please add your Zoho 12-digit App Password.",
        }

    recipient = test_recipient or settings.SMTP_USER or "info@botock.app"
    try:
        server = _get_smtp_server()
        
        # Send test message
        msg = MIMEText("Zoho Mail SMTP connection verified successfully from Botock Platform!", "plain")
        msg["Subject"] = "🧪 Botock Zoho Mail SMTP Test: SUCCESS"
        msg["From"] = settings.SMTP_FROM_EMAIL or "Botock <info@botock.app>"
        msg["To"] = recipient

        server.sendmail(msg["From"], [recipient], msg.as_string())
        server.quit()
        return {
            "success": True,
            "message": f"Successfully connected to Zoho SMTP ({settings.SMTP_HOST}:{settings.SMTP_PORT}) and sent test email to {recipient}!",
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Zoho SMTP connection error: {str(e)}",
        }

