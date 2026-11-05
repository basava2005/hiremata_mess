from datetime import date, timedelta
import pytz

IST = pytz.timezone('Asia/Kolkata')

def get_today_ist() -> date:
    # Standard date in IST
    return date.today()

def calculate_last_date(start_date: date, duration_days: int = 30) -> date:
    """last included date = start + 29 days for a 30-day plan"""
    return start_date + timedelta(days=duration_days - 1)

def inclusive_days(start_date: date, end_date: date) -> int:
    """inclusiveDays(start, end) = difference in calendar days + 1"""
    if end_date < start_date:
        return 0
    return (end_date - start_date).days + 1

def get_days_remaining(last_date: date, ref_date: date = None) -> int:
    if ref_date is None:
        ref_date = get_today_ist()
    diff = (last_date - ref_date).days
    return diff + 1 if diff >= 0 else 0

def get_subscription_status(start_date: date, last_date: date, ref_date: date = None) -> str:
    """
    Rules:
    - Expired from next day (ref_date > last_date)
    - Expiring soon = 3 days or less left
    - Active = > 3 days left
    """
    if ref_date is None:
        ref_date = get_today_ist()

    if ref_date < start_date:
        return 'UPCOMING'

    days_left = get_days_remaining(last_date, ref_date)
    if days_left <= 0:
        return 'EXPIRED'
    if days_left <= 3:
        return 'EXPIRING_SOON'
    return 'ACTIVE'

