from django.urls import path
from .views import (
    LoginView, CurrentUserView, StudentsView, StudentDetailView,
    StudentDeactivateView, StudentActivateView, PlansView,
    SubscriptionsView, StudentSubscriptionView, PaymentsView,
    LeavesView, LeaveStatusUpdateView, ExtensionsView,
    EligibleExtensionsView, ReviewExtensionView, NotificationsView,
    RazorpayCreateOrderView, RazorpayVerifyPaymentView, FirebaseRegisterTokenView,
    StaffView, StaffDetailView, UpiPaymentSubmitView, PasswordChangeView, FoodFeedbackView,
    SendOtpView, VerifyOtpAndResetPasswordView, SendReminderView,
    PasswordResetRequestSubmitView, PasswordResetRequestsListView,
    PasswordResetRequestApproveView, PasswordResetRequestRejectView
)

urlpatterns = [
    path('auth/login', LoginView.as_view(), name='login'),
    path('auth/me', CurrentUserView.as_view(), name='current_user'),
    path('auth/password/change', PasswordChangeView.as_view(), name='password_change'),
    path('auth/password/reset-request', PasswordResetRequestSubmitView.as_view(), name='password_reset_request_submit'),
    path('auth/password/reset-requests', PasswordResetRequestsListView.as_view(), name='password_reset_requests_list'),
    path('auth/password/reset-requests/<str:pk>/approve', PasswordResetRequestApproveView.as_view(), name='password_reset_request_approve'),
    path('auth/password/reset-requests/<str:pk>/reject', PasswordResetRequestRejectView.as_view(), name='password_reset_request_reject'),
    path('auth/otp/send', SendOtpView.as_view(), name='send_otp'),
    path('auth/otp/verify-reset', VerifyOtpAndResetPasswordView.as_view(), name='verify_otp_reset'),
    path('reminders/send', SendReminderView.as_view(), name='send_reminders'),

    path('students', StudentsView.as_view(), name='students_list_create'),
    path('students/<str:pk>', StudentDetailView.as_view(), name='student_detail'),
    path('students/<str:pk>/deactivate', StudentDeactivateView.as_view(), name='student_deactivate'),
    path('students/<str:pk>/activate', StudentActivateView.as_view(), name='student_activate'),

    path('staff', StaffView.as_view(), name='staff_list_create'),
    path('staff/<str:pk>', StaffDetailView.as_view(), name='staff_detail'),

    path('plans', PlansView.as_view(), name='plans_list'),

    path('subscriptions', SubscriptionsView.as_view(), name='subscriptions_list'),
    path('subscriptions/student/<str:student_id>', StudentSubscriptionView.as_view(), name='student_subscription'),

    path('payments', PaymentsView.as_view(), name='payments_list_create'),
    path('payments/upi/submit', UpiPaymentSubmitView.as_view(), name='upi_payment_submit'),

    path('leaves', LeavesView.as_view(), name='leaves_list_create'),
    path('leaves/<str:pk>/status', LeaveStatusUpdateView.as_view(), name='leave_status_update'),

    path('extensions', ExtensionsView.as_view(), name='extensions_list'),
    path('extensions/eligible', EligibleExtensionsView.as_view(), name='eligible_extensions'),
    path('extensions/review', ReviewExtensionView.as_view(), name='review_extension'),

    path('payments/razorpay/order', RazorpayCreateOrderView.as_view(), name='razorpay_order'),
    path('payments/razorpay/verify', RazorpayVerifyPaymentView.as_view(), name='razorpay_verify'),

    path('notifications', NotificationsView.as_view(), name='notifications_list'),
    path('notifications/fcm-token', FirebaseRegisterTokenView.as_view(), name='fcm_register_token'),

    path('feedback', FoodFeedbackView.as_view(), name='food_feedback'),
]

