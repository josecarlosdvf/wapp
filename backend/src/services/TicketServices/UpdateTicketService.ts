import moment from "moment";
import * as Sentry from "@sentry/node";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import Setting from "../../models/Setting";
import Queue from "../../models/Queue";
import ShowTicketService from "./ShowTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import { verifyMessage } from "../WbotServices/wbotMessageListener";
import { isNil } from "lodash";
import sendFaceMessage from "../FacebookServices/sendFacebookMessage";

import CreateMessageService from "../MessageServices/CreateMessageService";
import FindTicketStatusService from "../TicketStatusService/FindService";

type FindParams = {
  companyId: string;
};
interface TicketData {
  status?: string;
  userId?: number | null;
  queueId?: number | null;
  chatbot?: boolean;
  queueOptionId?: number;
  justClose?: boolean;
}

interface Request {
  ticketData: TicketData;
  ticketId: string | number;
  companyId: number;
}

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId,
  companyId
}: Request): Promise<Response> => {
  try {
    const { status, justClose } = ticketData;
    let { queueId, userId } = ticketData;
    let chatbot: boolean | null = ticketData.chatbot || false;
    let queueOptionId: number | null = ticketData.queueOptionId || null;

    const io = getIO();

    const key = "userRating";
    const setting = await Setting.findOne({
      where: {
        companyId,
        key
      }
    });

    const ticket = await ShowTicketService(ticketId, companyId);
    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId,
      companyId,
      whatsappId: ticket.whatsappId
    });

    if (ticket.channel === "whatsapp") {
      SetTicketMessagesAsRead(ticket);
    }

    const oldStatus = ticket.status;
    const oldUserId = ticket.user?.id;
    const oldQueueId = ticket.queueId;

    if (oldStatus === "closed") {
      await CheckContactOpenTickets(ticket.contact.id);
      chatbot = null;
      queueOptionId = null;
    }

    if (status !== undefined && ["closed"].indexOf(status) > -1) {
      const { complationMessage, ratingMessage } = await ShowWhatsAppService(
        ticket.whatsappId,
        companyId
      );
      //const params = { companyId: `${companyId}` } as FindParams;
      //const items = await FindTicketStatusService(params);

      //const ticketStatus = items?.find(t=> t?.title === "Finalizar");

      //if(ticketStatus) {
      const message = {
        text: "Atendimento finalizado em" /*ticketStatus.text*/,
        color: "#dcf8c6" /*ticketStatus.color*/,
        date: moment().toDate()
      };

      const body = JSON.stringify(message);

      const messageData = {
        id: `${Math.random()}`,
        ticketId: ticket.id,
        contactId: undefined,
        body,
        fromMe: true,
        mediaType: undefined,
        read: true,
        quotedMsgId: undefined,
        ack: 4,
        remoteJid: undefined,
        participant: undefined,
        dataJson: JSON.stringify("")
      };

      await ticket.update({
        lastMessage: body
      });

      await CreateMessageService({ messageData, companyId: ticket.companyId });



      if (setting?.value === "enabled") {
        if (ticketTraking.ratingAt == null) {


          const ratingTxt = ratingMessage || "";
          let bodyRatingMessage = `\u200e${ratingTxt}\n\n`;
          bodyRatingMessage +=
            "Digite de 1 à 5 para qualificar nosso atendimento:\n*1* - _Insatisfeito_\n*2* - _Não ficou muito claro_\n*3* - _Bom_\n*4* - _Satisfeito_\n*5* - _Muito Satisfeito_\n\n";

          if (ticket.channel === "whatsapp") {
            const msg = await SendWhatsAppMessage({ body: bodyRatingMessage, ticket });
            await verifyMessage(msg, ticket, ticket.contact);
          }

          if (["facebook", "instagram"].includes(ticket.channel)) {
            console.log(`Checking if ${ticket.contact.number} is a valid ${ticket.channel} contact`)
            await sendFaceMessage({ body: bodyRatingMessage, ticket });
          }

          await ticketTraking.update({
            ratingAt: moment().toDate(),
            finishedAt: null
          });

          await ticket.update({
            status,
            queueId: null,
            userId,
            whatsappId: ticket.whatsappId,
            chatbot,
            queueOptionId
          });
          
          await ticket.reload();

          io.to("open")
            .to(ticketId.toString())
            .emit(`company-${ticket.companyId}-ticket`, {
              action: "delete",
              ticketId: ticket.id
            });

          return { ticket, oldStatus, oldUserId };
        }
        ticketTraking.ratingAt = moment().toDate();
        ticketTraking.rated = false;
      }

      if (!isNil(complationMessage) && complationMessage !== "") {
        const body = `\u200e${complationMessage}`;
        if (ticket.channel === "whatsapp") {
          await SendWhatsAppMessage({ body, ticket });
        }

        if (["facebook", "instagram"].includes(ticket.channel)) {
          console.log(`Checking if ${ticket.contact.number} is a valid ${ticket.channel} contact`)
          await sendFaceMessage({ body, ticket });
        }
      }

      ticketTraking.finishedAt = moment().toDate();
      ticketTraking.whatsappId = ticket.whatsappId;
      ticketTraking.userId = ticket.userId;
      ticketTraking.queueId = ticket.queueId;

      queueId = null;
      //userId = null;
    }

    if (queueId !== undefined && queueId !== null) {
      ticketTraking.queuedAt = moment().toDate();
    }

    if (oldQueueId !== queueId && !isNil(oldQueueId) && !isNil(queueId)) {
      const queue = await Queue.findByPk(queueId);
      if (ticket.channel === "whatsapp") {
        const wbot = await GetTicketWbot(ticket);

        const queueChangedMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
          }`,
          {
            text: "\u200eVocê foi transferido, em breve iremos iniciar seu atendimento."
          }
        );
        await verifyMessage(queueChangedMessage, ticket, ticket.contact);
      }

      if (["facebook", "instagram"].includes(ticket.channel)) {
        console.log(`Checking if ${ticket.contact.number} is a valid ${ticket.channel} contact`)
        await sendFaceMessage({ body: "\u200eVocê foi transferido, em breve iremos iniciar seu atendimento.", ticket });
      }
    }

    await ticket.update({
      status,
      queueId,
      userId,
      whatsappId: ticket.whatsappId,
      chatbot,
      queueOptionId
    });

    await ticket.reload();

    if (status !== undefined && ["pending"].indexOf(status) > -1) {
      ticketTraking.update({
        whatsappId: ticket.whatsappId,
        queuedAt: moment().toDate(),
        startedAt: null,
        userId: null
      });
      await ticket.update({
        userId: null
      });
      io.emit(`company-${companyId}-ticket`, {
        action: "removeFromList",
        ticketId: ticket?.id
      });
    }

    if (status !== undefined && ["open"].indexOf(status) > -1) {
      ticketTraking.update({
        startedAt: moment().toDate(),
        ratingAt: null,
        rated: false,
        whatsappId: ticket.whatsappId,
        userId: ticket.userId
      });
      await ticket.update({
        queueId: ticket.queueId ? ticket.queueId : ticketTraking.queueId,
      });
      io.emit(`company-${companyId}-ticket`, {
        action: "removeFromList",
        ticketId: ticket?.id
      });
    }

    await ticketTraking.save();

    if (justClose && status == 'closed') {
      io.emit(`company-${companyId}-ticket`, {
        action: "removeFromList",
        ticketId: ticket?.id
      });

    } else

      if (ticket.status !== oldStatus || ticket.user?.id !== oldUserId) {
        io.to(oldStatus).emit(`company-${companyId}-ticket`, {
          action: "delete",
          ticketId: ticket.id
        });
      }

    io.to(ticket.status)
      .to("notification")
      .to(ticketId.toString())
      .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket
      });

    return { ticket, oldStatus, oldUserId };
  } catch (err) {
    Sentry.captureException(err);
  }
};

export default UpdateTicketService;