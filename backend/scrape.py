import urllib.request
import re

url = 'https://en.wikipedia.org/wiki/Road_signs_in_Indonesia'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    images = re.findall(r'<img[^>]+src=\"([^\"]+)\"[^>]*>', html)
    for src in images:
        if 'Indonesia' in src or 'sign' in src.lower() or 'Rambu' in src:
            print(f'SRC: https:{src}')
except Exception as e:
    print(e)
