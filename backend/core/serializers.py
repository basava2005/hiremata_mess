from rest_framework import serializers
from .models import (
    UserAccount, Student, Plan, Subscription, Payment,
    LeaveRequest, LeaveExtension, Notification, FoodFeedback, PasswordResetRequest, Announcement
)
from .dates import get_subscription_status

class UserAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = ['id', 'branch_id', 'mobile', 'name', 'role', 'student_id', 'avatar_url', 'created_at']

class PlanSerializer(serializers.ModelSerializer):
    durationDays = serializers.IntegerField(source='duration_days')
    mealsLabel = serializers.CharField(source='meals_label')
    isActive = serializers.BooleanField(source='is_active')

    class Meta:
        model = Plan
        fields = ['id', 'branch_id', 'name', 'price', 'durationDays', 'mealsLabel', 'description', 'isActive']

class StudentSerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source='user_id')
    isActive = serializers.BooleanField(source='is_active')
    monthlyFee = serializers.IntegerField(source='monthly_fee', required=False, default=3500)
    category = serializers.CharField(required=False, default='STANDARD')
    currentSubscriptionId = serializers.CharField(source='current_subscription_id', required=False, allow_null=True)

    class Meta:
        model = Student
        fields = ['id', 'branch_id', 'userId', 'name', 'mobile', 'address', 'monthlyFee', 'category', 'isActive', 'currentSubscriptionId', 'created_at']

class SubscriptionSerializer(serializers.ModelSerializer):
    studentId = serializers.CharField(source='student_id')
    planId = serializers.CharField(source='plan_id')
    startDate = serializers.DateField(source='start_date')
    lastDate = serializers.DateField(source='last_date')
    plan = PlanSerializer(read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = ['id', 'branch_id', 'studentId', 'planId', 'startDate', 'lastDate', 'status', 'plan', 'created_at']

    def get_status(self, obj):
        return get_subscription_status(obj.start_date, obj.last_date)

class PaymentSerializer(serializers.ModelSerializer):
    studentId = serializers.CharField(source='student_id')
    studentName = serializers.SerializerMethodField()
    paymentMethod = serializers.CharField(source='payment_method')
    referenceNumber = serializers.CharField(source='reference_number', required=False, allow_null=True)
    receiptNumber = serializers.CharField(source='receipt_number')

    class Meta:
        model = Payment
        fields = ['id', 'branch_id', 'studentId', 'studentName', 'subscription_id', 'amount', 'paymentMethod', 'referenceNumber', 'status', 'date', 'receiptNumber', 'notes', 'created_at']

    def get_studentName(self, obj):
        return obj.student.name if obj.student else ''

class LeaveRequestSerializer(serializers.ModelSerializer):
    studentId = serializers.CharField(source='student_id')
    studentName = serializers.SerializerMethodField()
    startDate = serializers.DateField(source='start_date')
    endDate = serializers.DateField(source='end_date')
    daysCount = serializers.IntegerField(source='days_count')
    adminNote = serializers.CharField(source='admin_note', required=False, allow_null=True)

    class Meta:
        model = LeaveRequest
        fields = ['id', 'branch_id', 'studentId', 'studentName', 'startDate', 'endDate', 'daysCount', 'reason', 'status', 'adminNote', 'created_at']

    def get_studentName(self, obj):
        return obj.student.name if obj.student else ''

class LeaveExtensionSerializer(serializers.ModelSerializer):
    studentId = serializers.CharField(source='student_id')
    studentName = serializers.SerializerMethodField()
    subscriptionId = serializers.CharField(source='subscription_id')
    oldLastDate = serializers.DateField(source='old_last_date')
    newLastDate = serializers.DateField(source='new_last_date')
    daysAdded = serializers.IntegerField(source='days_added')

    class Meta:
        model = LeaveExtension
        fields = ['id', 'branch_id', 'studentId', 'studentName', 'subscriptionId', 'oldLastDate', 'newLastDate', 'daysAdded', 'approved_by_user_id', 'status', 'note', 'created_at']

    def get_studentName(self, obj):
        return obj.student.name if obj.student else ''

class NotificationSerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source='user_id')
    isRead = serializers.BooleanField(source='is_read')

    class Meta:
        model = Notification
        fields = ['id', 'branch_id', 'userId', 'title', 'message', 'type', 'isRead', 'created_at']

class FoodFeedbackSerializer(serializers.ModelSerializer):
    studentId = serializers.CharField(source='student_id')
    studentName = serializers.SerializerMethodField()
    mealType = serializers.CharField(source='meal_type')
    createdAt = serializers.DateField(source='created_at', read_only=True)

    class Meta:
        model = FoodFeedback
        fields = ['id', 'branch_id', 'studentId', 'studentName', 'mealType', 'rating', 'tags', 'comments', 'createdAt']

    def get_studentName(self, obj):
        return obj.student.name if obj.student else ''

class PasswordResetRequestSerializer(serializers.ModelSerializer):
    studentId = serializers.CharField(source='student_id', read_only=True)
    studentName = serializers.CharField(source='student_name', read_only=True)
    requestedPassword = serializers.CharField(source='requested_password', read_only=True)
    adminNote = serializers.CharField(source='admin_note', required=False, allow_blank=True)
    approvedAt = serializers.DateTimeField(source='approved_at', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = PasswordResetRequest
        fields = [
            'id', 'branch_id', 'mobile', 'studentName', 'studentId',
            'requestedPassword', 'status', 'adminNote', 'approvedAt', 'createdAt'
        ]

class AnnouncementSerializer(serializers.ModelSerializer):
    branchId = serializers.CharField(source='branch_id', required=False, default='branch-main-01')
    effectiveDate = serializers.DateField(source='effective_date', required=False, allow_null=True)
    createdBy = serializers.CharField(source='created_by', required=False, default='Admin Ramesh Sharma')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Announcement
        fields = ['id', 'branchId', 'title', 'message', 'type', 'effectiveDate', 'createdBy', 'createdAt']

