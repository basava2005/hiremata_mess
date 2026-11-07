import psycopg2

DATABASE_URL = 'postgresql://neondb_owner:npg_wfrmjYZ7b5PM@ep-long-pine-bdbuqzsy-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require'

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

sample_student_ids = [f"stud-{i:02d}" for i in range(1, 21)]
sample_user_ids = [f"user-stud-{i:02d}" for i in range(1, 21)]

print(f"Deleting sample records for {len(sample_student_ids)} demo students...")

# 1. Delete notifications for sample users
cur.execute("DELETE FROM core_notification WHERE user_id = ANY(%s);", (sample_user_ids,))
print("Deleted notifications:", cur.rowcount)

# 2. Delete leave extensions for sample students
cur.execute("DELETE FROM core_leaveextension WHERE student_id = ANY(%s);", (sample_student_ids,))
print("Deleted leave extensions:", cur.rowcount)

# 3. Delete leave requests for sample students
cur.execute("DELETE FROM core_leaverequest WHERE student_id = ANY(%s);", (sample_student_ids,))
print("Deleted leave requests:", cur.rowcount)

# 4. Delete payments for sample students
cur.execute("DELETE FROM core_payment WHERE student_id = ANY(%s);", (sample_student_ids,))
print("Deleted payments:", cur.rowcount)

# 5. Delete subscriptions for sample students
cur.execute("DELETE FROM core_subscription WHERE student_id = ANY(%s);", (sample_student_ids,))
print("Deleted subscriptions:", cur.rowcount)

# 6. Delete food feedback
cur.execute("DELETE FROM core_foodfeedback WHERE student_id = ANY(%s);", (sample_student_ids,))
print("Deleted food feedbacks:", cur.rowcount)

# 7. Delete sample students from core_student
cur.execute("DELETE FROM core_student WHERE id = ANY(%s);", (sample_student_ids,))
print("Deleted sample students:", cur.rowcount)

# 8. Delete sample users from core_useraccount
cur.execute("DELETE FROM core_useraccount WHERE id = ANY(%s);", (sample_user_ids,))
print("Deleted sample user accounts:", cur.rowcount)

conn.commit()

# Verify what remains
cur.execute("SELECT id, name, mobile FROM core_student;")
remaining_students = cur.fetchall()
print("\n--- Remaining Students in Neon ---")
for s in remaining_students:
    print(s)

cur.execute("SELECT id, name, mobile, role FROM core_useraccount;")
remaining_users = cur.fetchall()
print("\n--- Remaining User Accounts in Neon ---")
for u in remaining_users:
    print(u)

cur.execute("SELECT count(*) FROM core_subscription;")
print("Remaining Subscriptions:", cur.fetchone()[0])

cur.execute("SELECT count(*) FROM core_payment;")
print("Remaining Payments:", cur.fetchone()[0])

cur.close()
conn.close()
print("\nSuccessfully cleaned all sample data!")
