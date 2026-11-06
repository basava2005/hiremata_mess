from rest_framework import serializers
from .models import UserAccount, Student, Plan, Subscription, Payment, LeaveRequest, LeaveExtension, Notification, FoodFeedback
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
    currentSubscriptionId = serializers.CharField(source='current_subscription_id', required=False, allow_null=True)

    class Meta:
        model = Student
        fields = ['id', 'branch_id', 'userId', 'name', 'mobile', 'address', 'isActive', 'currentSubscriptionId', 'created_at']

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


