#!/usr/bin/env bash
# Render Build Script for Hiremat Mess Django Backend
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
python manage.py seed_data

