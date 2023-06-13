import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsTo,
  ForeignKey,
  HasMany,
  BelongsToMany
} from "sequelize-typescript";
import Company from "./Company";
import TicketStatus from "./TicketStatus";
import Ticket from "./Ticket";

@Table({ tableName: "StatusTicket" })
class StatusTicket extends Model<StatusTicket> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  priority: number; //1 - alta, 2 - média, 3 - baixa

  @Column
  title: string;

  @Column(DataType.TEXT)
  text: string;

  @Column
  color: string;

  @HasMany(() => TicketStatus)
  ticketStatus: TicketStatus[];

  @BelongsToMany(() => Ticket, () => TicketStatus)
  tickets: Ticket[];

  @Column
  mediaPath: string;

  @Column
  mediaName: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column
  status: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: Company;
}

export default StatusTicket;
