import StatusTicket from "../../models/StatusTicket";
import Company from "../../models/Company";

type Params = {
  companyId: string;
};

const FindService = async ({ companyId }: Params): Promise<StatusTicket[]> => {
  const notes: StatusTicket[] = await StatusTicket.findAll({
    where: {
      companyId
    },
    include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]]
  });

  return notes;
};

export default FindService;
