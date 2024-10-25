import pygsheets
import numpy as np
import asyncio

gc = pygsheets.authorize(service_file='service.json')

# Open spreadsheet and then worksheet
sh = gc.open('bissiebis')
wks = sh.sheet1


# Update a cell with value (just to let him know values is updated ;) )
wks.update_value('A1', "Hey yank this numpy array")
my_nparray = np.random.randint(10, size=(3, 4))
