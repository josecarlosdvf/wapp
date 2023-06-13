import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import StatusTicket from "./StatusTicket";
import Ticket from "./Ticket";

@Table({
  tableName: 'TicketStatus'
})
class TicketStatus extends Model<TicketStatus> {
  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @ForeignKey(() => StatusTicket)
  @Column
  statusTicketId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @BelongsTo(() => StatusTicket)
  statusTicket: StatusTicket;
}

export default TicketStatus;
