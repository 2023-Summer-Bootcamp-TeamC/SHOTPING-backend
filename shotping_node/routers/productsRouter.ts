import express from "express";
import { Request, Response } from "express";
// @ts-ignore
import { Product } from "../models";
import sequelize from "../config/database";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1; // 디폴트 값: 1
  const limit = 8;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: products } = await Product.findAndCountAll({
      limit: limit,
      offset: offset,
      attributes: [
        "id",
        "product_name",
        "product_price",
        "product_stock",
        "image_url",
      ],
    });

    const totalPages = Math.ceil(count / limit);
    const prevPage = page - 1 > 0 ? page - 1 : null;
    const nextPage = page + 1 <= totalPages ? page + 1 : null;

    const hasPrev = page - 1 > 0 ? true : false;
    const hasNext = page + 1 <= totalPages ? true : false;

    res.status(200).json({
      meta: {
        page: page,
        pages: totalPages,
        prev_page: prevPage,
        next_page: nextPage,
        total_count: count,
        has_prev: hasPrev,
        has_next: hasNext,
      },
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error retrieving product data" });
  }
});

sequelize.sync();

export default router;
