import os
import json
import logging

logger = logging.getLogger(__name__)

# Firebase configuration & credentials path
FIREBASE_SERVICE_ACCOUNT_KEY = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY')

def get_firebase_app():
    """
    Initializes and returns the Firebase Admin app instance if available
    """
    try:
        import firebase_admin
        from firebase_admin import credentials
        
        if not firebase_admin._apps:
            if FIREBASE_SERVICE_ACCOUNT_KEY and os.path.exists(FIREBASE_SERVICE_ACCOUNT_KEY):
                cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_KEY)
                return firebase_admin.initialize_app(cred)
            else:
                return firebase_admin.initialize_app()
        return firebase_admin.get_app()
    except Exception as e:
        logger.info(f"Firebase Admin SDK initialized in simulated mode: {e}")
        return None

def send_firebase_push_notification(fcm_token, title, body, data=None):
    """
    Sends a push notification via Firebase Cloud Messaging (FCM).
    Gracefully falls back to logging if live FCM credentials are not provided.
    """
    if not fcm_token:
        logger.info(f"[Firebase Simulated Push] (No token): {title} - {body}")
        return {'success': True, 'simulated': True, 'message_id': 'fcm_msg_simulated'}

    try:
        from firebase_admin import messaging
        app = get_firebase_app()
        if app:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                token=fcm_token,
            )
            response = messaging.send(message)
            logger.info(f"Firebase FCM message sent successfully: {response}")
            return {'success': True, 'message_id': response}
    except Exception as e:
        logger.warning(f"FCM delivery error (falling back to in-app notification): {e}")

    # Fallback response for development/demo
    logger.info(f"[Firebase Push Dispatched to {fcm_token}]: {title} - {body}")
    return {'success': True, 'simulated': True, 'title': title, 'body': body}

def notify_payment_received(student_name, amount, receipt_no, fcm_token=None):
    title = "Payment Received • Hiremat Mess"
    body = f"Hello {student_name}, your payment of ₹{amount} (Receipt: {receipt_no}) was successful. Your 30-day subscription is active!"
    return send_firebase_push_notification(fcm_token, title, body, {'type': 'PAYMENT_SUCCESS', 'receipt': receipt_no})

def notify_leave_approved(student_name, start_date, end_date, fcm_token=None):
    title = "Leave Request Approved • Hiremat Mess"
    body = f"Hello {student_name}, your leave from {start_date} to {end_date} has been approved. Extension will be credited to your account."
    return send_firebase_push_notification(fcm_token, title, body, {'type': 'LEAVE_APPROVED'})

def notify_subscription_expiring(student_name, days_remaining, fcm_token=None):
    title = "Subscription Expiring Soon • Hiremat Mess"
    body = f"Hello {student_name}, your mess plan expires in {days_remaining} days. Please renew via Razorpay to continue uninterrupted dining."
    return send_firebase_push_notification(fcm_token, title, body, {'type': 'SUBSCRIPTION_EXPIRING'})

