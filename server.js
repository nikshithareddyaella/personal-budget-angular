const express= require('express');
const app= express();
const port = 3000;

app.use('/', express.static('public'));

const budgetData = require("./bdata-source.json")

app.get('/hello', (req, res)=> {
    res.send('Hello World!');
});

app.get('/budget', (req, res)=> {
    res.json(budgetData);
});

app.listen(port, () =>{
    console.log(`Example app listening at http://localhost:${port}`);
});