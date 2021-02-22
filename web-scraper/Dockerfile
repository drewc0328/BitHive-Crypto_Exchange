FROM python:3.8

ADD main.py .

RUN pip install requests beautifulsoup4 pymongo[srv] python-dotenv

CMD ["python", "./main.py"]