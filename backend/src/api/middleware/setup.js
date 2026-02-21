const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { UPLOAD_DIR } = require("../../config/paths");

module.exports = (app) => {
    app.use(cors());
    app.use(bodyParser.json());
    app.use("/uploads", express.static(UPLOAD_DIR));
};