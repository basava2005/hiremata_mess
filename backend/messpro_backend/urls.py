from django.contrib import admin
from django.urls import path, re_path, include
from django.http import HttpResponse

def favicon_view(request):
    return HttpResponse(status=204)

urlpatterns = [
    path('favicon.ico', favicon_view, name='favicon'),
    path('admin/', admin.site.urls),
    re_path(r'^api/v1/', include('core.urls')),
    path('', include('core.urls')),  # Fallback for direct API calls without /api/v1 prefix
]
