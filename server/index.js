import "dotenv/config";
import connectToMongo from "./DB/connection.js";
import express from "express";
import cors from "cors";
import pushRouter from "./routes/pushNoti.route.js";
import notificationRouter from "./routes/notification.route.js";
import userRouter from "./routes/loginRegisteration.route.js";
import propertyRouter from "./routes/property.route.js";
import { enquiryRouter } from "./routes/enquiry.route.js";
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "https://id-preview--1ba77054-7566-4e01-9cba-0014ae8293ba.lovable.app"
    ],
    credentials: true
  })
);
app.use(express.json());

const port = process.env.PORT || 5000;

connectToMongo();

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/push", pushRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/user",userRouter);
app.use("/api/property",propertyRouter);
app.use("/api/enquiry",enquiryRouter);

app.listen(port, () => console.log(`Running at port ${port}`));
