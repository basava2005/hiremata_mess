from django.core.management.base import BaseCommand
from core.models import Branch, UserAccount, Student, Plan, Subscription, Payment, LeaveRequest, LeaveExtension, Notification

class Command(BaseCommand):
    help = 'Resets database to clean production state with ONLY ONE ADMIN and no mock students/staff.'

    def handle(self, *args, **options):
        self.stdout.write("Purging all mock data for clean production setup...")

        # Clear transactions and students
        Notification.objects.all().delete()
        LeaveExtension.objects.all().delete()
        LeaveRequest.objects.all().delete()
        Payment.objects.all().delete()
        Subscription.objects.all().delete()
        Student.objects.all().delete()
        UserAccount.objects.all().delete()
        Plan.objects.all().delete()
        Branch.objects.all().delete()

        # 1. Create Main Branch
        branch = Branch.objects.create(
            id='branch-main-01',
            name='Hiremat Mess Davangere',
            location='Anjaneya Layout 5th Cross, BIET Rd, Davangere, Karnataka 577004'
        )
        self.stdout.write(f"Created Branch: {branch.name}")

        # 2. Create Single Official 30-Day Pure Veg Plan (Rs. 3500)
        plan = Plan.objects.create(
            id='plan-standard-30',
            branch_id=branch.id,
            name='Standard Monthly Plan (Pure Veg)',
            price=3500,
            duration_days=30,
            meals_label='Breakfast + Tea + Lunch + Dinner',
            description='Mandakki Mirchi, Homestyle Dosa, Paddu, Pulao, Avalakki, Kadak Chai/Tea, Unlimited Hot Whole-Wheat Chapati Meals, and Holige feast.',
            is_active=True
        )
        self.stdout.write(f"Created Plan: {plan.name} (Rs. {plan.price})")

        # 3. Create Official Branch Administrators
        admins = [
            UserAccount.objects.create(
                id='admin-chandan',
                branch_id=branch.id,
                mobile='8431413551',
                name='Chandan Hiremat',
                role='BRANCH_ADMIN',
                password='Chandu@143',
                student_id=None
            ),
            UserAccount.objects.create(
                id='admin-punith',
                branch_id=branch.id,
                mobile='8073113562',
                name='Punith Hiremat',
                role='BRANCH_ADMIN',
                password='Punith@143',
                student_id=None
            ),
            UserAccount.objects.create(
                id='admin-basavaraj',
                branch_id=branch.id,
                mobile='9353198281',
                name='Basavaraj H A',
                role='BRANCH_ADMIN',
                password='Basava@143',
                student_id=None
            ),
        ]
        for a in admins:
            self.stdout.write(self.style.SUCCESS(f"Configured Admin: {a.name} ({a.mobile})"))
        self.stdout.write(self.style.SUCCESS("All mock data removed. System is ready for live production use!"))
