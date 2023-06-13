import AppError from "../../errors/AppError";
import StatusTicket from "../../models/StatusTicket";

interface Data {
  id: number | string;
  priority: string;
  title: string;
  text: string;
  status: string;
  companyId: number;
}

const UpdateService = async (data: Data): Promise<StatusTicket> => {
  const { id } = data;

  const record = await StatusTicket.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_TICKET_STATUS_FOUND", 404);
  }

  await record.update(data);

  return record;
};

export default UpdateService;
