import StatusTicket from "../../models/StatusTicket";

const FindAllService = async (): Promise<StatusTicket[]> => {
  const records: StatusTicket[] = await StatusTicket.findAll({
    order: [["createdAt", "DESC"]]
  });
  return records;
};

export default FindAllService;
