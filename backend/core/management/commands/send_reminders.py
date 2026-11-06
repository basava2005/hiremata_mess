from django.core.management.base import BaseCommand
from datetime import date
from core.models import Student, Subscription, Notification
from core.sms_service import send_renewal_reminder_sms
from core.firebase_service import notify_subscription_expiring
import random

class Command(BaseCommand):
    help = 'Automatically dispatches SMS and notification reminders to students whose mess pass is expiring in <= 3 days'

    def handle(self, *args, **options):
        self.stdout.write("Checking expiring subscriptions for Hiremat Mess...")

        students = Student.objects.filter(is_active=True)
        count = 0

        for student in students:
            sub = Subscription.objects.filter(student=student).order_by('-last_date').first()
            if not sub:
                continue

            days_left = (sub.last_date - date.today()).days
            if days_left <= 3:
                last_date_str = sub.last_date.strftime('%d-%b-%Y')
                sms_res = send_renewal_reminder_sms(student.mobile, student.name, days_left, last_date_str)

                Notification.objects.create(
                    id=f"notif-{random.randint(100000, 999999)}",
                    user_id=student.user_id,
                    title='Subscription Renewal Reminder' if days_left > 0 else 'Pass Expired',
                    message=sms_res.get('reminderText', f"Your mess pass expires on {last_date_str}. Please renew via Direct UPI."),
                    type='WARNING' if days_left > 0 else 'ALERT',
                    is_read=False
                )

                notify_subscription_expiring(student.name, max(0, days_left))

                self.stdout.write(f"Reminder sent to {student.name} ({student.mobile}) - {days_left} days remaining.")
                count += 1

        self.stdout.write(f"Done! Sent renewal reminders to {count} student(s).")
