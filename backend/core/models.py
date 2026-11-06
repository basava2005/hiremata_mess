from django.db import models
import uuid

class Branch(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default='branch-main-01')
    name = models.CharField(max_length=120, default='Hiremat Mess Davangere')
    location = models.CharField(max_length=255, default='Anjaneya Layout 5th Cross, BIET Rd, Davangere, Karnataka 577004')

    def __str__(self):
        return self.name

class UserAccount(models.Model):
    ROLE_CHOICES = (
        ('BRANCH_ADMIN', 'Branch Admin'),
        ('MESS_STAFF', 'Mess Staff'),
        ('STUDENT', 'Student'),
    )
    id = models.CharField(max_length=64, primary_key=True)
    branch_id = models.CharField(max_length=64, default='branch-main-01')
    mobile = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES)
    password = models.CharField(max_length=128, default='password123')
    student_id = models.CharField(max_length=64, null=True, blank=True)
    avatar_url = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.role}) - {self.mobile}"

class Student(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    branch_id = models.CharField(max_length=64, default='branch-main-01')
    user_id = models.CharField(max_length=64)
    name = models.CharField(max_length=120)
    mobile = models.CharField(max_length=15)
    address = models.TextField()
    monthly_fee = models.IntegerField(default=3500)
    category = models.CharField(max_length=50, default='STANDARD')  # STANDARD, PUC, CONCESSION
    is_active = models.BooleanField(default=True)
    current_subscription_id = models.CharField(max_length=64, null=True, blank=True)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.mobile}) - ₹{self.monthly_fee}"

class Plan(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default='plan-standard-30')
    branch_id = models.CharField(max_length=64, default='branch-main-01')
    name = models.CharField(max_length=120, default='Standard Monthly Plan')
    price = models.IntegerField(default=3500)
    duration_days = models.IntegerField(default=30)
    meals_label = models.CharField(max_length=100, default='Lunch + Dinner')
    description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - ₹{self.price}"

class Subscription(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('EXPIRING_SOON', 'Expiring Soon'),
        ('EXPIRED', 'Expired'),
        ('UPCOMING', 'Upcoming'),
    )
    id = models.CharField(max_length=64, primary_key=True)
    branch_id = models.CharField(max_length=64, default='branch-main-01')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name='subscriptions')
    start_date = models.DateField()
    last_date = models.DateField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Sub {self.id} for {self.student.name} ({self.start_date} to {self.last_date})"

class Payment(models.Model):
    METHOD_CHOICES = (
        ('CASH', 'Cash'),
        ('UPI', 'UPI'),
        ('ONLINE', 'Online'),
        ('OTHER', 'Other'),
    )
    STATUS_CHOICES = (
        ('SUCCESS', 'Success'),
        ('PENDING', 'Pending'),
        ('FAILED', 'Failed'),
    )
    id = models.CharField(max_length=64, primary_key=True)
    branch_id = models.CharField(max_length=64, default='branch-main-01')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    subscription_id = models.CharField(max_length=64, null=True, blank=True)
    amount = models.IntegerField(default=3500)
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='UPI')
    reference_number = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUCCESS')
    date = models.DateField()
    receipt_number = models.CharField(max_length=64, unique=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.receipt_number} - {self.student.name} - ₹{self.amount}"

class LeaveRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
    )
    id = models.CharField(max_length=64, primary_key=True)
    branch_id = models.CharField(max_length=64, default='branch-main-01')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='leaves')
    start_date = models.DateField()
    end_date = models.DateField()
    days_count = models.IntegerField(default=1)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    admin_note = models.TextField(blank=True, null=True)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Leave {self.id}: {self.student.name} ({self.start_date} to {self.end_date})"

class LeaveExtension(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    branch_id = models.CharField(max_length=64, default='branch-main-01')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='extensions')
    subscription_id = models.CharField(max_length=64)
    old_last_date = models.DateField()
    new_last_date = models.DateField()
    days_added = models.IntegerField(default=0)
    approved_by_user_id = models.CharField(max_length=64, default='user-admin')
    status = models.CharField(max_length=20, default='APPROVED')
    note = models.TextField(blank=True, null=True)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Ext {self.id}: {self.student.name} (+{self.days_added} days)"

class Notification(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    branch_id = models.CharField(max_length=64, default='branch-main-01')
    user_id = models.CharField(max_length=64)
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=20, default='INFO')
    is_read = models.BooleanField(default=False)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} -> {self.user_id}"

class FoodFeedback(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    branch_id = models.CharField(max_length=64, default='branch-main-01')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='feedbacks')
    meal_type = models.CharField(max_length=30)  # BREAKFAST, LUNCH, DINNER
    rating = models.IntegerField(default=5)     # 1 to 5
    tags = models.CharField(max_length=255, blank=True, default='')
    comments = models.TextField(blank=True, default='')
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} - {self.meal_type} ({self.rating} stars)"

class OTPVerification(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    mobile = models.CharField(max_length=15)
    otp = models.CharField(max_length=6)
    purpose = models.CharField(max_length=50, default='PASSWORD_RESET')
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"OTP for {self.mobile} ({self.purpose}) - {'Verified' if self.is_verified else 'Pending'}"

class PasswordResetRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    id = models.CharField(max_length=64, primary_key=True)
    branch_id = models.CharField(max_length=64, default='branch-main-01')
    mobile = models.CharField(max_length=15)
    student_name = models.CharField(max_length=120)
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True, related_name='password_requests')
    requested_password = models.CharField(max_length=128)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    admin_note = models.TextField(blank=True, default='')
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reset Req {self.id} for {self.student_name} ({self.mobile}) - {self.status}"


class Announcement(models.Model):
    TYPE_CHOICES = (
        ('MESS_OFF', 'Mess Off / Holiday'),
        ('SPECIAL_DINNER', 'Special Dinner / Holige Feast'),
        ('NOTICE', 'General Notice'),
    )
    id = models.CharField(max_length=64, primary_key=True)
    branch_id = models.CharField(max_length=64, default='branch-main-01')
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='NOTICE')
    effective_date = models.DateField(null=True, blank=True)
    created_by = models.CharField(max_length=64, default='Admin Ramesh Sharma')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.type}] {self.title} ({self.created_at})"



