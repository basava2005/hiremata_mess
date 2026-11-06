import os
import json
import logging
import urllib.request
import urllib.parse
from datetime import datetime

logger = logging.getLogger(__name__)

# Environment configuration
FAST2SMS_API_KEY = os.environ.get('FAST2SMS_API_KEY', '').strip()
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '').strip()
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '').strip()
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', '').strip()

MESS_NAME = "Hiremat Mess Davangere"
MESS_CONTACT = "9876543210"

def get_whatsapp_url(mobile: str, text: str) -> str:
    """
    Generates a direct WhatsApp link that opens WhatsApp with pre-filled message
    """
    clean_mobile = ''.join(c for c in mobile if c.isdigit())
    if len(clean_mobile) == 10:
        clean_mobile = f"91{clean_mobile}"
    encoded = urllib.parse.quote(text)
    return f"https://api.whatsapp.com/send?phone={clean_mobile}&text={encoded}"

def send_sms(mobile: str, message: str, otp_code: str = None) -> dict:
    """
    Sends an SMS to the given 10-digit mobile number via Fast2SMS, Twilio, or simulated dispatcher.
    """
    clean_mobile = ''.join(c for c in mobile if c.isdigit())[-10:]
    if len(clean_mobile) != 10:
        return {'success': False, 'error': f'Invalid mobile number: {mobile}'}

    # 1. Try Fast2SMS (Indian SMS Gateway)
    if FAST2SMS_API_KEY:
        try:
            req_data = {
                "route": "q",
                "message": message,
                "language": "english",
                "flash": 0,
                "numbers": clean_mobile
            }
            if otp_code:
                req_data = {
                    "route": "otp",
                    "variables_values": otp_code,
                    "numbers": clean_mobile
                }

            req = urllib.request.Request(
                "https://www.fast2sms.com/dev/bulkV2",
                data=json.dumps(req_data).encode('utf-8'),
                headers={
                    "authorization": FAST2SMS_API_KEY,
                    "Content-Type": "application/json"
                }
            )
            with urllib.request.urlopen(req, timeout=8) as res:
                res_data = json.loads(res.read().decode('utf-8'))
                logger.info(f"Fast2SMS response: {res_data}")
                return {'success': True, 'gateway': 'Fast2SMS', 'data': res_data}
        except Exception as e:
            logger.error(f"Fast2SMS delivery failed: {e}")

    # 2. Try Twilio
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER:
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
            data = urllib.parse.urlencode({
                'To': f"+91{clean_mobile}",
                'From': TWILIO_PHONE_NUMBER,
                'Body': message
            }).encode('utf-8')

            import base64
            auth_header = base64.b64encode(f"{TWILIO_ACCOUNT_SID}:{TWILIO_AUTH_TOKEN}".encode('utf-8')).decode('ascii')
            req = urllib.request.Request(
                url,
                data=data,
                headers={"Authorization": f"Basic {auth_header}"}
            )
            with urllib.request.urlopen(req, timeout=8) as res:
                res_data = json.loads(res.read().decode('utf-8'))
                logger.info(f"Twilio SMS response: {res_data.get('sid')}")
                return {'success': True, 'gateway': 'Twilio', 'sid': res_data.get('sid')}
        except Exception as e:
            logger.error(f"Twilio SMS delivery failed: {e}")

    # 3. Simulated Gateway Dispatch (Logs to stdout and returns formatted text)
    logger.info(f"[SMS DISPATCH TO +91 {clean_mobile}]: {message}")
    print(f"\n==========================================")
    print(f"[SMS CARRIER DISPATCH -> +91 {clean_mobile}]")
    print(f"Message: {message}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"==========================================\n")

    return {
        'success': True,
        'gateway': 'Simulated Carrier Dispatch',
        'mobile': f"+91 ******{clean_mobile[-4:]}",
        'dispatched': True,
        'message': message
    }

def send_otp_sms(mobile: str, otp: str, purpose: str = 'Password Reset') -> dict:
    """
    Sends a 6-digit security OTP to the user's mobile
    """
    message = f"Your {MESS_NAME} {purpose} OTP is {otp}. Valid for 5 minutes. Do not share with anyone. - Hiremat Mess Davangere"
    result = send_sms(mobile, message, otp_code=otp)
    result['whatsappUrl'] = get_whatsapp_url(mobile, message)
    return result

def send_renewal_reminder_sms(mobile: str, student_name: str, days_left: int, last_date_str: str) -> dict:
    """
    Sends a subscription renewal reminder SMS to the student
    """
    if days_left <= 0:
        msg = f"Dear {student_name}, your {MESS_NAME} subscription has expired on {last_date_str}. Please renew via Direct UPI (Rs. 3,500) to hirematmess@upi to resume your hot meals. Contact: {MESS_CONTACT}."
    else:
        msg = f"Dear {student_name}, your {MESS_NAME} subscription expires in {days_left} days (on {last_date_str}). Please renew via Direct UPI (Rs. 3,500) to hirematmess@upi to ensure uninterrupted dining. Contact: {MESS_CONTACT}."

    result = send_sms(mobile, msg)
    result['whatsappUrl'] = get_whatsapp_url(mobile, msg)
    result['reminderText'] = msg
    return result
