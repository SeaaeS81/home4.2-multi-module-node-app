

//адаптированный код
//npm install axios библиотеку axios
//random-dog возвращает случайное изображение собаки.
//random-dog/<порода> возвращает случайное изображение собаки указанной породы.
//random-dog-subbreed/<порода>/<подпорода> возвращает случайное изображение собаки указанной подпороды.

const http = require('http');
const url = require('url');
const fs = require('fs');
const axios = require('axios');
const editModule = require('./editModule');
const addModule = require('./addModule');
const getModule = require('./getModule');
const removeModule = require('./removeModule');
const events = require('./events');

http.createServer(async (req, res) => {
    const path = url.parse(req.url, true).pathname;

    // Логгер
    const log = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        time: new Date(),
    };
    fs.appendFileSync('log.json', JSON.stringify(log) + '\n');

    if (path === '/random-dog') {
        const response = await axios.get('https://dog.ceo/api/breeds/image/random');
        res.write(response.data.message);
    } else if (path.startsWith('/random-dog/')) {
        const breed = path.split('/')[2];
        const response = await axios.get(`https://dog.ceo/api/breed/${breed}/images/random`);
        res.write(response.data.message);
    } else if (path.startsWith('/random-dog-subbreed/')) {
        const parts = path.split('/');
        const breed = parts[2];
        const subBreed = parts[3];
        const response = await axios.get(`https://dog.ceo/api/breed/${breed}/${subBreed}/images/random`);
        res.write(response.data.message);
    } else if (req.method === 'POST' && path === '/upload') {
        const fileStream = fs.createWriteStream('./uploadedFile');
        req.pipe(fileStream);
        res.end('File uploaded');
        events.emit('fileUploaded');
    } else if (req.method === 'GET' && path.startsWith('/download/')) {
        const filename = path.split('/')[2]; // получаем имя файла из URL
        const fileStream = fs.createReadStream(`./${filename}`);
        fileStream.pipe(res);
        events.emit('fileDownloaded');
    } else if (path === '/edit') {
        res.write(editModule(/* параметры */));
    } else if (path === '/add') {
        res.write(addModule(/* параметры */));
    } else if (path === '/get') {
        res.write(getModule(/* параметры */));
    } else if (path === '/remove') {
        res.write(removeModule(/* параметры */));
    } else {
        res.write('404 Not Found');
    }

    res.end();
}).listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});

events.on('fileUploaded', () => {
    console.log('File was uploaded');
});

events.on('fileDownloaded', () => {
    console.log('File was downloaded');
});