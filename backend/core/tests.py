from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

class MessProApiTests(TestCase):
    def setUp(self):
        from django.core.management import call_command
        call_command('seed_data')
        self.client = APIClient()

    def test_login(self):
        res = self.client.post('/api/v1/auth/login', {'mobile': '8431413551', 'password': 'Chandu@143'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('token', res.data)
        self.assertEqual(res.data['user']['role'], 'BRANCH_ADMIN')

    def test_students_list(self):
        res = self.client.get('/api/v1/students')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 20)

    def test_plans_list(self):
        res = self.client.get('/api/v1/plans')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data[0]['price'], 3500)

    def test_eligible_extensions(self):
        res = self.client.get('/api/v1/extensions/eligible')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Ananya Deshmukh and Aditya Kulkarni should be eligible
        self.assertGreaterEqual(len(res.data), 1)
