from django.urls import path, re_path
from .views import (
    RootApiStatusView, LoginView, CurrentUserView, StudentsView, StudentDetailView,
    StudentDeactivateView, StudentActivateView, PlansView,
    SubscriptionsView, StudentSubscriptionView, PaymentsView,
    LeavesView, LeaveStatusUpdateView, ExtensionsView,
    EligibleExtensionsView, ReviewExtensionView, NotificationsView,
    RazorpayCreateOrderView, RazorpayVerifyPaymentView, FirebaseRegisterTokenView,
    StaffView, StaffDetailView, UpiPaymentSubmitView, PasswordChangeView, FoodFeedbackView,
    SendOtpView, VerifyOtpAndResetPasswordView, SendReminderView,
    PasswordResetRequestSubmitView, PasswordResetRequestsListView,
    PasswordResetRequestApproveView, PasswordResetRequestRejectView,
    AnnouncementsView, AnnouncementDetailView
)

urlpatterns = [
    re_path(r'^$', RootApiStatusView.as_view(), name='api_root_status'),
    re_path(r'^auth/login/?$', LoginView.as_view(), name='login'),
    re_path(r'^auth/me/?$', CurrentUserView.as_view(), name='current_user'),
    re_path(r'^auth/password/change/?$', PasswordChangeView.as_view(), name='password_change'),
    re_path(r'^auth/password/reset-request/?$', PasswordResetRequestSubmitView.as_view(), name='password_reset_request_submit'),
    re_path(r'^auth/password/reset-requests/?$', PasswordResetRequestsListView.as_view(), name='password_reset_requests_list'),
    re_path(r'^auth/password/reset-requests/(?P<pk>[^/]+)/approve/?$', PasswordResetRequestApproveView.as_view(), name='password_reset_request_approve'),
    re_path(r'^auth/password/reset-requests/(?P<pk>[^/]+)/reject/?$', PasswordResetRequestRejectView.as_view(), name='password_reset_request_reject'),
    re_path(r'^auth/otp/send/?$', SendOtpView.as_view(), name='send_otp'),
    re_path(r'^auth/otp/verify-reset/?$', VerifyOtpAndResetPasswordView.as_view(), name='verify_otp_reset'),
    re_path(r'^reminders/send/?$', SendReminderView.as_view(), name='send_reminders'),

    re_path(r'^students/?$', StudentsView.as_view(), name='students_list_create'),
    re_path(r'^students/(?P<pk>[^/]+)/?$', StudentDetailView.as_view(), name='student_detail'),
    re_path(r'^students/(?P<pk>[^/]+)/deactivate/?$', StudentDeactivateView.as_view(), name='student_deactivate'),
    re_path(r'^students/(?P<pk>[^/]+)/activate/?$', StudentActivateView.as_view(), name='student_activate'),

    re_path(r'^staff/?$', StaffView.as_view(), name='staff_list_create'),
    re_path(r'^staff/(?P<pk>[^/]+)/?$', StaffDetailView.as_view(), name='staff_detail'),

    re_path(r'^plans/?$', PlansView.as_view(), name='plans_list'),

    re_path(r'^subscriptions/?$', SubscriptionsView.as_view(), name='subscriptions_list'),
    re_path(r'^subscriptions/student/(?P<student_id>[^/]+)/?$', StudentSubscriptionView.as_view(), name='student_subscription'),

    re_path(r'^payments/?$', PaymentsView.as_view(), name='payments_list_create'),
    re_path(r'^payments/upi/submit/?$', UpiPaymentSubmitView.as_view(), name='upi_payment_submit'),

    re_path(r'^leaves/?$', LeavesView.as_view(), name='leaves_list_create'),
    re_path(r'^leaves/(?P<pk>[^/]+)/status/?$', LeaveStatusUpdateView.as_view(), name='leave_status_update'),

    re_path(r'^extensions/?$', ExtensionsView.as_view(), name='extensions_list'),
    re_path(r'^extensions/eligible/?$', EligibleExtensionsView.as_view(), name='eligible_extensions'),
    re_path(r'^extensions/review/?$', ReviewExtensionView.as_view(), name='review_extension'),

    re_path(r'^payments/razorpay/order/?$', RazorpayCreateOrderView.as_view(), name='razorpay_order'),
    re_path(r'^payments/razorpay/verify/?$', RazorpayVerifyPaymentView.as_view(), name='razorpay_verify'),

    re_path(r'^notifications/?$', NotificationsView.as_view(), name='notifications_list'),
    re_path(r'^notifications/fcm-token/?$', FirebaseRegisterTokenView.as_view(), name='fcm_register_token'),

    re_path(r'^feedback/?$', FoodFeedbackView.as_view(), name='food_feedback'),

    re_path(r'^announcements/?$', AnnouncementsView.as_view(), name='announcements_list_create'),
    re_path(r'^announcements/(?P<pk>[^/]+)/?$', AnnouncementDetailView.as_view(), name='announcement_detail'),
]
