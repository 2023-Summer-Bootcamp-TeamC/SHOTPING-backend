import express from "express";
import { Request, Response } from "express";
import * as queryString from "querystring";
import axios from "axios";

const router = express.Router();

const headers = {
  Authorization: "KakaoAK " + "031388ca62ad8dcdc499a3ac1ae91d56",
  "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
};

router.post("/", async (req: Request, res: Response) => {
  const { total_amount } = req.body;
  if (typeof total_amount !== "number" || total_amount < 0) {
    return res.status(400).send("결과값이 오지 않았습니다.");
  }

  const params = queryString.stringify({
    // Convert to url-encoded string
    cid: "TC0ONETIME",
    partner_order_id: "938503",
    partner_user_id: "user",
    item_name: "물품",
    quantity: 1,
    total_amount: total_amount,
    vat_amount: 200,
    tax_free_amount: 0,
    approval_url: "https://shotping.shop/pay",
    cancel_url: "https://shotping.shop/payfail",
    fail_url: "https://shotping.shop/payfail",
  });

  try {
    const kakaoApiResponse = await axios.post(
      "https://kapi.kakao.com/v1/payment/ready",
      params,
      { headers }
    );
    res.status(200).send({
      next_redirect_pc_url: kakaoApiResponse.data.next_redirect_pc_url,
    });
  } catch (error) {
    console.error("Error calling Kakao API", error);
    res.status(500).send("결제 오류");
  }
});

router.get("/api/v1/payment/success", async (req, res) => {
  const params = {
    cid: "TC0ONETIME",
    partner_order_id: "1001",
    partner_user_id: "testuser",
    pg_token: req.query.pg_token,
  };

  try {
    await axios.post("https://kapi.kakao.com/v1/payment/approve", params, {
      headers,
    });
    res.redirect("/success");
  } catch (error) {
    console.error("Error calling Kakao API", error);
    res.redirect("/fail");
  }
});

router.get("/api/v1/payment/cancel", async (req, res) => {
  res.redirect("/cancel");
});

router.get("/api/v1/payment/fail", async (req, res) => {
  res.redirect("/fail");
});

export default router;
