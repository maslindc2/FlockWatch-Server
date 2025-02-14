import request from "supertest";
import { App } from "../src/app";
import mongoose from "mongoose";

let app: any;

beforeAll(async () => {
    const mongoDBConnection =
        process.env.MONGODB_URI || "mongodb://localhost:27017/flockwatch_test";
    app = new App(mongoDBConnection).app;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Test app.ts", () => {
    test("Catch-all route", async () => {
        const res = await request(app).get("/");
        expect(res.body).toEqual({ message: "Nothing here but us Chickens" });
    });
});
