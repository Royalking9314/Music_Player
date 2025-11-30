from django.shortcuts import render
from .models import Song
from django.core.paginator import Paginator

# Create your views here.
def index(request):
    paginator = Paginator(Song.objects.all(), 1)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    context = {'page_obj': page_obj}
    return render(request, 'index.html', context)


def modern_player(request):
    """Modern music player view with audio visualizer"""
    paginator = Paginator(Song.objects.all(), 1)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    context = {'page_obj': page_obj}
    return render(request, 'modern_player.html', context)