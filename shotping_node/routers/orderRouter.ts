import express from "express";
import { Request, Response } from "express";
import logger from "../config/logger";
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
        logger.error(`POST / - Error: Product with id ${product_id} not found`);
        res
          .status(404)
          .json({ error: `Product with id ${product_id} not found` });
        return;
      }
    }
    logger.info(`POST / - Success: Product data updated successfully`);
    res.json({ success: "Product data updated successfully." });
  } catch (err) {
    logger.error(`POST / - Error: ${err}`);
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while updating product data." });
  }
});

sequelize.sync();

export default router;
