
// рабоба
let learning = false;
async function main() {
    $.ajaxSetup({ cache: false });
    let data = await update_data();
    if(localStorage.getItem('entries') == null){
        localStorage.setItem('entries', 1);
    } else {
        let s = Number(localStorage.getItem('entries')) + 1
        localStorage.setItem('entries', s);
        if((s == 5 || s == 10) & !localStorage.getItem('feed')){
            feedback();
        }
    }
};
// обращения к серверу
async function update_data() {
    notify("add", "Загрузка", "Обновление данных..."); 
    
    const scriptUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSxraUPIhMpBoDFLePyCHJM9hTQNUlP0EdHRLkl0UtDULVTYiHE3D8qCtvo8NqFELBFO3dpMsJrfnhO/pubhtml?gid=377065937&single=true';
    $.ajax({
        url: scriptUrl,
        method: 'GET',
        dataType: 'html',
        success: function (response) {
            notify("clear");
            notify("add", "Готово", "Данные получены!"); 
            storage('add', parse_data(response));
            storage("load");
            jump_day();

            return response;
            
        },
        error: function (error) {
            console.error("Ошибка при получении данных", error);
            notify("clear"); 
            notify("add", "Ошибка", "Успех!");
        }
    });
    
};
// Парсинг таблицы
function parse_data(data){
    let rw_data = $(data).find("td");
    cl_data = [];
    len = rw_data.length;
    for(let i = 0; i < len; i+=2){
      let it = {}
      if(rw_data[i].textContent.match(dateReg) != null){
        it['date'] = rw_data[i].textContent;
        it['data'] = rw_data[i + 1].textContent;
        cl_data.push(it);
      }
    }
    return cl_data
};
// работа с данными
function storage(mode, data){
   switch(mode){
    case 'load':
        len = localStorage.length;
        for(let i = 0; i<len; i++){
            let key = localStorage.key(i);
            if(key.match(dateReg) != null){
                dates[key] = JSON.parse(localStorage[key])
            }
        }
        return dates
    case 'add':
        len = data.length;
        for(let i = 0; i<len; i++){
            localStorage.setItem(data[i].date, data[i].data)
        }
        break
   }
};
// обработка массива расписания
function obtain_schedule(data) {
  $(".card_holder").empty();
  selector = localStorage.getItem("st_selector");
  filter = localStorage.getItem("st_filter");
   if (!localStorage.getItem("st_selector") | !localStorage.getItem("st_filter")){
    localStorage.setItem("st_filter", 'filter');
    notify("clear");
    notify("add", "Ошибка", "Укажите фильтр в настройках!");
    setup_sel_menu(data);
  } else if(dates[s_date] == undefined){
        
  } else {
    
    switch(selector){
        case 'group':
            addlesson(data.groups.find(group => group.name.includes(filter)));
            break
        case 'teacher':
            let rw_lessons = [];
            for(let i = 0; i <= data.groups.length - 1; i++){
                for(let x = 0; x <= data.groups[i].lessons.length - 1; x++){
                    if(data.groups[i].lessons[x].lteach != undefined){
                        if(data.groups[i].lessons[x].lteach.includes(filter)){
                            let tmp_lesson = data.groups[i].lessons[x];
                            tmp_lesson['group_name'] = (data.groups[i].name.replace('группа ', ''));
                            rw_lessons.push(tmp_lesson);
                       };
                    };
                };
               };

                let t_lessons = {
                    lessons : rw_lessons.sort(function(a, b) {return a.num - b.num;}),
                }
            addlesson(t_lessons);
            break
        case 'place':
            let rw_lplace = [];
            for(let i = 0; i <= data.groups.length - 1; i++){
                for(let x = 0; x <= data.groups[i].lessons.length - 1; x++){
                    if(data.groups[i].lessons[x].lplace != undefined){
                        if(data.groups[i].lessons[x].lplace.includes(filter)){
                            let tmp_lesson = data.groups[i].lessons[x];
                            tmp_lesson['group_name'] = (data.groups[i].name.replace('группа ', ''));
                            rw_lplace.push(tmp_lesson);
                       };
                    };
                };
               };

                let pl_lessons = {
                    lessons : rw_lplace.sort(function(a, b) {return a.num - b.num;}),
                }
            addlesson(pl_lessons);

            break
    }
    if(obtained == false) setup_sel_menu(data);

    obtained = true;
    
  };
    
};
// сборка уроков
function addlesson(data) {
    let lessons = data.lessons
    for (let i = 0; i < Object.keys(lessons).length; i++) {
        if (lessons[i].num == 0) {
            break;
        };
        

        // Создаем карточку
        const card = $('<div class="lesson-card-horizontal"></div>');
        card.attr('id', i);

        //добавим номер
        const num = $('<div class="number"></div>');
        num.append(`<p class="lesson-number">${lessons[i].num}</p>`);
        card.append(num);

        //закидываем данные предмета
        const lesson = $('<div class="lesson-info"></div>');
        lesson.append(`<h2 class="lesson-name">${lessons[i].lname}</h2>`);
        //посчитать время надо бы

        //lesson.append(`<h2 class="lesson-time">${leson[i].start} - ${leson[i].end}</h2>`);
        card.append(lesson);

        //доп сведения
        const place = $('<div class="lesson-place"></div>');
        //имя учителя
        
        const classrom = $('<h2 class="classroom"></h2>');
        
        if(lessons[i].lplace != undefined){
            classrom.append('<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 50 50" id="home"><path fill="#fff" d="M 24.962891 1.0546875 A 1.0001 1.0001 0 0 0 24.384766 1.2636719 L 1.3847656 19.210938 A 1.0005659 1.0005659 0 0 0 2.6152344 20.789062 L 4 19.708984 L 4 46 A 1.0001 1.0001 0 0 0 5 47 L 18.832031 47 A 1.0001 1.0001 0 0 0 19.158203 47 L 30.832031 47 A 1.0001 1.0001 0 0 0 31.158203 47 L 45 47 A 1.0001 1.0001 0 0 0 46 46 L 46 19.708984 L 47.384766 20.789062 A 1.0005657 1.0005657 0 1 0 48.615234 19.210938 L 41 13.269531 L 41 6 L 35 6 L 35 8.5859375 L 25.615234 1.2636719 A 1.0001 1.0001 0 0 0 24.962891 1.0546875 z M 25 3.3222656 L 44 18.148438 L 44 45 L 32 45 L 32 26 L 18 26 L 18 45 L 6 45 L 6 18.148438 L 25 3.3222656 z M 37 8 L 39 8 L 39 11.708984 L 37 10.146484 L 37 8 z M 20 28 L 30 28 L 30 45 L 20 45 L 20 28 z"></path><svg>');
            classrom.append(`<p>${lessons[i].lplace}</p>`);
        }

        place.append(classrom);
        card.append(place);

        const details = $('<div class="lesson-card-details"></div>');
        

        const teacher = $('<h2 class="teacher-name"></h2>');
        if(lessons[i].group_name != undefined){
            teacher.append(`<p>${lessons[i].group_name}</p>`);
        }
        if(lessons[i].lteach != undefined){
            teacher.append(`<p>${lessons[i].lteach}</p>`);
        }
        

        details.append(teacher);
        card.append(details);
        
        // Добавляем карточку в контейнер
        if(!lessons[i].lname.includes('нет')) $(".card_holder").append(card);;
    }
};
// управление меню
function resizeNav() {
    $("#nav-fullscreen").css({
        "height": window.innerHeight
    });

    var radius = Math.sqrt(Math.pow(window.innerHeight, 2) + Math.pow(window.innerWidth, 2));
    var diameter = radius * 2;
    $("#nav-overlay").width(diameter);
    $("#nav-overlay").height(diameter);
    $("#nav-overlay").css({
        "margin-top": -radius,
        "margin-left": -radius
    });
};
// динамический фон
function setup_background() {
    var w = window.innerWidth,
        h = window.innerHeight,
        canvas = document.getElementById('bg'),
        ctx = canvas.getContext('2d'),
        rate = 60,
        arc = 100,
        time,
        count,
        size = 2,
        speed = 10,
        parts = new Array,
        colors = ['#007b5f', '#1f9a7e', '#1d6051', '#0b573d', '#21b594'];
    var mouse = {
        x: 0,
        y: 0
    };

    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);

    function create() {
        time = 0;
        count = 0;

        for (var i = 0; i < arc; i++) {
            parts[i] = {
                x: Math.ceil(Math.random() * w),
                y: Math.ceil(Math.random() * h),
                toX: Math.random() * 5 - 1,
                toY: Math.random() * 2 - 1,
                c: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * size
            }
        }
    }

    function particles() {
        ctx.clearRect(0, 0, w, h);
        canvas.addEventListener('mousemove', MouseMove, false);
        for (var i = 0; i < arc; i++) {
            var li = parts[i];
            var distanceFactor = 1000;
            var distanceFactor = Math.max(Math.min(15 - (distanceFactor / 10), 10), 1);
            ctx.beginPath();
            ctx.arc(li.x, li.y, li.size * distanceFactor, 0, Math.PI * 2, false);
            ctx.fillStyle = li.c;
            ctx.strokeStyle = li.c;
            if (i % 2 == 0)
                ctx.stroke();
            else
                ctx.fill();

            li.x = li.x + li.toX * (time * 0.05);
            li.y = li.y + li.toY * (time * 0.05);

            if (li.x > w) {
                li.x = 0;
            }
            if (li.y > h) {
                li.y = 0;
            }
            if (li.x < 0) {
                li.x = w;
            }
            if (li.y < 0) {
                li.y = h;
            }


        }
        if (time < speed) {
            time++;
        }
        setTimeout(particles, 1000 / rate);
    }

    function MouseMove(e) {
        mouse.x = e.layerX;
        mouse.y = e.layerY;
    }

    create();
    particles();
};
// уведомления
function notify(mode, text1, text2, color, ico) {
    switch (mode) {
        case "add":
            $('.text-1').text(text1);
            $('.text-2').text(text2);
            toast = document.querySelector(".toast");
            toast.classList.add("active");
            progress.classList.add("active");

            timer1 = setTimeout(() => {
                toast.classList.remove("active");
            }, 2000); //1s = 1000 milliseconds

            timer2 = setTimeout(() => {
                progress.classList.remove("active");
            }, 2300);
            break
        case "clear":
            clearTimeout(timer1);
            clearTimeout(timer2);
            toast.classList.remove("active");
            progress.classList.remove("active");
            break
    }

};

// сборка меню групп\кабинетов\учителей
function setup_sel_menu(data) {
    if(!localStorage.getItem("st_selector")){selector = 'group'; localStorage.setItem("st_selector", "group")} else {selector = localStorage.getItem("st_selector")
    
    }
        $(`input[name="1"][class=${selector}]`).prop('checked', true);
        $('.groups').remove()
        const items = $('<sp class="groups"></sp>');

        switch (selector) {
            case 'group':
                let rw_group = [];
                for (let i = 0; i < data.groups.length; i++) {
                    rw_group.push(data.groups[i].name.replace('группа ', ''));
                };

                rw_group.sort(function (a, b) { return a.localeCompare(b) });

                for(let i = 0; i < rw_group.length; i++){
                    let grp = rw_group[i];
                    const group = $('<sp class="m_btn"></sp>');
                    group.append(grp);
                    items.append(group);
                };

                $('#selector').append(items);
                break
            case 'teacher':
                let teachers = [];
                for (let i = 0; i <= data.groups.length - 1; i++) {
                    for (let y = 0; y <= data.groups[i].lessons.length - 1; y++) {
                            teachers.push(data.groups[i].lessons[y].lteach);
                    };
                };

                teachers = $.grep([...new Set(teachers)], n => n == 0 || n);
                teachers.sort(function (a, b) { return a.localeCompare(b) });

                for (let i = 0; i <= teachers.length - 1; i++) {
                    const teacher = $('<sp class="m_btn"></sp>');
                    if(!teachers[i].includes("нет") & teachers[i].length > 3){
                    teacher.append(teachers[i]);
                    items.append(teacher);
                    };
                };
                $('#selector').append(items);
                break

            case 'place':
                let places = [];
                for (let i = 0; i <= data.groups.length - 1; i++) {
                    for (let y = 0; y <= data.groups[i].lessons.length - 1; y++) {
                        let rw_place = data.groups[i].lessons[y].lplace;
                        if(rw_place != undefined) places.push(rw_place.replace('1 корпус', '').replace('кор.2', '').replace('  ', ''));

                    };
                };
                places = arr = $.grep([...new Set(places)], n => n == 0 || n);
                places.sort();

                for (let i = 0; i <= data.groups.length - 1; i++) {
                    const place = $('<sp class="m_btn"></sp>');
                    place.append(places[i]);
                    items.append(place);
                };

                $('#selector').append(items);
                break

        }
        if(localStorage.getItem("st_filter")){
         // settings>filter =====================================================
         prev_filer = '';
         $('.groups sp').click(function () {
             if ($(this).text() != prev_filer) {
                $('.m_btn.active').toggleClass("active");
                $("#nav-toggle").click();
                if(learning){
                    $('.learn-box').css('opacity', '0');
                    localStorage.setItem('first', false);
                    setTimeout(function(){$('.learn-box').css('display', 'none');}, 2000);
                }
                 prev_filer = $(this).text();
                 localStorage.setItem('st_filter', prev_filer);
                 $(this).toggleClass("active");
                 obtain_schedule(dates[s_date])
                 
             }
         });
         // settings>filter>from_memory ===
         $(`.m_btn:contains("${localStorage.getItem("st_filter")}")`).toggleClass("active");
         // settings>filter>from_memory ===
        
         // settings>filter =====================================================

         //settings>theme =======================================================
         
         //settings>theme =======================================================
        }

         
        
};
// меню выбора даты
function setup_date_picker(today){
    day = [String(today.getDate()).padStart(2, '0'), String(today.getMonth() + 1).padStart(2, '0'), today.getFullYear()]
    $(".data").empty();
    let ned = today.getDay();
    const date = $('<h2 class="day"></h2>');
    const sub = $('<h2 class="sub_date"></h2>');
    date.append(getDate(day[2], day[1], day[0]) + ", " + neds[ned]);

    if(today.getDate() == now.getDate()){
        sub.append('сегодня');
    } else if(today.getDate() == now.getDate() - 1){
        sub.append('вчера');
    } else if(today.getDate() == now.getDate() + 1){
        sub.append('завтра');
    } else if(today.getDate() < now.getDate()){
        sub.append('когда-то');
    } else if(today.getDate() > now.getDate()){
        sub.append('когда-нибудь');
    }


    $(".data").append(date);
    $(".data").append(sub);

};
// сборка по дню
function jump_day(){
    s_date = getDate_str(day[2], day[1], day[0]);
    if(dates[s_date] != undefined){
        $('.no_data').css("opacity", '0');
        $('.card_holder').css("opacity", '1');
        obtain_schedule(dates[s_date]);
        
    } else {
        $('.card_holder').css("opacity", '0');
        $('.no_data').css("opacity", '1');
    }
}
// ооп кому оно надо?
function getDate(year, month, day) {
    var options = {
        month: 'long',
        day: 'numeric',
        timezone: 'UTC'
      };
      return (new Date(year, month - 1, day).toLocaleString("ru", options));
};

function getDate_str(year, month, day) {
    var options = {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        timezone: 'UTC'
      };
      return (new Date(year, month - 1, day).toLocaleString("ru", options));
};


// всякие ивент листеры и тд
function control_events() {
        // меню ================================================================
        $("#nav-toggle").click(function () {
            if(learning){
                $('#help-open').css('opacity', '0');
                
            } 
            
            $("#nav-toggle, #nav-overlay, #nav-fullscreen").toggleClass("open");
        });
        $(window).resize(resizeNav);
        resizeNav();
        // меню ================================================================

        // уведы ===============================================================
        toast = document.querySelector(".toast");
        closeIcon = document.querySelector(".close");
        progress = document.querySelector(".progress");
        // уведы ===============================================================

        // settings>radio ======================================================
        prev_radio = '';
        $('.switch4 label').click(function () {
            if ($(this).prev().attr('class') != prev_radio) {
                prev_radio = $(this).prev().attr('class');
                localStorage.setItem('st_selector', prev_radio);
                if(dates != undefined & dates[s_date] != undefined) setup_sel_menu(dates[s_date]);
                    else setup_sel_menu(dates[Object.keys(dates)[Object.keys(dates).length - 1]])
            }
        });
        //if (localStorage.getItem('settings_selector')) {
        //    $('.' + localStorage.getItem('settings_selector')).prop("checked", true);
        //    setup_sel_menu(data, localStorage.getItem('settings_selector'));
        //}
        // settings>radio ======================================================

        // settings>theme ======================================================
        if(localStorage.getItem("theme")){
            $('.view_').toggleClass("dark")
            $('[name="theme_switch"]').prop('checked', true);

        }

        $('[name="theme_switch"]').click(function () {
            $('.view_').toggleClass("dark")
            if(!localStorage.getItem("theme")) {localStorage.setItem('theme', 'dark')} 
            else localStorage.removeItem('theme');
        });
        // settings>theme ======================================================

        // main>date ===========================================================
        $(".arrow-left-3").click(function () {
            today.setDate(today.getDate() - 1);

            setup_date_picker(today);
            jump_day();
        });
    
        $(".arrow-right-3").click(function () {
            today.setDate(today.getDate() + 1);
            setup_date_picker(today);
            jump_day();
        });
        // main>date ===========================================================


        // режим обучения =======================================================
        if(!localStorage.getItem("first")){
            learning = true;
            learn();
        } else {
            $('.learn-box').css('display', 'none');
        }
        // режим обучения =======================================================
};

function learn(){
$('.learn-box').css('opacity', '1');
$('.decline').on('click', function(){localStorage.setItem("first", false); $('.learn-box').css('opacity', '0'); setTimeout(function(){$('.learn-box').css('display', 'none');}, 2000)})
$('.confirm').on('click', function(){
$('#text').text('Тогда давай найдем тебя)')
$('#help-open').text('<= Открой настройки').css('opacity', '1')
$('input .group').click()
$("#nav-container").css('z-index', 101);
});
}

function feedback(){
$('.learn-box').css('display', 'flex')
$('.learn-box').css('opacity', '1');
$('#text').text('Большой кабина нраица? \n оставь отзыв пж')
$('.decline').on('click', function(){$('.learn-box').css('opacity', '0'); setTimeout(function(){$('.learn-box').css('display', 'none');}, 2000)})
$('.confirm').on('click', function(){
    localStorage.setItem('feed', 'true')
    window.open('https://docs.google.com/forms/d/e/1FAIpQLScJCdOHf693z5MiVOMXwmpAerRgT91IN7-BOfcj2McrnkduIg/viewform?usp=dialog');
});
}

dates = {};
let guga = 0;
let data = '';
let obtained = false;
let today = new Date();
let now = new Date();
let day = [String(today.getDate()).padStart(2, '0'), String(today.getMonth() + 1).padStart(2, '0'), today.getFullYear()]
let neds = [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота'
  ];
  let dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/;

    // старт
    $(document).ready(function () {
        setup_background();
        setup_date_picker(today);
        storage("load");
        control_events();
        jump_day();
        main();
    });