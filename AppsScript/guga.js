function doGet(request) {
  // Get request params.
  var sheetName = request.parameters.sheet;
  var callback = request.parameters.callback;

  // Parse the spreadsheet.
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);

  data = find(sheet);

  // Write and return the response.
  var response = JSON.stringify({
      groups: data
  });

  var output = ContentService.createTextOutput();
  if (callback == undefined) {
      // Serve as JSON
      output.setContent(response).setMimeType(ContentService.MimeType.JSON);
  } else {
      // Serve as JSONP
      output.setContent(callback + "(" + response + ")")
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return output;
}

function find(sheet) {
  // создание фильтра для поиска по разделителю - №
  Logger.log(sheet.getName())
  let ranges = sheet
      .createTextFinder("№")
      .matchEntireCell(true)
      .matchCase(true)
      .matchFormulaText(false)
      .ignoreDiacritics(true)
      .findAll();

  let schedule = [];

  // для каждого ("№")
  ranges.forEach(function (range) {

      // обьявление и очистка
      let glessons = [];
      let gname = '';
      let counter = 1;


      gname = sheet.getRange(range.getRow(), range.getColumn() + 1).getValue();
      row = range.getRow();
      col = range.getColumn();
      while (sheet.getRange(row + counter, col).getValue() !== "№" || sheet.getRange(row + counter, col + 1).getValue() !== "" ) {
          if(sheet.getRange(row + counter, col).getValue() == '№') break;
          if(sheet.getRange(row + counter, col).getValue() == '' & sheet.getRange(row + counter, col + 1).getValue() == "" ) break;
          let lesson_data = String(sheet.getRange(row + counter, col + 1).getValue()).split("\n");
          let place_data = String(sheet.getRange(row + counter, col + 2).getValue()).split("\n");
          
          if(sheet.getRange(row + counter, col + 1).getValue() == ""){
            lesson_data = ["нет", "нет"];
            
          };
          lesson_data = lesson_data.filter(function (str) {
              return /\S/.test(str);
          });
          lesson_data = obtain_YP(lesson_data);
          place_data = place_data.filter(function (str) {
              return /\S/.test(str);
          });
          if (lesson_data.length <= 4) {
              place = place_obtain(place_data);

              // обрабатывает три заглавные в строке
              let filtr = RegExp("[А-Я]", 'g');
              let mdk_filtr = RegExp('мдк', 'i');
              if (lesson_data.length >= 3) {
                if(lesson_data[1].match(filtr) != undefined & lesson_data[2].match(filtr) != undefined){
                  if(lesson_data[1].match(mdk_filtr) == undefined & lesson_data[2].match(mdk_filtr)== undefined){
                    if (lesson_data[1].match(filtr).length == 3 & lesson_data[2].match(filtr).length == 3) {
                      lesson_data.splice(2, 0, lesson_data[0]);
                    };
                  }
               };
              }

          } else {
              let wprog = lesson_data.splice(0, 2, lesson_data[0] + lesson_data[1]);
              lesson_data.splice(2, 1, wprog[0] + lesson_data[2]);
              place = place_obtain(place_data);
              if (place.length == 1) {
                  place.splice(1, 0, place[0]);
              }

          };

          for (let i = 0; i < lesson_data.length; i += 2) {
              let c = i / 2;
              let lesson = {
                  num: counter,
                  lname: lesson_data[i],
                  lteach: space_clean(lesson_data[i + 1]),
                  lplace: place[c],
              };
              if(!lesson.lname.includes("нет")){
                glessons.push(lesson);
              }
          };
          place = [];
          counter++;
      };
      if(gname != ''){
        let groups = {
          name: gname,
          lessons: glessons };
          schedule.push(groups)
      
      }
      counter = 1;
      

  });

  return schedule;
}

function place_obtain(place_data) {
  let place = [];
  for (let i = 0; i < place_data.length; i++) {
      if (place_data[i].includes("кор")) {
          place.push(place_data[i - 1] + " " + place_data[i]);
          place.splice(i - 1, 1);
      } else place.push(place_data[i]);
  };
  return place
};

function obtain_YP(data) {
  let filtr = RegExp("[А-Я]", 'g');
  let ug_filtr = RegExp("[0-9]п.", 'i');
  let cours_filtr = RegExp('курсовой', 'i')
  let shift_filtr = RegExp('смена', 'i')
  let names = 0;

  for (let i = 0; i < data.length; i++) {
      if (data[i].match(filtr) !== null) {
          if (data[i].match(filtr).length == 3 & !data[i].includes("МДК")) {
              names++;
          }
      }
  };

  for (let i = 0; i < data.length; i++) {
      if (data[i] != undefined) {
          if (data[i].match(cours_filtr) !== null){
              data.splice(i - 1, 2, data[i - 1] + ' ' + data[i]);
            }
          }
      };

  for (let i = 0; i < data.length; i++) {
      if (data[i] != undefined) {
          if (data[i].match(shift_filtr) !== null & data.length < 4){
              data.splice(i - 1, 2, data[i - 1] + ' ' + data[i]);
            }
          }
      };


  if (data[0].includes("УП") & names == 1 & data.length == 4) {
      data.splice(2, 0, data[data.length - 1]);

  } else if (data[0].includes("УП") & data.length <= 3 & names == 1) {

  } else if (data[0].includes("УП") & data.length <= 3) {
      if (data[1] == undefined) data[1] = '';
      data.splice(0, 2, data[0] + data[1]);
  } else if(ug_filtr.test(data[1])){
     let ug_lesson = data[0];
     let ug_teacher = data[1];
     let ug = data[1].substr(-4, 4);
     data = [];
     data.push(ug_lesson + ug, ug_teacher.replace(ug, ''));
  };
  

  return data;
};

function space_clean(str) {
  if (!str) return str;
  return str.replace(/^\s+|\s+$/g, '');
}


function readData_(spreadsheet, sheetName, properties, startRowNum) {
  if (typeof properties == "undefined") {
      properties = getHeaderRowKeys_(spreadsheet, sheetName);
  }

  var rows = getDataRows_(spreadsheet, sheetName, startRowNum);
  var data = [];
  for (var r = 0, l = rows.length; r < l; r++) {
      var row = rows[r];
      var record = {};
      for (var p in properties) {
          record[properties[p]] = row[p];
      }
      data.push(record);
  }
  return data;
}


function run(request) {
  return(doGet(request).getContent().toString());
}

let lists = getlistnames();
let some = {};

function run_obtain() {

let resp = {'groups': []};
lists.forEach((list) => {
  let some = run({ parameters: {
          sheet: list,
      }
  })
  some = JSON.parse(some);
  some.groups.forEach((groups) => resp.groups.push(groups))
});
 return JSON.stringify(resp);
}

function numofmonth(str){
 let months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сент', 'окт', 'ноя', 'дек'];
 for(month in months){
  if(str.includes(months[month])){
    month++;
    if(month < 10) month = 0 + String(month);
    return String(month);
  }
}
}

function onOpen() {
var ui = SpreadsheetApp.getUi();
ui.createMenu('Публикация в базу')
  .addItem('Выгрузить', 'onEdt')
  .addToUi();
}

function onEdt(){
let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Export');
let dates = [];

for(list in lists){
let sh_date_find = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lists[list]);

let yr = String(new Date().getFullYear());
let date_finder = sh_date_find.createTextFinder(yr).findAll();

if(date_finder[0] != undefined){
  let date = date_finder[1].getValue().split(' ');
  if(date[0] <= 9) date[0] = '0' + String(date[0]);
  date = date[0] + '.' + numofmonth(date[1]) + '.' + date[2];
  dates.push(date);
  }
}

let table = sheet.getRange(1, 1, 7, 2).getValues()
let used = 1;
if(new Set(dates).size !== 1){
  Logger.log(dates)
  SpreadsheetApp.getUi().alert("Даты не совпадают, проверьте все даты на листах");
  return 'Ошибка дат'
}

for (row in table){
  if(table[row][0] != ''){
    if(table[row][0].includes(dates[0])){
    break
    } else used++;
  }
  
}
Logger.log('использовано: ' + String(used))

if(used == 7){
  sheet.getRange(1, 1, 7, 2).clear();
  used = 0;
}

let date_cell = sheet.getRange(used, 1);
let data_cell = sheet.getRange(used, 2);

date_cell.setValue(dates[0]);
data_cell.setValue(run_obtain());
SpreadsheetApp.getUi().alert("День добавлен или обновлен");

}

function getlistnames(){
let sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
let sheetnames = [];
for (sheet in sheets){
  let list = sheets[sheet].getName()
  if(!list.includes('Export')){
     sheetnames.push(list)
  }
}
return sheetnames
}