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


def visualizer(request):
    """Music player with live audio visualizer view."""
    paginator = Paginator(Song.objects.all(), 1)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    context = {'page_obj': page_obj}
    return render(request, 'Buzz/music_player_visualizer.html', context)