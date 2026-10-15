const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());

// Aumentar el límite a 50MB para soportar importaciones masivas de planillas Excel
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Rutas
app.use("/api", routes);

app.use(errorHandler);

module.exports = app;