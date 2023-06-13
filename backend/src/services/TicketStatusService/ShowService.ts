import StatusTicket from "../../models/StatusTicket";
import AppError from "../../errors/AppError";

const ShowService = async (id: string | number): Promise<StatusTicket> => {
  const record = await StatusTicket.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_TICKET_STATUS_FOUND", 404);
  }

  return record;
};

export default ShowService;
