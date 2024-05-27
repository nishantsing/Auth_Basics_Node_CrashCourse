const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

app.set("view-engine", "ejs");
// Change the directory for views
// app.set('views', path.join(__dirname, 'templates'));

app.get("/", (req, res) => {
    res.render("index.ejs", { name: "Nishant" });
});

app.listen(PORT, console.log(`Server running at ${PORT}`));
