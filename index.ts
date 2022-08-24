//Описание скрипта - на входе мы имеем 3 разных id, которым соответствуют 3м фильмам, которые лежат на сервере TMDB. 
// Наша задача получить названия по этим фильмам из TMDB и записать их в локальную БД.
import axios from 'axios';
const mysql = require('mysql')

const filmsId: Array<number> = [157336, 155, 268]

// 1.Подключаемся к mySQL, проверяем, что наша таблица пуста

function checkDB(comand: string): void {
    const connection = mysql.createConnection({
        host: '127.0.0.1',
        port: "3306",
        user: 'root',
        password: 'password',
        database: 'Projects'
    })

    connection.connect(err => {
        if (err) {
            console.log(err)
        }

    })
    console.log('Проверяю таблицу в БД...')
    if (comand !== '') {
        connection.query(comand, (error, result, field) => {
            if (error) {
                console.log(error)
            }
            if (result.length === 0) {
                console.log('Таблица пуста, начинаю загрузку данных с TMDB...')
                loadFilms()
            }
            if (result.length > 0) {
                console.log('Тут уже что-то есть, сотрите лишние данные из таблицы и тогда мы продолжим')
            }
        })
    }
    else {
        console.log('Задайте запрос!')
    }
    connection.end()
}

// 2. Делаем запрос фильма из TMDB, сохраняем названия в массив
function loadFilms(): void {
    for (let i = 0; i < 3; i++) {
        getFilmInfo(filmsId[i])
    }
}

const filmsArray: string[] = []

async function getFilmInfo(id: number) {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=b40bcd1b7a69127917daf2a39a52c832&language=en-US`)
    interface Film {
        title: string
    }
    const film: Film = {
        title: response.data.title,
    }
    filmsArray.push(film.title)
    console.log(`Загружен фильм ${filmsArray.length} из TMDB...`)
    if (filmsArray.length === 3) {
        console.log('Все фильмы загружены, начинаю отправку на БД...')
        for (let i = 0; i < 3; i++) {
            pushFilmsToDB(`INSERT INTO best_films (title) values('${filmsArray[i]}');`, i)
        }
    }
}

// 3. Записываем данные в БД
function pushFilmsToDB(comand: string, counter: number) {
    const connection = mysql.createConnection({
        host: '127.0.0.1',
        port: "3306",
        user: 'root',
        password: 'password',
        database: 'Projects'
    })

    connection.connect(err => {
        if (err) {
            console.log(err)
        }

    })

    connection.query(comand, (error, result, field) => {
        if (error) {
            console.log(error)
        }
        if (result) {
            console.log(`В базу данных загружен фильм ${counter}`)
            if (counter === 2) {
                console.log('Таблица успешно заполнена!')
                finalCheckDB('SELECT * FROM best_films;')
            }
        }

    })
    connection.end()
}

//4.После заполнения таблицы вызваем из неё данные для проверки
function finalCheckDB(comand: string): void {
    const connection = mysql.createConnection({
        host: '127.0.0.1',
        port: "3306",
        user: 'root',
        password: 'password',
        database: 'Projects'
    })

    connection.connect(err => {
        if (err) {
            console.log(err)
        }
    })
    connection.query(comand, (error, result, field) => {
        if (error) {
            console.log(error)
        }
        else {
            console.log(result)
        }
    })
    connection.end()
}

checkDB('SELECT * FROM best_films;')
