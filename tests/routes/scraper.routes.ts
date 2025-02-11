import request from "supertest";
import app from "../../src/app";

describe("Scraper Routes", () => {
  test("Get Server Status", async () => {
    const res = await request(app).get("/status");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual("We are alive and ready!");
  });
  test("Fetch Data Route", async () => {
    const res = await request(app).post("/fetch-data").send({ runJob: "True" });
    expect(res.statusCode).toEqual(200);
  });
});
