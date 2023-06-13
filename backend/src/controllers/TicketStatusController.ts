import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { head } from "lodash";
import fs from "fs";
import path from "path";

import ListService from "../services/TicketStatusService/ListService";
import CreateService from "../services/TicketStatusService/CreateService";
import ShowService from "../services/TicketStatusService/ShowService";
import UpdateService from "../services/TicketStatusService/UpdateService";
import DeleteService from "../services/TicketStatusService/DeleteService";
import FindService from "../services/TicketStatusService/FindService";

import StatusTicket from "../models/StatusTicket";

import AppError from "../errors/AppError";
import SyncStatusTicket from "../services/TicketStatusService/SyncStatusService";
import SimpleListService from "../services/TicketStatusService/SimpleListService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  companyId: string | number;
};

type StoreData = {
  priority: string;
  title: string;
  text: string;
  status: string;
  companyId: number;
  mediaPath?: string;
  mediaName?: string;
};

type FindParams = {
  companyId: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, companyId } = req.query as IndexQuery;

  const { records, count, hasMore } = await ListService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ records, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body as StoreData;

  const schema = Yup.object().shape({
    title: Yup.string().required()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const record = await CreateService({
    ...data,
    companyId
  });

  const io = getIO();
  io.emit(`company-ticketStatus`, {
    action: "create",
    record
  });

  return res.status(200).json(record);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const record = await ShowService(id);

  return res.status(200).json(record);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body as StoreData;

  const schema = Yup.object().shape({
    title: Yup.string().required()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const { id } = req.params;

  const record = await UpdateService({
    ...data,
    id
  });

  const io = getIO();
  io.emit(`company-ticketStatus`, {
    action: "update",
    record
  });

  return res.status(200).json(record);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(id);

  const io = getIO();
  io.emit(`company-${companyId}-ticketStatus`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "ticketStatus deleted" });
};

export const findList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params = req.query as FindParams;
  const records: StatusTicket[] = await FindService(params);

  return res.status(200).json(records);
};

export const listSimple = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const tags = await SimpleListService({ searchParam, companyId });

  return res.json(tags);
};

export const mediaUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];
  const file = head(files);

  try {
    const ticketStatus = await StatusTicket.findByPk(id);

    await ticketStatus.update({
      mediaPath: file.filename,
      mediaName: file.originalname
    });
    await ticketStatus.reload();

    const io = getIO();
    io.emit(`company-ticketStatus`, {
      action: "update",
      record: ticketStatus
    });

    return res.send({ mensagem: "Mensagem enviada" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export const syncStatusTicket = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body;
  const { companyId } = req.user;

  const statusTickets = await SyncStatusTicket({ ...data, companyId });
  const ticket = await ShowTicketService(data?.ticketId, companyId);
  const io = getIO();
  io.to(ticket.status).emit(`company-${companyId}-ticket`, {
    action: "update",
    ticket
  });

  return res.json(statusTickets);
};

export const deleteMedia = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    const ticketStatus = await StatusTicket.findByPk(id);
    const filePath = path.resolve("public", ticketStatus.mediaPath);
    const fileExists = fs.existsSync(filePath);
    if (fileExists) {
      fs.unlinkSync(filePath);
    }

    await ticketStatus.update({
      mediaPath: null,
      mediaName: null
    });
    await ticketStatus.reload();

    const io = getIO();
    io.emit(`company-ticketStatus`, {
      action: "update",
      record: ticketStatus
    });

    return res.send({ mensagem: "Arquivo excluído" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};
