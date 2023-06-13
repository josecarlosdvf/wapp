import express from "express";
import isAuth from "../middleware/isAuth";

import * as TicketStatusController from "../controllers/TicketStatusController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const routes = express.Router();

routes.get("/tickets-status/list", isAuth, TicketStatusController.findList);

routes.get("/tickets-status/listSimple", isAuth, TicketStatusController.listSimple);

routes.get("/tickets-status", isAuth, TicketStatusController.index);

routes.get("/tickets-status/:id", isAuth, TicketStatusController.show);

routes.post("/tickets-status", isAuth, TicketStatusController.store);

routes.post("/tickets-status/sync", isAuth, TicketStatusController.syncStatusTicket);

routes.put("/tickets-status/:id", isAuth, TicketStatusController.update);

routes.delete("/tickets-status/:id", isAuth, TicketStatusController.remove);


/*routes.post(
  "/announcements/:id/media-upload",
  isAuth,
  upload.array("file"),
  AnnouncementController.mediaUpload
);

routes.delete(
  "/announcements/:id/media-upload",
  isAuth,
  AnnouncementController.deleteMedia
);*/

export default routes;
