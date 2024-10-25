import aiohttp
import asyncio
from bs4 import BeautifulSoup
from funcs.conf import settings

# URL страницы, которую будем проверять
url = settings.PARSER_URL
search_string = settings.SEARCH_STRING

# Прятки от 403
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"}

# че знаем?
known_files = set()

def print_parser(str):
    print("[Site_parser] " + str)

# Асинхронная функция для проверки новых файлов
async def check_for_new_links(search_string):

    global known_files

    try:

        skip_it = 0
        # Асинхронно отправляем GET-запрос на сайт
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                # Проверяем статус ответа
                if response.status != 200:
                    print_parser(f"Ошибка доступа к сайту: {response.status}")
                    return

                # Получаем и парсим HTML страницы
                text = await response.text()
                soup = BeautifulSoup(text, 'html.parser')

                # Ищем ссылки на файлы
                file_links = soup.find_all('a', string=search_string, href=True)

                # делаем набор
                new_files = set()

                # определяем в него все что нашли
                for link in file_links:
                    href = link['href']
                    new_files.add(href)
                
                # сравниваем с тем что было(если было)
                    if new_files - known_files:
                        skip_it = 0
                    else:
                        skip_it = 1
                
                # указываем что такое было и работаем дальше
                known_files = new_files

            if skip_it != 1 :

                # преобразуем набор в список, дабы обратиться по номеру
                files = list(known_files)
                print_parser("Обновление расписания...")

                #                                _> номер файла с основным расписанием в списке new_files
                async with session.get(files[1], headers=headers) as resp:
                    if resp.status == 200:
                        with open('main.pdf', 'wb') as fd:
                            async for chunk in resp.content.iter_chunked(10):
                                 fd.write(chunk)

                #                                _> номер файла с заменами в списке new_files
                async with session.get(files[-1], headers=headers) as resp:
                    if resp.status == 200:
                        with open('replacerments.pdf', 'wb') as fd:
                            async for chunk in resp.content.iter_chunked(10):
                                 fd.write(chunk)
            else :
                print_parser("Обновление расписания остановлено; изменений не найдено")
                 
    except aiohttp.ClientError as e:
        print_parser(f"Ошибка при доступе к сайту: {e}")

# Асинхронная функция для периодической проверки
async def periodic_check(interval):
    while True:
        await check_for_new_links(search_string)
        await asyncio.sleep(interval)  # Ждем указанное время перед следующей проверкой
