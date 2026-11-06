from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('core.urls')),
    path('', include('core.urls')),  # Fallback for direct API calls without /api/v1 prefix
]
