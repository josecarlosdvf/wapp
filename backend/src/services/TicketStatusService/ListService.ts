import { Op, fn, col, where } from "sequelize";
import { isEmpty } from "lodash";
import StatusTicket from "../../models/StatusTicket";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  companyId?: any
}

interface Response {
  records: StatusTicket[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId
}: Request): Promise<Response> => {
  let whereCondition: any = {
    status: true,
    companyId
  };

  if (!isEmpty(searchParam)) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          title: where(
            fn("LOWER", col("StatusTicket.title")),
            "LIKE",
            `%${searchParam.toLowerCase().trim()}%`
          )
        }
      ]
    };
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: records } = await StatusTicket.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  const hasMore = count > offset + records.length;

  return {
    records,
    count,
    hasMore
  };
};

export default ListService;
