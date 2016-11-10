require('./app/index')


// Express server
const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const app = express();

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (request, response) => {
    // Render takes two paremeters, first is name of view and second is data you want to render
    response.render('home', {
        name: 'A-money'
    })
});

app.listen(3000);
