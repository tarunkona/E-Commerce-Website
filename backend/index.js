import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import cors from "cors";

const port = 4000;
const app = express();

app.use(express.json());
app.use(cors());

