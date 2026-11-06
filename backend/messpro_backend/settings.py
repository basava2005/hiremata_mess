from pathlib import Path
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from root .env or backend .env
load_dotenv(BASE_DIR.parent / '.env')
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-messpro-secret-key-15803d-super-secure')

DEBUG = True

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'corsheaders',
    # Local Apps
    'core',
]

# Safely check if whitenoise is installed (for Render production vs local development)
try:
    import whitenoise  # noqa: F401
    HAS_WHITENOISE = True
except ImportError:
    HAS_WHITENOISE = False

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
]
if HAS_WHITENOISE:
    MIDDLEWARE.append('whitenoise.middleware.WhiteNoiseMiddleware')

MIDDLEWARE.extend([
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
])

ROOT_URLCONF = 'messpro_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'messpro_backend.wsgi.application'

# Database Configuration (Supports Oracle Cloud / Local, Free Cloud PostgreSQL/MySQL, & SQLite)
USE_ORACLE = os.environ.get('USE_ORACLE', 'False').lower() in ('true', '1', 'yes')
DATABASE_URL = os.environ.get('DATABASE_URL', '').strip()

if USE_ORACLE:
    try:
        import oracledb
        # python-oracledb operates in Thin mode by default (no Instant Client installation required)
    except Exception:
        pass

    wallet_dir = os.environ.get('ORACLE_WALLET_DIR')
    wallet_password = os.environ.get('ORACLE_WALLET_PASSWORD')
    tns_name = os.environ.get('ORACLE_TNS_NAME')

    oracle_options = {'threaded': True}
    if wallet_dir:
        # Oracle Cloud Autonomous Database (ATP / ADW) Wallet configuration
        abs_wallet_dir = str(Path(wallet_dir).resolve()) if not os.path.isabs(wallet_dir) else wallet_dir
        os.environ['TNS_ADMIN'] = abs_wallet_dir
        oracle_options['wallet_location'] = abs_wallet_dir
        if wallet_password:
            oracle_options['wallet_password'] = wallet_password

    # For Oracle Cloud ATP with Wallet: NAME is the service alias from tnsnames.ora (e.g. 'hiremat_high' or 'hiremat_tp')
    # For local Oracle: NAME is the pluggable database service name (e.g. 'FREEPDB1' or 'XEPDB1')
    db_name = tns_name or os.environ.get('ORACLE_SERVICE_NAME', 'FREEPDB1')

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.oracle',
            'NAME': db_name,
            'USER': os.environ.get('ORACLE_USER', 'ADMIN'),
            'PASSWORD': os.environ.get('ORACLE_PASSWORD', 'HirematMess#2026'),
            'HOST': '' if wallet_dir else os.environ.get('ORACLE_HOST', 'localhost'),
            'PORT': '' if wallet_dir else os.environ.get('ORACLE_PORT', '1521'),
            'OPTIONS': oracle_options,
        }
    }
elif DATABASE_URL:
    # 100% Free Cloud Database (e.g. Neon.tech, Supabase, Render, Aiven - NO credit card needed)
    from urllib.parse import urlparse, unquote
    parsed_url = urlparse(DATABASE_URL)
    engine = 'django.db.backends.postgresql' if parsed_url.scheme in ('postgres', 'postgresql') else 'django.db.backends.mysql'
    
    pg_options = {}
    if 'sslmode=require' in DATABASE_URL or 'sslmode=verify-full' in DATABASE_URL:
        pg_options['sslmode'] = 'require'

    DATABASES = {
        'default': {
            'ENGINE': engine,
            'NAME': parsed_url.path[1:],
            'USER': unquote(parsed_url.username or ''),
            'PASSWORD': unquote(parsed_url.password or ''),
            'HOST': parsed_url.hostname,
            'PORT': parsed_url.port or (5432 if 'postgres' in engine else 3306),
            'CONN_MAX_AGE': 0,
            'OPTIONS': pg_options,
        }
    }
else:
    # Default SQLite database (supports custom persistent volume path on cloud hosting)
    sqlite_custom_path = os.environ.get('SQLITE_PATH')
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': Path(sqlite_custom_path).resolve() if sqlite_custom_path else BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
if HAS_WHITENOISE:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
}
