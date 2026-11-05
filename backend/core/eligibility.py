from datetime import date, timedelta
from typing import List, Dict, Any
from .dates import get_today_ist, inclusive_days

def check_leave_eligibility(
    subscription_start: date,
    subscription_last: date,
    approved_leaves: List[Dict[str, Any]],
    reference_date: date = None
) -> Dict[str, Any]:
    """
    RULES:
    - Eligible when there are at least 10 consecutive APPROVED leave days inside subscription period.
    - Merge back-to-back leaves (next starts the day after previous ends).
    - Count overlaps once.
    - Clip to subscription period.
    - Count only past dates (dates on or before reference_date).
    - Ignore pending, rejected, cancelled.
    """
    if reference_date is None:
        reference_date = get_today_ist()

    if not subscription_start or not subscription_last or not approved_leaves:
        return {
            'is_eligible': False,
            'max_consecutive_days': 0,
            'eligible_days': 0,
            'leave_days_count': 0,
            'merged_ranges': [],
            'qualifying_ranges': [],
        }

    # Collect unique dates using a set
    unique_dates = set()

    for leave in approved_leaves:
        # Only approved leaves
        status = leave.get('status')
        if status != 'APPROVED':
            continue

        l_start = leave.get('start_date')
        l_end = leave.get('end_date')
        if not l_start or not l_end:
            continue

        # Clip start to subscription start
        effective_start = max(l_start, subscription_start)
        # Clip end to subscription last and reference date (past only)
        effective_end = min(l_end, subscription_last, reference_date)

        if effective_start > effective_end:
            continue

        curr = effective_start
        while curr <= effective_end:
            unique_dates.add(curr)
            curr += timedelta(days=1)

    sorted_dates = sorted(list(unique_dates))
    if not sorted_dates:
        return {
            'is_eligible': False,
            'max_consecutive_days': 0,
            'eligible_days': 0,
            'leave_days_count': 0,
            'merged_ranges': [],
            'qualifying_ranges': [],
        }

    # Merge consecutive days
    merged_ranges = []
    range_start = sorted_dates[0]
    prev_date = sorted_dates[0]

    for d in sorted_dates[1:]:
        if (d - prev_date).days == 1:
            prev_date = d
        else:
            merged_ranges.append({
                'start_date': range_start.isoformat(),
                'end_date': prev_date.isoformat(),
                'days_count': inclusive_days(range_start, prev_date)
            })
            range_start = d
            prev_date = d

    merged_ranges.append({
        'start_date': range_start.isoformat(),
        'end_date': prev_date.isoformat(),
        'days_count': inclusive_days(range_start, prev_date)
    })

    qualifying_ranges = [r for r in merged_ranges if r['days_count'] >= 10]
    is_eligible = len(qualifying_ranges) > 0
    max_consecutive = max([r['days_count'] for r in merged_ranges], default=0)
    eligible_days = sum([r['days_count'] for r in qualifying_ranges])

    return {
        'is_eligible': is_eligible,
        'max_consecutive_days': max_consecutive,
        'eligible_days': eligible_days,
        'leave_days_count': len(sorted_dates),
        'merged_ranges': merged_ranges,
        'qualifying_ranges': qualifying_ranges,
    }

