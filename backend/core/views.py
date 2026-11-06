from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import date, timedelta, datetime
from django.utils import timezone
import random

from .models import (
    UserAccount, Student, Plan, Subscription, Payment,
    LeaveRequest, LeaveExtension, Notification, FoodFeedback, OTPVerification, PasswordResetRequest, Announcement
)
from .serializers import (
    UserAccountSerializer, StudentSerializer, PlanSerializer,
    SubscriptionSerializer, PaymentSerializer, LeaveRequestSerializer,
    LeaveExtensionSerializer, NotificationSerializer, FoodFeedbackSerializer, PasswordResetRequestSerializer,
    AnnouncementSerializer
)
from .dates import calculate_last_date, inclusive_days, get_today_ist, get_subscription_status
from .eligibility import check_leave_eligibility
from .sms_service import send_otp_sms, send_renewal_reminder_sms, get_whatsapp_url
from .firebase_service import notify_subscription_expiring, notify_payment_received


class LoginView(APIView):
    def post(self, request):
        mobile = str(request.data.get('mobile', '')).strip()
        password = str(request.data.get('password', '')).strip()

        user = UserAccount.objects.filter(mobile=mobile).first()
        if not user:
            return Response({'detail': 'No registered account found with this mobile number.'}, status=status.HTTP_404_NOT_FOUND)

        if user.password != password:
            return Response({'detail': 'Incorrect password. Please verify or use Forgot Password to reset via OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        student = None
        if user.student_id:
            student_obj = Student.objects.filter(id=user.student_id).first()
            if student_obj:
                student = StudentSerializer(student_obj).data

        token = f"jwt-token-{user.id}-{int(date.today().strftime('%Y%m%d'))}"

        return Response({
            'token': token,
            'user': UserAccountSerializer(user).data,
            'student': student
        })

class CurrentUserView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization', '')
        if 'Bearer ' in auth_header:
            token = auth_header.split('Bearer ')[1]
            parts = token.split('-')
            if len(parts) >= 3:
                user_id = f"{parts[2]}-{parts[3]}" if len(parts) >= 4 else parts[2]
                user = UserAccount.objects.filter(id=user_id).first()
                if user:
                    return Response(UserAccountSerializer(user).data)

        # Fallback to first admin
        first_user = UserAccount.objects.first()
        if first_user:
            return Response(UserAccountSerializer(first_user).data)
        return Response({'detail': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

class StudentsView(APIView):
    def get(self, request):
        students = Student.objects.all()
        q = request.query_params.get('search', '').lower()
        if q:
            students = [s for s in students if q in s.name.lower() or q in s.mobile or q in s.address.lower()]

        status_param = request.query_params.get('status')
        if status_param == 'ACTIVE':
            students = [s for s in students if s.is_active]
        elif status_param == 'INACTIVE':
            students = [s for s in students if not s.is_active]

        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    def post(self, request):
        name = request.data.get('name')
        mobile = str(request.data.get('mobile', '')).strip()
        address = request.data.get('address', '')
        initial_password = str(request.data.get('initialPassword') or request.data.get('password') or 'password123').strip()
        monthly_fee = int(request.data.get('monthlyFee') or request.data.get('monthly_fee') or 3500)
        category = request.data.get('category', 'STANDARD')

        if UserAccount.objects.filter(mobile=mobile).exists():
            return Response({'detail': 'A student or user with this mobile number already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        new_id = f"stud-{int(date.today().strftime('%m%d%H%M'))}-{random.randint(100, 999)}"
        user_id = f"user-{new_id}"

        # Create linked user
        user = UserAccount.objects.create(
            id=user_id,
            branch_id='branch-main-01',
            mobile=mobile,
            name=name,
            role='STUDENT',
            password=initial_password,
            student_id=new_id
        )

        student = Student.objects.create(
            id=new_id,
            branch_id='branch-main-01',
            user_id=user_id,
            name=name,
            mobile=mobile,
            address=address,
            monthly_fee=monthly_fee,
            category=category,
            is_active=True
        )

        return Response(StudentSerializer(student).data, status=status.HTTP_201_CREATED)

class StudentDetailView(APIView):
    def get(self, request, pk):
        student = Student.objects.filter(id=pk).first()
        if not student:
            return Response({'detail': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(StudentSerializer(student).data)

    def patch(self, request, pk):
        student = Student.objects.filter(id=pk).first()
        if not student:
            return Response({'detail': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'name' in request.data:
            student.name = request.data['name']
        if 'mobile' in request.data:
            student.mobile = request.data['mobile']
        if 'address' in request.data:
            student.address = request.data['address']
        if 'monthlyFee' in request.data:
            student.monthly_fee = int(request.data['monthlyFee'])
        elif 'monthly_fee' in request.data:
            student.monthly_fee = int(request.data['monthly_fee'])
        if 'category' in request.data:
            student.category = request.data['category']
        student.save()
        return Response(StudentSerializer(student).data)

class StudentDeactivateView(APIView):
    def post(self, request, pk):
        student = Student.objects.filter(id=pk).first()
        if student:
            student.is_active = False
            student.save()
            return Response(StudentSerializer(student).data)
        return Response({'detail': 'Not found'}, status=404)

class StudentActivateView(APIView):
    def post(self, request, pk):
        student = Student.objects.filter(id=pk).first()
        if student:
            student.is_active = True
            student.save()
            return Response(StudentSerializer(student).data)
        return Response({'detail': 'Not found'}, status=404)

class PlansView(APIView):
    def get(self, request):
        plans = Plan.objects.all()
        return Response(PlanSerializer(plans, many=True).data)

class SubscriptionsView(APIView):
    def get(self, request):
        student_id = request.query_params.get('studentId')
        subs = Subscription.objects.all()
        if student_id:
            subs = subs.filter(student_id=student_id)
        return Response(SubscriptionSerializer(subs, many=True).data)

class StudentSubscriptionView(APIView):
    def get(self, request, student_id):
        sub = Subscription.objects.filter(student_id=student_id).order_by('-last_date').first()
        if sub:
            return Response(SubscriptionSerializer(sub).data)
        return Response(None)

class PaymentsView(APIView):
    def get(self, request):
        student_id = request.query_params.get('studentId')
        payments = Payment.objects.all().order_by('-date')
        if student_id:
            payments = payments.filter(student_id=student_id)
        return Response(PaymentSerializer(payments, many=True).data)

    def post(self, request):
        student_id = request.data.get('studentId')
        student = Student.objects.filter(id=student_id).first()
        if not student:
            return Response({'detail': 'Student not found'}, status=404)

        amount = int(request.data.get('amount') or getattr(student, 'monthly_fee', 3500))
        method = request.data.get('paymentMethod', 'CASH').upper()
        reference_number = str(request.data.get('referenceNumber', '')).strip().upper()
        payment_date = request.data.get('date', get_today_ist().isoformat())
        p_status = request.data.get('status', 'SUCCESS')
        notes = request.data.get('notes', '')

        if not reference_number:
            if method == 'CASH':
                reference_number = f"CASH-{date.today().strftime('%y%m%d')}-{random.randint(1000, 9999)}"
            else:
                return Response({'detail': 'Please provide the UPI Transaction Reference / UTR number for UPI payment.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Check duplicate reference number anti-scam
            if Payment.objects.filter(reference_number__iexact=reference_number).exists():
                return Response({
                    'detail': f'Anti-Scam Alert: Reference / UTR "{reference_number}" has already been recorded in the database. Duplicate payment rejected.'
                }, status=status.HTTP_400_BAD_REQUEST)

        receipt_number = f"RCP-{date.today().year}-{random.randint(1000, 9999)}"
        new_pay_id = f"pay-{random.randint(100000, 999999)}"

        payment = Payment.objects.create(
            id=new_pay_id,
            student=student,
            amount=amount,
            payment_method=method,
            reference_number=reference_number,
            status=p_status,
            date=payment_date,
            receipt_number=receipt_number,
            notes=notes
        )

        # If payment is successful, activate / renew subscription
        if p_status == 'SUCCESS':
            plan = Plan.objects.first()
            if not plan:
                plan = Plan.objects.create(
                    id='plan-standard-30',
                    name='Standard Monthly Plan (Pure Veg)',
                    price=student.monthly_fee,
                    duration_days=30
                )

            start_d = date.today()
            current_sub = Subscription.objects.filter(student=student).order_by('-last_date').first()
            if current_sub and current_sub.last_date >= date.today():
                start_d = current_sub.last_date + timedelta(days=1)

            last_d = calculate_last_date(start_d, plan.duration_days)
            new_sub_id = f"sub-{random.randint(100000, 999999)}"

            new_sub = Subscription.objects.create(
                id=new_sub_id,
                student=student,
                plan=plan,
                start_date=start_d,
                last_date=last_d,
                status=get_subscription_status(start_d, last_d)
            )
            student.current_subscription_id = new_sub.id
            student.save()

            # Create notification for student
            Notification.objects.create(
                id=f"notif-{random.randint(100000, 999999)}",
                user_id=student.user_id,
                title=f"Payment Received: ₹{amount:,} ({method})",
                message=f"Subscription activated till {last_d.strftime('%d-%b-%Y')}. Receipt: {receipt_number} • Ref: {reference_number}",
                is_read=False
            )

        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

class LeavesView(APIView):
    def get(self, request):
        student_id = request.query_params.get('studentId')
        leaves = LeaveRequest.objects.all().order_by('-start_date')
        if student_id:
            leaves = leaves.filter(student_id=student_id)
        return Response(LeaveRequestSerializer(leaves, many=True).data)

    def post(self, request):
        student_id = request.data.get('studentId')
        start_date = request.data.get('startDate')
        end_date = request.data.get('endDate')
        reason = request.data.get('reason')
        l_status = request.data.get('status', 'PENDING')
        admin_note = request.data.get('adminNote')

        student = Student.objects.filter(id=student_id).first()
        if not student:
            return Response({'detail': 'Student not found'}, status=404)

        s_date = date.fromisoformat(start_date)
        e_date = date.fromisoformat(end_date)
        days = inclusive_days(s_date, e_date)

        leave = LeaveRequest.objects.create(
            id=f"leave-{random.randint(100000, 999999)}",
            student=student,
            start_date=s_date,
            end_date=e_date,
            days_count=days,
            reason=reason,
            status=l_status,
            admin_note=admin_note
        )

        # If leave is created directly as APPROVED by admin, automatically extend subscription
        if l_status == 'APPROVED':
            sub = Subscription.objects.filter(student=student).order_by('-last_date').first()
            if sub:
                old_last = sub.last_date
                new_last = old_last + timedelta(days=days)
                sub.last_date = new_last
                sub.status = get_subscription_status(sub.start_date, new_last)
                sub.save()

                LeaveExtension.objects.create(
                    id=f"ext-{random.randint(100000, 999999)}",
                    student=student,
                    subscription=sub,
                    old_last_date=old_last,
                    new_last_date=new_last,
                    days_added=days,
                    status='APPROVED',
                    note=f"Approved leave ({s_date.strftime('%d-%b')} to {e_date.strftime('%d-%b')}): +{days} days"
                )

                Notification.objects.create(
                    id=f"notif-{random.randint(100000, 999999)}",
                    user_id=student.user_id,
                    title=f"Leave Approved (+{days} Days Extended)",
                    message=f"Your mess leave has been approved! Pass validity extended by {days} days till {new_last.strftime('%d-%b-%Y')}.",
                    is_read=False
                )

        return Response(LeaveRequestSerializer(leave).data, status=status.HTTP_201_CREATED)

class LeaveStatusUpdateView(APIView):
    def patch(self, request, pk):
        leave = LeaveRequest.objects.filter(id=pk).first()
        if not leave:
            return Response({'detail': 'Leave request not found'}, status=404)

        prev_status = leave.status
        new_status = request.data.get('status')
        admin_note = request.data.get('adminNote')

        if new_status:
            leave.status = new_status
        if admin_note is not None:
            leave.admin_note = admin_note
        leave.save()

        # When admin verifies and marks leave as APPROVED, automatically extend student subscription!
        if new_status == 'APPROVED' and prev_status != 'APPROVED':
            student = leave.student
            sub = Subscription.objects.filter(student=student).order_by('-last_date').first()
            if sub:
                days_to_add = leave.days_count
                old_last = sub.last_date
                new_last = old_last + timedelta(days=days_to_add)
                sub.last_date = new_last
                sub.status = get_subscription_status(sub.start_date, new_last)
                sub.save()

                LeaveExtension.objects.create(
                    id=f"ext-{random.randint(100000, 999999)}",
                    student=student,
                    subscription=sub,
                    old_last_date=old_last,
                    new_last_date=new_last,
                    days_added=days_to_add,
                    status='APPROVED',
                    note=f"Automatic extension for approved leave ({leave.start_date.strftime('%d-%b')} to {leave.end_date.strftime('%d-%b')}): +{days_to_add} days"
                )

                Notification.objects.create(
                    id=f"notif-{random.randint(100000, 999999)}",
                    user_id=student.user_id,
                    title=f"Leave Approved (+{days_to_add} Days Extended)",
                    message=f"Admin marked your leave ({leave.start_date.strftime('%d-%b-%Y')} to {leave.end_date.strftime('%d-%b-%Y')}) as Approved. Your subscription has been extended by {days_to_add} days till {new_last.strftime('%d-%b-%Y')}!",
                    is_read=False
                )

        return Response(LeaveRequestSerializer(leave).data)

class ExtensionsView(APIView):
    def get(self, request):
        student_id = request.query_params.get('studentId')
        extensions = LeaveExtension.objects.all().order_by('-created_at')
        if student_id:
            extensions = extensions.filter(student_id=student_id)
        return Response(LeaveExtensionSerializer(extensions, many=True).data)

class EligibleExtensionsView(APIView):
    def get(self, request):
        today = get_today_ist()
        students = Student.objects.filter(is_active=True)
        eligible_items = []

        for s in students:
            sub = Subscription.objects.filter(student=s).order_by('-last_date').first()
            if not sub:
                continue

            approved_leaves = [
                {'start_date': l.start_date, 'end_date': l.end_date, 'status': l.status}
                for l in LeaveRequest.objects.filter(student=s, status='APPROVED')
            ]

            eligibility = check_leave_eligibility(
                sub.start_date,
                sub.last_date,
                approved_leaves,
                today
            )

            if eligibility['is_eligible']:
                eligible_items.append({
                    'student': StudentSerializer(s).data,
                    'subscription': SubscriptionSerializer(sub).data,
                    'eligibility': {
                        'isEligible': eligibility['is_eligible'],
                        'maxConsecutiveDays': eligibility['max_consecutive_days'],
                        'eligibleDays': eligibility['eligible_days'],
                        'leaveDaysCount': eligibility['leave_days_count'],
                        'mergedRanges': [
                            {
                                'startDate': r['start_date'],
                                'endDate': r['end_date'],
                                'daysCount': r['days_count']
                            }
                            for r in eligibility['merged_ranges']
                        ],
                        'qualifyingRanges': [
                            {
                                'startDate': r['start_date'],
                                'endDate': r['end_date'],
                                'daysCount': r['days_count']
                            }
                            for r in eligibility['qualifying_ranges']
                        ]
                    }
                })

        return Response(eligible_items)

class ReviewExtensionView(APIView):
    def post(self, request):
        student_id = request.data.get('studentId')
        subscription_id = request.data.get('subscriptionId')
        rev_status = request.data.get('status', 'APPROVED')
        days_added = int(request.data.get('daysAdded', 0))
        note = request.data.get('note', '')

        sub = Subscription.objects.filter(id=subscription_id).first()
        student = Student.objects.filter(id=student_id).first()
        if not sub or not student:
            return Response({'detail': 'Subscription or student not found'}, status=404)

        old_last_date = sub.last_date
        new_last_date = old_last_date

        if rev_status == 'APPROVED' and days_added > 0:
            new_last_date = old_last_date + timedelta(days=days_added)
            sub.last_date = new_last_date
            sub.status = get_subscription_status(sub.start_date, new_last_date)
            sub.save()

        ext = LeaveExtension.objects.create(
            id=f"ext-{random.randint(100000, 999999)}",
            student=student,
            subscription_id=subscription_id,
            old_last_date=old_last_date,
            new_last_date=new_last_date,
            days_added=days_added if rev_status == 'APPROVED' else 0,
            status=rev_status,
            note=note
        )

        return Response(LeaveExtensionSerializer(ext).data, status=status.HTTP_201_CREATED)

class NotificationsView(APIView):
    def get(self, request):
        user_id = request.query_params.get('userId')
        notifs = Notification.objects.all().order_by('-created_at')
        if user_id:
            notifs = notifs.filter(user_id=user_id)
        return Response(NotificationSerializer(notifs, many=True).data)

class RazorpayCreateOrderView(APIView):
    def post(self, request):
        from .razorpay_service import create_order
        amount = float(request.data.get('amount', 3500))
        student_id = request.data.get('studentId', 'stud-01')
        student = Student.objects.filter(id=student_id).first()
        student_name = student.name if student else 'Student'

        order = create_order(amount, student_id, student_name)
        return Response(order, status=status.HTTP_200_OK)

class RazorpayVerifyPaymentView(APIView):
    def post(self, request):
        from .razorpay_service import verify_payment_signature
        from .firebase_service import notify_payment_received
        from .dates import calculate_last_date, get_subscription_status

        student_id = request.data.get('studentId')
        rzp_order_id = request.data.get('razorpay_order_id', '')
        rzp_payment_id = request.data.get('razorpay_payment_id', f"pay_rzp_{uuid.uuid4().hex[:10]}")
        rzp_signature = request.data.get('razorpay_signature', '')
        amount = float(request.data.get('amount', 3500))

        is_valid = verify_payment_signature(rzp_order_id, rzp_payment_id, rzp_signature)
        if not is_valid:
            return Response({'error': 'Invalid payment signature'}, status=status.HTTP_400_BAD_REQUEST)

        student = Student.objects.filter(id=student_id).first()
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        # 1. Create Payment Record
        receipt_num = f"RCP-{date.today().strftime('%Y%m')}-{random.randint(1000, 9999)}"
        payment = Payment.objects.create(
            id=f"pay-{random.randint(100000, 999999)}",
            student=student,
            amount=amount,
            payment_method='ONLINE',
            status='SUCCESS',
            reference_number=rzp_payment_id,
            receipt_number=receipt_num,
            payment_date=date.today(),
            notes='Razorpay Online Payment (₹3,500 Pure Veg Plan)'
        )

        # 2. Activate / Extend Subscription
        active_sub = Subscription.objects.filter(student=student, status='ACTIVE').first()
        if active_sub:
            new_last_date = active_sub.last_date + timedelta(days=30)
            active_sub.last_date = new_last_date
            active_sub.status = get_subscription_status(active_sub.start_date, new_last_date)
            active_sub.save()
        else:
            sub_start = date.today()
            sub_last = calculate_last_date(sub_start, 30)
            Subscription.objects.create(
                id=f"sub-{random.randint(100000, 999999)}",
                student=student,
                plan_id='plan-standard-30',
                start_date=sub_start,
                last_date=sub_last,
                status=get_subscription_status(sub_start, sub_last)
            )

        # 3. Create Notification
        Notification.objects.create(
            id=f"notif-{random.randint(100000, 999999)}",
            user_id=student.user.id,
            title='₹3,500 Payment Received (Razorpay)',
            message=f"Receipt {receipt_num} generated. Your 30-day subscription is active!",
            is_read=False
        )

        # 4. Trigger Firebase Cloud Messaging
        notify_payment_received(student.name, amount, receipt_num)

        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

class FirebaseRegisterTokenView(APIView):
    def post(self, request):
        user_id = request.data.get('userId')
        fcm_token = request.data.get('fcmToken')
        return Response({'success': True, 'userId': user_id, 'status': 'registered'}, status=status.HTTP_200_OK)

class PasswordChangeView(APIView):
    def post(self, request):
        mobile = str(request.data.get('mobile', '')).strip()
        new_password = str(request.data.get('newPassword', '')).strip()
        
        if not mobile and hasattr(request, 'user') and request.user and getattr(request.user, 'is_authenticated', False):
            mobile = getattr(request.user, 'mobile', '')

        if not new_password or len(new_password) < 6:
            return Response({'detail': 'New password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        user = UserAccount.objects.filter(mobile=mobile).first()
        if not user:
            return Response({'detail': 'User with registered mobile not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.password = new_password
        user.save()
        return Response({'success': True, 'message': 'Password updated successfully!'}, status=status.HTTP_200_OK)

class StaffView(APIView):
    def get(self, request):
        staff_members = UserAccount.objects.filter(role='MESS_STAFF').order_by('-created_at')
        return Response(UserAccountSerializer(staff_members, many=True).data)

    def post(self, request):
        name = request.data.get('name', '').strip()
        mobile = str(request.data.get('mobile', '')).strip()
        password = str(request.data.get('password', 'staff123')).strip()

        if not name or not mobile:
            return Response({'detail': 'Staff name and 10-digit mobile number are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if UserAccount.objects.filter(mobile=mobile).exists():
            return Response({'detail': 'A staff member or user with this mobile already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        new_id = f"staff-{random.randint(100, 999)}"
        staff = UserAccount.objects.create(
            id=new_id,
            branch_id='branch-main-01',
            mobile=mobile,
            name=name,
            role='MESS_STAFF',
            password=password
        )
        return Response(UserAccountSerializer(staff).data, status=status.HTTP_201_CREATED)

class StaffDetailView(APIView):
    def delete(self, request, pk):
        staff = UserAccount.objects.filter(id=pk, role='MESS_STAFF').first()
        if not staff:
            return Response({'detail': 'Staff member not found.'}, status=status.HTTP_404_NOT_FOUND)
        staff.delete()
        return Response({'success': True, 'message': 'Staff member removed.'}, status=status.HTTP_200_OK)

class UpiPaymentSubmitView(APIView):
    def post(self, request):
        student_id = request.data.get('studentId')
        student = Student.objects.filter(id=student_id).first()
        if not student:
            return Response({'detail': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        amount = int(request.data.get('amount') or getattr(student, 'monthly_fee', 3500))
        utr_number = str(request.data.get('utrNumber') or request.data.get('referenceNumber', '')).strip().upper()
        upi_app = request.data.get('upiApp', 'PhonePe')
        notes = request.data.get('notes', f'Direct UPI Transfer via {upi_app}')

        # Validation: UTR must be at least 10 characters and alphanumeric
        if not utr_number or len(utr_number) < 10 or not utr_number.isalnum():
            return Response({
                'detail': 'Invalid UTR Number. Please enter the valid 12-digit UPI UTR / Transaction Reference number found in your UPI app.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Anti-scam check: Ensure UTR is not already used in DB
        if Payment.objects.filter(reference_number__iexact=utr_number).exists():
            return Response({
                'detail': f'Anti-Scam Alert: UPI Transaction UTR "{utr_number}" has already been claimed for another payment in our system! Duplicate submission detected. If this is an error, please contact Hiremat Mess Admin.'
            }, status=status.HTTP_400_BAD_REQUEST)

        receipt_number = f"RCP-{date.today().year}{date.today().month:02d}-{random.randint(1000, 9999)}"
        new_pay_id = f"pay-upi-{random.randint(100000, 999999)}"

        payment = Payment.objects.create(
            id=new_pay_id,
            student=student,
            amount=amount,
            payment_method='UPI',
            reference_number=utr_number,
            status='SUCCESS',
            date=date.today(),
            receipt_number=receipt_number,
            notes=f"{notes} • UTR: {utr_number}"
        )

        # Activate or extend 30-day subscription
        plan = Plan.objects.first()
        if not plan:
            plan = Plan.objects.create(
                id='plan-standard-30',
                name='Standard Monthly Plan (Pure Veg)',
                price=student.monthly_fee,
                duration_days=30
            )

        start_d = date.today()
        current_sub = Subscription.objects.filter(student=student, status='ACTIVE').order_by('-last_date').first()
        if current_sub and current_sub.last_date >= date.today():
            start_d = current_sub.last_date + timedelta(days=1)

        last_d = calculate_last_date(start_d, plan.duration_days)
        new_sub = Subscription.objects.create(
            id=f"sub-{random.randint(100000, 999999)}",
            student=student,
            plan=plan,
            start_date=start_d,
            last_date=last_d,
            status=get_subscription_status(start_d, last_d)
        )
        student.current_subscription_id = new_sub.id
        student.save()

        # In-app notification
        Notification.objects.create(
            id=f"notif-{random.randint(100000, 999999)}",
            user_id=student.user_id,
            title=f"Direct UPI Payment Received (₹{amount:,})",
            message=f"Pass activated till {last_d.strftime('%d-%b-%Y')}. Receipt: {receipt_number} • UTR: {utr_number}",
            is_read=False
        )

        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

class FoodFeedbackView(APIView):
    def get(self, request):
        student_id = request.query_params.get('studentId')
        if student_id:
            feedbacks = FoodFeedback.objects.filter(student_id=student_id).order_by('-created_at')
        else:
            feedbacks = FoodFeedback.objects.all().order_by('-created_at')[:50]
        return Response(FoodFeedbackSerializer(feedbacks, many=True).data)

    def post(self, request):
        student_id = request.data.get('studentId')
        meal_type = request.data.get('mealType', 'LUNCH')
        rating = int(request.data.get('rating', 5))
        tags = request.data.get('tags', '')
        comments = request.data.get('comments', '').strip()

        student = Student.objects.filter(id=student_id).first()
        if not student:
            return Response({'detail': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        if rating < 1 or rating > 5:
            return Response({'detail': 'Rating must be between 1 and 5 stars.'}, status=status.HTTP_400_BAD_REQUEST)

        feedback_id = f"fb-{random.randint(100000, 999999)}"
        feedback = FoodFeedback.objects.create(
            id=feedback_id,
            branch_id=student.branch_id or 'branch-main-01',
            student=student,
            meal_type=meal_type,
            rating=rating,
            tags=tags,
            comments=comments
        )
        return Response(FoodFeedbackSerializer(feedback).data, status=status.HTTP_201_CREATED)

class SendOtpView(APIView):
    def post(self, request):
        mobile = str(request.data.get('mobile', '')).strip()
        purpose = request.data.get('purpose', 'Password Reset')

        if not mobile or len(mobile) != 10 or not mobile.isdigit():
            return Response({'detail': 'Please provide a valid 10-digit mobile number.'}, status=status.HTTP_400_BAD_REQUEST)

        user = UserAccount.objects.filter(mobile=mobile).first()
        if not user:
            return Response({'detail': 'No registered account found with this mobile number.'}, status=status.HTTP_404_NOT_FOUND)

        # Generate 6-digit OTP
        otp = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timedelta(minutes=5)

        # Invalidate old OTPs for this mobile
        OTPVerification.objects.filter(mobile=mobile, is_verified=False).delete()

        # Save new OTP
        OTPVerification.objects.create(
            id=f"otp-{random.randint(100000, 999999)}",
            mobile=mobile,
            otp=otp,
            purpose=purpose,
            expires_at=expires_at,
            is_verified=False,
            attempts=0
        )

        # Send via SMS service
        sms_result = send_otp_sms(mobile, otp, purpose)

        return Response({
            'success': True,
            'message': f"OTP sent successfully to +91 ******{mobile[-4:]}",
            'mobile': mobile,
            'whatsappUrl': sms_result.get('whatsappUrl'),
            'expiresIn': 300
        }, status=status.HTTP_200_OK)


class VerifyOtpAndResetPasswordView(APIView):
    def post(self, request):
        mobile = str(request.data.get('mobile', '')).strip()
        otp = str(request.data.get('otp', '')).strip()
        new_password = str(request.data.get('newPassword', '')).strip()

        if not mobile or not otp or not new_password:
            return Response({'detail': 'Mobile, 6-digit OTP, and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({'detail': 'New password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        user = UserAccount.objects.filter(mobile=mobile).first()
        if not user:
            return Response({'detail': 'User account not found.'}, status=status.HTTP_404_NOT_FOUND)

        record = OTPVerification.objects.filter(mobile=mobile, is_verified=False).order_by('-created_at').first()
        if not record:
            return Response({'detail': 'No active OTP found. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        if timezone.now() > record.expires_at:
            record.delete()
            return Response({'detail': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        if record.attempts >= 5:
            record.delete()
            return Response({'detail': 'Too many incorrect attempts. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        if record.otp != otp:
            record.attempts += 1
            record.save()
            return Response({'detail': f'Incorrect OTP. {5 - record.attempts} attempt(s) remaining.'}, status=status.HTTP_400_BAD_REQUEST)

        # OTP is correct!
        record.is_verified = True
        record.save()

        # Update user's password
        user.password = new_password
        user.save()

        # Create security notification
        Notification.objects.create(
            id=f"notif-{random.randint(100000, 999999)}",
            user_id=user.id,
            title='Password Changed Successfully',
            message='Your Hiremat Mess account password was recently changed via OTP verification.',
            is_read=False
        )

        return Response({
            'success': True,
            'message': 'Password successfully reset! You can now log in with your new password.'
        }, status=status.HTTP_200_OK)


class SendReminderView(APIView):
    def post(self, request):
        student_id = request.data.get('studentId')
        broadcast = request.data.get('broadcast', False)

        targets = []
        if broadcast:
            # All active students with subscriptions expiring in <= 3 days or expired
            students = Student.objects.filter(is_active=True)
            for s in students:
                sub = Subscription.objects.filter(student=s).order_by('-last_date').first()
                if sub:
                    days_left = (sub.last_date - date.today()).days
                    if days_left <= 3:
                        targets.append((s, sub, days_left))
                else:
                    # No sub
                    targets.append((s, None, 0))
        elif student_id:
            s = Student.objects.filter(id=student_id).first()
            if not s:
                return Response({'detail': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)
            sub = Subscription.objects.filter(student=s).order_by('-last_date').first()
            days_left = (sub.last_date - date.today()).days if sub else 0
            targets.append((s, sub, days_left))
        else:
            return Response({'detail': 'Please provide studentId or broadcast=true.'}, status=status.HTTP_400_BAD_REQUEST)

        sent_records = []
        for s, sub, days_left in targets:
            last_date_str = sub.last_date.strftime('%d-%b-%Y') if sub else 'N/A'
            sms_res = send_renewal_reminder_sms(s.mobile, s.name, days_left, last_date_str)

            # In-app notification
            Notification.objects.create(
                id=f"notif-{random.randint(100000, 999999)}",
                user_id=s.user_id,
                title='Subscription Renewal Reminder' if days_left > 0 else 'Subscription Expired Notice',
                message=sms_res.get('reminderText', f"Your mess plan expires on {last_date_str}. Renew via Direct UPI."),
                type='WARNING' if days_left > 0 else 'ALERT',
                is_read=False
            )

            # Trigger Firebase push
            notify_subscription_expiring(s.name, max(0, days_left))

            sent_records.append({
                'studentId': s.id,
                'name': s.name,
                'mobile': s.mobile,
                'daysLeft': days_left,
                'whatsappUrl': sms_res.get('whatsappUrl'),
                'reminderText': sms_res.get('reminderText')
            })

        return Response({
            'success': True,
            'message': f"Renewal reminders dispatched to {len(sent_records)} student(s).",
            'reminders': sent_records
        }, status=status.HTTP_200_OK)


class PasswordResetRequestSubmitView(APIView):
    def post(self, request):
        mobile = str(request.data.get('mobile', '')).strip()
        requested_pwd = str(request.data.get('requestedPassword', request.data.get('newPassword', ''))).strip()
        reason = str(request.data.get('reason', '')).strip()

        if not mobile or len(mobile) != 10 or not mobile.isdigit():
            return Response({'detail': 'Please provide a valid 10-digit registered mobile number.'}, status=status.HTTP_400_BAD_REQUEST)

        if not requested_pwd or len(requested_pwd) < 6:
            return Response({'detail': 'New password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        user = UserAccount.objects.filter(mobile=mobile).first()
        if not user:
            return Response({'detail': 'No registered account found with this mobile number. Please check with Mess Admin.'}, status=status.HTTP_404_NOT_FOUND)

        student = Student.objects.filter(mobile=mobile).first() or (Student.objects.filter(id=user.student_id).first() if user.student_id else None)

        req_id = f"pw-req-{random.randint(10000, 99999)}"
        reset_req = PasswordResetRequest.objects.create(
            id=req_id,
            mobile=mobile,
            student_name=user.name,
            student=student,
            requested_password=requested_pwd,
            status='PENDING',
            admin_note=reason
        )

        # Notify Admin in-app
        Notification.objects.create(
            id=f"notif-{random.randint(100000, 999999)}",
            user_id='user-admin',
            title=f"🔑 Password Reset Request: {user.name}",
            message=f"{user.name} (+91 {mobile}) requested to reset their password. Please verify and accept.",
            type='WARNING',
            is_read=False
        )

        import urllib.parse
        msg = f"ನಮಸ್ಕಾರ Admin, I have submitted a password reset request for my Hiremat Mess account (+91 {mobile}). Please verify and accept."
        whatsapp_url = f"https://api.whatsapp.com/send?phone=919353198281&text={urllib.parse.quote(msg)}"

        return Response({
            'success': True,
            'message': 'Password reset request submitted successfully! Awaiting Admin verification.',
            'requestId': reset_req.id,
            'whatsappUrl': whatsapp_url,
            'data': PasswordResetRequestSerializer(reset_req).data
        }, status=status.HTTP_201_CREATED)


class PasswordResetRequestsListView(APIView):
    def get(self, request):
        status_param = request.query_params.get('status')
        qs = PasswordResetRequest.objects.all().order_by('-created_at')
        if status_param:
            qs = qs.filter(status=status_param.upper())
        return Response(PasswordResetRequestSerializer(qs, many=True).data)


class PasswordResetRequestApproveView(APIView):
    def post(self, request, pk):
        reset_req = PasswordResetRequest.objects.filter(id=pk).first()
        if not reset_req:
            return Response({'detail': 'Password reset request not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_pwd = str(request.data.get('newPassword', '')).strip() or reset_req.requested_password
        admin_note = str(request.data.get('adminNote', '')).strip()

        user = UserAccount.objects.filter(mobile=reset_req.mobile).first()
        if not user:
            return Response({'detail': 'Associated user account not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Update official user password
        user.password = new_pwd
        user.save()

        # Update request record
        reset_req.status = 'APPROVED'
        reset_req.approved_at = timezone.now()
        if admin_note:
            reset_req.admin_note = admin_note
        reset_req.save()

        # Notify student in-app
        Notification.objects.create(
            id=f"notif-{random.randint(100000, 999999)}",
            user_id=user.id,
            title="Password Reset Approved",
            message=f"Your password reset request has been verified and approved by Admin Ramesh Sharma. You can now log in.",
            type='INFO',
            is_read=False
        )

        import urllib.parse
        msg = f"ನಮಸ್ಕಾರ {reset_req.student_name},\nYour Hiremat Mess Davangere password reset request has been APPROVED by Mess Admin.\nYour new password is: {new_pwd}\n\n📍 BIET Rd, Davangere\n📞 Contact: 9353198281"
        whatsapp_url = f"https://api.whatsapp.com/send?phone=91{reset_req.mobile}&text={urllib.parse.quote(msg)}"

        return Response({
            'success': True,
            'message': f"Password updated successfully for {reset_req.student_name}!",
            'whatsappUrl': whatsapp_url,
            'data': PasswordResetRequestSerializer(reset_req).data
        }, status=status.HTTP_200_OK)


class PasswordResetRequestRejectView(APIView):
    def post(self, request, pk):
        reset_req = PasswordResetRequest.objects.filter(id=pk).first()
        if not reset_req:
            return Response({'detail': 'Password reset request not found.'}, status=status.HTTP_404_NOT_FOUND)

        admin_note = str(request.data.get('adminNote', '')).strip()
        reset_req.status = 'REJECTED'
        if admin_note:
            reset_req.admin_note = admin_note
        reset_req.save()

        return Response({
            'success': True,
            'message': f"Password reset request rejected for {reset_req.student_name}.",
            'data': PasswordResetRequestSerializer(reset_req).data
        }, status=status.HTTP_200_OK)


class AnnouncementsView(APIView):
    def get(self, request):
        announcements = Announcement.objects.all().order_by('-created_at')
        return Response(AnnouncementSerializer(announcements, many=True).data)

    def post(self, request):
        title = request.data.get('title', '').strip()
        message = request.data.get('message', '').strip()
        ann_type = request.data.get('type', 'NOTICE')
        effective_date_str = request.data.get('effectiveDate')
        created_by = request.data.get('createdBy', 'Hiremat Mess Admin')

        if not title or not message:
            return Response({'detail': 'Title and message are required.'}, status=status.HTTP_400_BAD_REQUEST)

        effective_date = None
        if effective_date_str:
            try:
                effective_date = datetime.strptime(str(effective_date_str)[:10], '%Y-%m-%d').date()
            except Exception:
                effective_date = None

        new_id = f"ann-{random.randint(100000, 999999)}"
        announcement = Announcement.objects.create(
            id=new_id,
            branch_id='branch-main-01',
            title=title,
            message=message,
            type=ann_type,
            effective_date=effective_date,
            created_by=created_by
        )

        # Broadcast in-app notification to all active students
        type_prefix = {
            'MESS_OFF': '🔴 [Mess Holiday Notice]',
            'SPECIAL_DINNER': '🌟 [Special Dinner / Holige Feast]',
            'NOTICE': '📢 [Mess Announcement]'
        }.get(ann_type, '📢 [Mess Announcement]')

        active_students = Student.objects.filter(is_active=True)
        date_suffix = f" (Date: {effective_date.strftime('%d-%b-%Y')})" if effective_date else ""
        notifs = [
            Notification(
                id=f"notif-{random.randint(100000, 999999)}-{s.id[-4:]}",
                user_id=s.user_id,
                title=f"{type_prefix} {title}",
                message=f"{message}{date_suffix}",
                is_read=False
            )
            for s in active_students if s.user_id
        ]
        if notifs:
            Notification.objects.bulk_create(notifs)

        return Response(AnnouncementSerializer(announcement).data, status=status.HTTP_201_CREATED)


class AnnouncementDetailView(APIView):
    def delete(self, request, pk):
        ann = Announcement.objects.filter(id=pk).first()
        if not ann:
            return Response({'detail': 'Announcement not found.'}, status=status.HTTP_404_NOT_FOUND)
        ann.delete()
        return Response({'success': True, 'message': 'Announcement deleted successfully.'})



