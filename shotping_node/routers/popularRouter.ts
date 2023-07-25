import express from "express";
import { Request, Response } from "express";
// @ts-ignore
import { Product } from "../models";
import sequelize from "../config/database";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const n = 5; // 상위 n개의 상품

  try {
    const popularProducts = await Product.findAll({
      limit: n,
      order: [["product_buy", "DESC"]],
      attributes: ["product_name", "product_price", "product_buy", "image_url"],
    });

    res.status(200).json(popularProducts);

  } catch (error) {
    res.status(500).send({ error: "Error retrieving popular products data" });
  }
});

sequelize.sync();

export default router;
