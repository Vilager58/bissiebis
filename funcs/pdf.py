import re
import pdfplumber

def extract_table(path, page, table):
    pdf = pdfplumber.open(path)
    table_page = pdf.pages[page]
    table = table_page.extract_tables()[table]
    return table

def table_worker(path, group, selector):

    table = extract_table(path, 0, 1)
    table_string = ''
    for row_num in range(len(table)):
        row = table[row_num]
        cleaned_row = [item.replace('\n', ' ') if item is not None and '\n' in item else 'None' if item is None else item for item in row]
        table_string+=('|'+'|'.join(cleaned_row)+'|'+'\n')
    table_string = table_string[:-1]

    #получаем построчный список
    worktab = re.split("\n+", table_string)
    selectors = []
    
    for i in range(0, len(worktab)):

        #примерно отображаем че выходит
        #print(worktab[i])

        #размечаем заголовки
        if re.search(selector, worktab[i]) != None:
            selectors.append(i)
            #print("match as selector")
            if re.search(group, worktab[i]) != None:
                groupid = re.search(group, worktab[i])
                group_row = i
    
    #находим кол-во колонок
    columns = re.findall(fr'{selector} [\w\s()\-]+', worktab[group_row])
    columns_count = len(columns)

    #рабочая колонка
    for i in range(0, columns_count):
        if re.search(group, columns[i]) != None:
            column_curr = i
            #print(columns[i])


    # диапазон строк
    for i in range(0, len(selectors) - 1):
        if group_row == selectors[-1]:
            rage = len(worktab)
        elif group_row == selectors[i]:
            rage = selectors[i + 1]
            break
    
    #вытаскиваем пары АААХАХХАХА ржака
    lessons = []

    for i in range(group_row + 1, rage):
        data = worktab[i]
        data_columns = data.split("|")
        data_columns = [col for col in data_columns if col]
        
        for z in range(0, len(data_columns), 3):
            lesson = []
            lesson.append(data_columns[z])
            lesson.append(data_columns[z+1])
            if lesson[1] != 'нет':
                lesson.append(data_columns[z+2])
            else:
                data_columns.insert(z + 2, ' ')
                lesson.append(data_columns[z+2])

            lessons.append(lesson)

    #for i in range(0, len(lessons)):
        #print(lessons[i])
    
    #получили все пары, берем что ищем
    Find_lessons = []
    for i in range(column_curr, len(lessons), columns_count):
         Find_lessons.append(lessons[i])

    print(Find_lessons)

    return groupid, group_row, rage, column_curr, columns_count



print(table_worker("24.pdf", "ИС-11", "группа"))