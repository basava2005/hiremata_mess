from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import date, timedelta
import random

from .models import UserAccount, Student, Plan, Subscription, Payment, LeaveRequest, LeaveExtension, Notification
from .serializers import (
    UserAccountSerializer, StudentSerializer, PlanSerializer,
    SubscriptionSerializer, PaymentSerializer, LeaveRequestSerializer,
    LeaveExtensionSerializer, NotificationSerializer
)
from .dates import calculate_last_date, inclusive_days, get_today_ist, get_subscription_status
from .eligibility import check_leave_eligibility

class LoginView(APIView):
    def post(self, request):
        mobile = request.data.get('mobile')
        password = request.data.get('password')

        user = UserAccount.objects.filter(mobile=mobile).first()
        if not user:
            return Response({'detail': 'User with this mobile number does not exist'}, status=status.HTTP_404_NOT_FOUND)

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
        mobile = request.data.get('mobile')
        address = request.data.get('address')

        new_id = f"stud-{int(date.today().strftime('%m%d%H%M'))}-{random.randint(100, 999)}"
        user_id = f"user-{new_id}"

        # Create linked user
        user = UserAccount.objects.create(
            id=user_id,
            mobile=mobile,
            name=name,
            role='STUDENT',
            student_id=new_id
        )

        student = Student.objects.create(
            id=new_id,
            user_id=user_id,
            name=name,
            mobile=mobile,
            address=address,
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
        amount = int(request.data.get('amount', 3500))
        method = request.data.get('paymentMethod', 'UPI')
        reference_number = request.data.get('referenceNumber', '')
        payment_date = request.data.get('date', get_today_ist().isoformat())
        p_status = request.data.get('status', 'SUCCESS')
        notes = request.data.get('notes', '')

        student = Student.objects.filter(id=student_id).first()
        if not student:
            return Response({'detail': 'Student not found'}, status=404)

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
                plan = Plan.objects.create()

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
        return Response(LeaveRequestSerializer(leave).data, status=status.HTTP_201_CREATED)

class LeaveStatusUpdateView(APIView):
    def patch(self, request, pk):
        leave = LeaveRequest.objects.filter(id=pk).first()
        if not leave:
            return Response({'detail': 'Not found'}, status=404)

        if 'status' in request.data:
            leave.status = request.data['status']
        if 'adminNote' in request.data:
            leave.admin_note = request.data['adminNote']
        leave.save()
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
