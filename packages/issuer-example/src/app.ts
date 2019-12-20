import express from "express";

const port = process.env.PORT || 3002;

const app = express().set("port", port);

export default app;
