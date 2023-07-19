// feedbackRouter.ts
import express from "express";
import { Request, Response } from "express";
// @ts-ignore
import { Data } from "../models"; //모듈에 대한 타압검사를 받지 않도록 함
import sequelize from "../config/database";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { data_id, iscorrect, feedback_text } = req.body;

  if (data_id === undefined || iscorrect === undefined) {
    res.status(400).send({ error: "사진이 맞는지 대답해주세요!" });
    return;
  }

  const feedbackText = feedback_text || null;

  try {
    const id = await Data.findByPk(data_id);

    if (!id) {
      res
        .status(404)
        .send({ error: "No data found with the provided data_id" });
      return;
    }

    await id.update({ iscorrect, feedback_text: feedbackText });

    res.status(200).send({ success: "Feedback received" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error processing feedback" });
  }
});

sequelize.sync();

export default router;
