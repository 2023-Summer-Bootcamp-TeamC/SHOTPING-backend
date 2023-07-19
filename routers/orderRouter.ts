import express from "express";
import { Request, Response } from "express";
// @ts-ignore
import { Product } from "../models";
import sequelize from "../config/database";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const data = req.body.data;
  try {
    for (let item of data) {
      const { product_id, product_stock, product_buy } = item;

      let product = await Product.findOne({ where: { id: product_id } });

      if (product) {
        product.product_stock -= product_stock;
        product.product_buy += product_buy;
        await product.save();
      } else {
        res
          .status(404)
          .json({ error: `Product with id ${product_id} not found` });
        return;
      }
    }
    res.json({ success: "Product data updated successfully." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while updating product data." });
  }
});

sequelize.sync();

export default router;
