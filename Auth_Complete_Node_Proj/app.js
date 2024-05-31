require("dotenv").config(); // env variables
require("express-async-errors"); // No need for try catch in the controllers

// express
const express = require("express");
const app = express();

// rest of the packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// database
const connectDB = require("./db/connect");

//routers
const authRoute = require("./routes/authRoutes");
const userRoute = require("./routes/userRoutes");

// middleware
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");

const PORT = process.env.PORT || 5000;

app.use(morgan("tiny"));
app.use(express.json()); // before route
app.use(cookieParser(process.env.JWT_SECRET));
app.get("/", (req, res) => {
    res.send("<h1>E-Commerce API</h1>");
});

app.use("/api/v1/auth", authRoute);

// can have authentication middleware over here as well because all userRoute needs to be authenticated.
// app.use("/api/v1/users", authenticateUser, userRoute);
app.use("/api/v1/users", userRoute);

// after route
app.use(notFound); // overriding notFound feature of express
app.use(errorHandler); // overriding error feature of express and it should be placed at the end after not found

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL);
        app.listen(PORT, console.log(`Server is listening at port ${PORT}...`));
    } catch (e) {
        console.log(e);
    }
};

start();
