import express from "express";
import { Request, Response } from "express";

// @ts-ignore
import { Product } from "../models";
import sequelize from "../config/database";
import { Sequelize } from "sequelize";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const keyword = req.query.kw as string;

  if (!keyword || keyword.trim() === "") {
    res.status(400).send({ error: "Invalid keyword" });
    return;
  }

  try {
    const lowerKeyword = keyword.toLowerCase();
    const products = await Product.findAll({
      where: Sequelize.where(
        Sequelize.fn("lower", Sequelize.col("product_name")),
        "LIKE",
        `%${lowerKeyword}%`
      ),
      attributes: [
        "id",
        "product_name",
        "product_price",
        "product_stock",
        "image_url",
      ],
    });

    if (!products) {
      res.status(404).send({ error: "No products found" });
      return;
    }

    res.status(200).json(products);

  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error retrieving product data" });
  }
});

sequelize.sync();

export default router;
