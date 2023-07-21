//@ts-ignore
import request from "supertest";
import assert from "assert";
import express from "express";
import feedbackRouter from "../routers/feedbackRouter";

const app = express();

app.use("/api/v1/feedback", feedbackRouter);

describe("POST /api/v1/feedback", function () {
  this.timeout(5000); // 타임아웃 값을 조정합니다.

  it("responds with json", async function () {
    // done 콜백 대신 async/await를 사용해봅니다.
    try {
      const res = await request(app)
        .post("/api/v1/feedback")
        .send({ data_id: 1, iscorrect: true })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200);

      // 여기서 res.body를 이용해 반환값을 검증합니다.
      assert.strictEqual(res.body.success, "Feedback received");
    } catch (err) {
      console.error(err); // 발생하는 예외를 출력합니다.
      throw err; // 예외를 다시 던져 테스트가 실패하도록 합니다.
    }
  });
});
