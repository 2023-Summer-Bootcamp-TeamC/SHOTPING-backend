import chai from "chai";
//@ts-ignore
import chaiHttp from "chai-http";
import express from "express";
import sinon from "sinon";
import popularRouter from "../routers/popularRouter";
import productsRouter from "../routers/productsRouter";
import searchRouter from "../routers/searchRouter";
//@ts-ignore
import app from "../app";
chai.use(chaiHttp);
const expect = chai.expect;

const app = express();
app.use("/api/v1/popular", popularRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/search", searchRouter);

describe("GET /api/v1/popular", function () {
  it("상위 5개의 상품가져오기", function (done) {
    chai
      .request(app)
      .get("/api/v1/popular")
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.equal(5);
        done();
      });
  });
});

describe("GET /api/v1/products", function () {
  it("상품확인", function (done) {
    const page = 2;
    chai
      .request(app)
      .get("/api/v1/products")
      .query({ page: page })
      .end(function (err, res) {
        if (err) done(err);
        else {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.all.keys("meta", "data");
          expect(res.body.meta.page).to.equal(page);
          done();
        }
      });
  });
});

describe("GET /api/v1/search", function () {
  it("키워드로 상품 검색", function (done) {
    const keyword = "딸기"; // 실제 테스트를 수행할 때는 데이터베이스에 존재하는 키워드를 사용하세요.

    chai
      .request(app)
      .get("/api/v1/search") // 검색 라우터의 실제 경로를 사용하세요.
      .query({ kw: keyword })
      .end(function (err, res) {
        if (err) done(err);
        else {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          done();
        }
      });
  });
});
