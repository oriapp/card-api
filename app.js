const users = require("./routes/users");
const auth = require("./routes/auth");
const cards = require("./routes/cards");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost/my_rest_api", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.log("Error Connecting to MongoDB"));

app.use(express.json());
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/cards", cards);

const port = 3000;
http.listen(port, () => console.log(`Listen to port ${port}`));
