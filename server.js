import express from "express";
import dotenv from "dotenv";
import "express-async-errors";
import morgan from "morgan";
// db and authenticateUser
import connectDB from "./db/connect.js";

// routers
import authRouter from "./routes/authRoutes.js";
import jobsRouter from "./routes/jobsRoutes.js";

// middleware
import errorHandlerMiddleware from "./middleware/error-handler.js";
import notFoundMiddleware from "./middleware/not-found.js";
import authenticateUser from "./middleware/auth.js";

import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";

const app = express();

// Now it's will be looking for dotenv file in the root
dotenv.config();

if (process.env.NODE_ENV !== "production") {
  // middleware that show us the route we're hitting, method, status code to help us
  app.use(morgan("dev"));
}

// Because we using es6 the dirname will not be available by default
const __dirname = dirname(fileURLToPath(import.meta.url));

// Where our static assets going to be located (only when ready to deploy)
app.use(express.static(path.resolve(__dirname, "./client/build")));

app.use(express.json());
app.use(cookieParser());
// To secure the headers
app.use(helmet());
//xss clean => to make sure that we sanitize the input, so we prevent the cross-site scripting attacks
app.use(xss());
// mongoSanitize => it prevents the mongoDB operator injection
app.use(mongoSanitize());

app.get("/", (req, res, next) => {
  res.json({ msg: "Welcome!" });
});

app.get("/api/v1", (req, res, next) => {
  res.json({ msg: "API!" });
});

app.use("/api/v1/auth", authRouter);
// authenticateUser => instead to add the auth middleware in every route in jobsRoutes we added him once here
app.use("/api/v1/jobs", authenticateUser, jobsRouter);

app.get("*", (req, res, next) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

// app.use() => for all the http methods - post/patch/get and so on
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
