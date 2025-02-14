import request from "supertest";
import { App } from "../../src/app";
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
describe("Scraper Routes", () => {
    test("Get Server Status", async () => {
        const res = await request(app).get("/status");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual("We are alive and ready!");
    });
    test("Fetch Data Route", async () => {
        const res = await request(app)
            .post("/fetch-data")
            .send({ runJob: "True" });
        expect(res.statusCode).toEqual(200);
    });
});
