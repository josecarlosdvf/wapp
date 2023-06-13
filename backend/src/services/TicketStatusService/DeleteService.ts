import StatusTicket from "../../models/StatusTicket";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string): Promise<void> => {
  const record = await StatusTicket.findOne({
    where: { id }
  });

  if (!record) {
    throw new AppError("ERR_NO_TICKET_STATUS_FOUND", 404);
  }

  await record.destroy();
};

export default DeleteService;
