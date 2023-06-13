import StatusTicket from "../../models/StatusTicket";
import Ticket from "../../models/Ticket";
import TicketStatus from "../../models/TicketStatus";

interface Request {
  tags: StatusTicket[];
  ticketId: number;
}

const SyncStatusTicket = async ({
  tags,
  ticketId
}: Request): Promise<Ticket | null> => {
  const ticket = await Ticket.findByPk(ticketId, { include: [StatusTicket] });

  const statusTicketList = tags.map(t => ({ statusTicketId: t.id, ticketId }));

  await TicketStatus.destroy({ where: { ticketId } });
  await TicketStatus.bulkCreate(statusTicketList);

  ticket?.reload();

  return ticket;
};

export default SyncStatusTicket;
