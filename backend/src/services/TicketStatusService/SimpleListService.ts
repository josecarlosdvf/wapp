import { Op, Sequelize } from "sequelize";
import StatusTicket from "../../models/StatusTicket";

interface Request {
  companyId: number;
  searchParam?: string;
}

const SimpleListService = async ({
  companyId,
  searchParam
}: Request): Promise<StatusTicket[]> => {
  let whereCondition = {};

  if (searchParam) {
    whereCondition = {
      [Op.or]: [
        { title: { [Op.like]: `%${searchParam}%` } },
        { color: { [Op.like]: `%${searchParam}%` } }
      ]
    };
  }

  const tags = await StatusTicket.findAll({
    where: { ...whereCondition, companyId },
    order: [["title", "ASC"]]
  });

  return tags;
};

export default SimpleListService;
