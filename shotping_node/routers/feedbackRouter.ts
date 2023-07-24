// feedbackRouter.ts
import express from "express";
import { Request, Response } from "express";
import logger from "../config/logger";
// @ts-ignore
import { Data } from "../models"; //모듈에 대한 타압검사를 받지 않도록 함
import sequelize from "../config/database";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { data_id, iscorrect, feedback_text } = req.body;

  if (data_id === undefined || iscorrect === undefined) {
    logger.error(`POST / - Error: Missing parameters`);
    res.status(400).send({ error: "사진이 맞는지 대답해주세요!" });
    return;
  }

  const feedbackText = feedback_text || null;

  try {
    const id = await Data.findByPk(data_id);

    if (!id) {
      logger.error(`POST / - Error: No data found with id ${data_id}`);
      res
        .status(404)
        .send({ error: "No data found with the provided data_id" });
      return;
    }

    await id.update({ iscorrect, feedback_text: feedbackText });

    logger.info(`POST / - Success: Feedback received`);
    res.status(200).send({ success: "Feedback received" });
  } catch (error) {
    logger.error(`POST / - Error: ${error}`);
    console.error(error);
    res.status(500).send({ error: "Error processing feedback" });
  }
});

sequelize.sync();

export default router;
