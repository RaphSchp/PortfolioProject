const express = require('express');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.get("/", (req, res) => {
    res.render("login");
});

// Other routes...

const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
