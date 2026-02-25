import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { UPLOAD_DIR } from "../../config/paths.js";

export default (app) => {
    app.use(cors());
    app.use(bodyParser.json());
    app.use("/uploads", express.static(UPLOAD_DIR));
};