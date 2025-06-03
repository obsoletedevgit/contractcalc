const express = require('express');
const path = require('path');
const dotenv = require('dotenv').config();

const app = express();

//Resource routes
app.use('/', express.static(path.resolve("src/client")));

//Pages routes
app.use('/landing', express.static(path.resolve("src/client/pages/landing")));

//GET pages
app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve("src/client/pages/landing/index.html"));
});

app.listen(process.env.PORT, () =>{
    console.log("listening on: ", process.env.PORT);
})