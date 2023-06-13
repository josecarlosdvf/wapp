import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { Replay } from "@material-ui/icons";

import { makeStyles } from "@material-ui/core/styles";
import { green, grey, red, blue } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import Box from "@material-ui/core/Box";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import toastError from "../../errors/toastError";
import { v4 as uuidv4 } from "uuid";

import RoomIcon from '@material-ui/icons/Room';
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import AndroidIcon from "@material-ui/icons/Android";
import VisibilityIcon from "@material-ui/icons/Visibility";
import TicketMessagesDialog from "../TicketMessagesDialog";
import DoneIcon from '@material-ui/icons/Done';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';

import InstagramIcon from "@material-ui/icons/Instagram";
import FacebookIcon from "@material-ui/icons/Facebook";


const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
    height: 100,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 5,
    alignItems: 'self-start'
  },

  pendingTicket: {
    cursor: "unset",
  },

  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
  },

  contactNameWrapper: {
    display: "flex",
    justifyContent: "space-between",
  },

  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: -23,
    fontSize: 12
  },

  closedBadge: {
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 32,
    marginLeft: "auto",
  },

  contactLastMessage: {
    paddingRight: "50%",
  },

  newMessagesCount: {
    alignSelf: "center",
    marginRight: 0,
    marginLeft: "auto",
    top: -13
  },

  badgeStyle: {
    color: "white",
    backgroundColor: green[500],
    right: 20,
    top: 10
  },

  acceptButton: {
    position: "absolute",
    right: "108px",
  },

  ticketQueueColor: {
    flex: "none",
    width: "8px",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
  },

  ticketInfo: {
    position: "relative",
    top: 0
  },

  ticketInfo1: {
    position: "relative",
    top: 35,
    right: 0
  },
  bodyTicketInfo1: {
    display: 'flex',
    overflow: 'auto',
    marginRight: 80,
    marginBottom: 0,
    backgroundColor: '#fff'
  },
  Radiusdot: {
    "& .MuiBadge-badge": {
      borderRadius: 2,
      position: "inherit",
      height: 16,
      margin: 2,
      padding: 3
    },
    "& .MuiBadge-anchorOriginTopRightRectangle": {
      transform: "scale(1) translate(0%, -40%)",
    },

  }

}));

const TicketListItemCustom = ({ ticket }) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [ticketUser, setTicketUser] = useState(null);
  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const [whatsAppName, setWhatsAppName] = useState(null);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const isDialog = useRef(false);
  const { setCurrentTicket } = useContext(TicketsContext);
  const { user } = useContext(AuthContext);
  const { profile } = user;

  useEffect(() => {
    if (ticket.userId && ticket.user) {
      setTicketUser(ticket.user.name);
    }

    if (ticket.whatsappId && ticket.whatsapp) {
      setWhatsAppName(ticket.whatsapp.name);
    }

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCloseTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "closed",
        justClose: true,
        userId: user?.id,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }

    history.push(`/tickets/`);

    setLoading(false);
  };

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }

    history.push(`/tickets/${ticket.uuid}`);
    setLoading(false);
  };

  const handleUpdateTicketStatus = async (e, status, userId) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: status,
        userId: userId || null,
      });

      setLoading(false);
      if (status === "open") {
        setCurrentTicket({ ...ticket, code: "#open" });
      } else {
        setCurrentTicket({ id: null, code: null })
        history.push("/tickets");
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleSelectTicket = (ticket) => {
    if (isDialog.current) return;
    const code = uuidv4();
    const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  const handleMessageDialog = (staus) => {
    isDialog.current = staus;
    setOpenTicketMessageDialog(staus);
  };


  const renderTicketInfo = () => {
    if (ticketUser) {
      return (
        <>
          <div className={classes.bodyTicketInfo1}>
            <Badge
              className={classes.Radiusdot}
              badgeContent={`${ticketUser}`}
              //color="primary"
              style={{
                backgroundColor: "#3498db",
                height: 18,
                padding: 5,
                position: "inherit",
                borderRadius: 7,
                color: '#fff',
                top: -6,
                marginRight: 3,
              }}
            />

            {ticket.whatsappId && (
              <Badge
                className={classes.Radiusdot}
                badgeContent={`${whatsAppName}`}
                style={{
                  backgroundColor: "#7d79f2",
                  height: 18,
                  padding: 5,
                  position: "inherit",
                  borderRadius: 7,
                  color: "white",
                  top: -6,
                  marginRight: 3
                }}
              />
            )}


            {ticket.queue?.name !== null && (
              <Badge
                className={classes.Radiusdot}
                style={{
                  backgroundColor: ticket.queue?.color || "#7C7C7C",
                  height: 18,
                  padding: 5,
                  position: "inherit",
                  borderRadius: 7,
                  color: "white",
                  top: -6,
                  marginRight: 3
                }}
                badgeContent={ticket.queue?.name || "Sem fila"}
              //color="primary"
              />
            )}

            {ticket?.statusTicket?.map(st =>
              <Badge
                className={classes.Radiusdot}
                badgeContent={`${st?.title}`}
                //color="primary"
                style={{
                  backgroundColor: st?.color,
                  height: 18,
                  padding: 5,
                  position: "inherit",
                  borderRadius: 7,
                  color: '#fff',
                  top: -6,
                  marginRight: 3,
                }}
              />
            )}

          </div>

          {(ticket.status === "pending" && profile === "admin") && (
            <Tooltip title="Aceitar Conversa">
              <DoneIcon
                onClick={() => handleAcepptTicket(ticket.id)}
                fontSize="small"
                style={{
                  color: '#fff',
                  backgroundColor: green[700],
                  cursor: "pointer",
                  //margin: '0 5 0 5',
                  padding: 2,
                  height: 23,
                  width: 23,
                  fontSize: 12,
                  borderRadius: 50,
                  right: 26,
                  top: -8,
                  position: 'absolute',
                  zIndex: 999
                }}
              />
            </Tooltip>
          )}


          {(ticket.status === "open" || (profile === "admin" && ticket.status === "pending")) && (
            <Tooltip title="Fechar Conversa">
              <ClearOutlinedIcon
                onClick={() => handleCloseTicket(ticket.id)}
                fontSize="small"
                style={{
                  color: '#fff',
                  backgroundColor: red[700],
                  cursor: "pointer",
                  //margin: '0 5 0 5',
                  padding: 2,
                  height: 23,
                  width: 23,
                  fontSize: 12,
                  borderRadius: 50,
                  position: 'absolute',
                  right: ticket.status === "open" ? 28 : 52,
                  top: -8,
                  zIndex: 999
                }}
              />
            </Tooltip>
          )}
          {profile === "admin" && (
            <Tooltip title="Espiar Conversa">
              <VisibilityIcon
                onClick={() => handleMessageDialog(true)}
                fontSize="small"
                style={{
                  padding: 2,
                  height: 23,
                  width: 23,
                  fontSize: 12,
                  color: '#fff',
                  cursor: "pointer",
                  backgroundColor: blue[700],
                  borderRadius: 50,
                  position: 'absolute',
                  right: 0,
                  top: -8,
                  zIndex: 999
                }}
              />
            </Tooltip>
          )}

          {(/*profile === "admin" &&*/ ticket.status === "closed") && (
            <Tooltip title="Reabrir Conversa">
              <Replay
                onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
                fontSize="small"
                style={{
                  padding: 2,
                  height: 23,
                  width: 23,
                  fontSize: 12,
                  color: '#fff',
                  cursor: "pointer",
                  backgroundColor: grey[700],
                  borderRadius: 50,
                  right: 28,
                  top: -8,
                  position: 'absolute',
                  zIndex: 999
                }}
              />
            </Tooltip>
          )}

          {/*ticket.chatbot && (
            <Tooltip title="Chatbot">
              <AndroidIcon
                fontSize="small"
                style={{ color: grey[700], marginRight: 5 }}
              />
            </Tooltip>
          )}

          {/*ticket?.isBot && (
            <Tooltip title="Chatbot">
              <AndroidIcon
                fontSize="small"
                style={{ color: grey[700], marginRight: 5 }}
              />
            </Tooltip>
          )}

          {ticket.channel === "instagram" && (
            <Tooltip title={`Atribuido à ${ticketUser}`}>
              <InstagramIcon fontSize="small" style={{ color: grey[700] }} />
            </Tooltip>
          )}
          {ticket.channel === "facebook" && (
            <Tooltip title={`Atribuido à ${ticketUser}`}>
              <FacebookIcon fontSize="small" style={{ color: grey[700] }} />
            </Tooltip>
          )*/}

        </>
      );
    } else {
      return (
        <>
          <div className={classes.bodyTicketInfo1}>

            {ticket.whatsappId && (
              <Badge
                className={classes.Radiusdot}
                badgeContent={`${whatsAppName}`}
                style={{
                  backgroundColor: "#7d79f2",
                  height: 18,
                  padding: 5,
                  position: "inherit",
                  borderRadius: 7,
                  color: "white",
                  top: -6,
                  marginRight: 3
                }}
              />
            )}

            {ticket.queue?.name !== null && (
              <Badge
                className={classes.Radiusdot}
                style={{
                  //backgroundColor: ticket.queue?.color,
                  backgroundColor: ticket.queue?.color || "#7C7C7C",
                  height: 18,
                  padding: 5,
                  paddingHorizontal: 12,
                  position: "inherit",
                  borderRadius: 7,
                  color: "white",
                  top: -6,
                  marginRight: 2

                }}
                badgeContent={ticket.queue?.name || "Sem fila"}
              //color=
              />
            )}
            {ticket.status === "pending" && (
              <Tooltip title="Fechar Conversa">
                <ClearOutlinedIcon
                  onClick={() => handleCloseTicket(ticket.id)}
                  fontSize="small"
                  style={{
                    color: '#fff',
                    backgroundColor: red[700],
                    cursor: "pointer",
                    margin: '0 5 0 5',
                    padding: 2,
                    right: 48,
                    height: 23,
                    width: 23,
                    fontSize: 12,
                    borderRadius: 50,
                    top: -8,
                    position: 'absolute',
                    zIndex: 999
                  }}
                />
              </Tooltip>
            )}

            {ticket?.statusTicket?.map(st =>
              <Badge
                className={classes.Radiusdot}
                badgeContent={`${st?.title}`}
                style={{
                  backgroundColor: st?.color,
                  height: 18,
                  padding: 5,
                  position: "inherit",
                  borderRadius: 7,
                  color: "white",
                  top: -6,
                  marginRight: 3
                }}
              />
            )}

          </div>
          {ticket.status === "open" && (
            <Tooltip title="Fechar Conversa">
              <ClearOutlinedIcon
                onClick={() => handleCloseTicket(ticket.id)}
                fontSize="small"
                style={{
                  color: red[700],
                  cursor: "pointer",
                  marginRight: 5,
                  right: 49,
                  top: -8,
                  position: 'absolute',
                  zIndex: 999
                }}
              />
            </Tooltip>
          )}
          {ticket.status === "pending" && (
            <Tooltip title="Aceitar Conversa">
              <DoneIcon
                onClick={() => handleAcepptTicket(ticket.id)}
                fontSize="small"
                style={{
                  color: '#fff',
                  backgroundColor: green[700],
                  cursor: "pointer",
                  //margin: '0 5 0 5',
                  padding: 2,
                  height: 23,
                  width: 23,
                  fontSize: 12,
                  borderRadius: 50,
                  right: 25,
                  top: -8,
                  position: 'absolute',
                  zIndex: 999
                }}
              />
            </Tooltip>
          )}

          {profile === "admin" && (
            <Tooltip title="Espiar Conversa">
              <VisibilityIcon
                onClick={() => handleMessageDialog(true)}
                fontSize="small"
                style={{
                  padding: 2,
                  height: 23,
                  width: 23,
                  fontSize: 12,
                  color: '#fff',
                  cursor: "pointer",
                  backgroundColor: blue[700],
                  borderRadius: 50,
                  right: 0,
                  top: -8,
                  position: 'absolute',
                  zIndex: 999
                }}
              />
            </Tooltip>
          )}

          {(profile === "admin" && ticket.status === "closed") && (
            <Tooltip title="Reabrir Conversa">
              <Replay
                onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
                fontSize="small"
                style={{
                  padding: 2,
                  height: 23,
                  width: 23,
                  fontSize: 12,
                  color: '#fff',
                  cursor: "pointer",
                  backgroundColor: grey[700],
                  borderRadius: 50,
                  right: 30,
                  top: -8,
                  position: 'absolute',
                  zIndex: 999
                }}
              />
            </Tooltip>
          )}

          {/*ticket?.isBot && (
            <Tooltip title="Chatbot">
              <AndroidIcon
                fontSize="small"
                style={{ color: grey[700], marginRight: 5 }}
              />
            </Tooltip>
          )}

          {ticket.channel === "instagram" && (
            <Tooltip title={`Atribuido à ${ticketUser}`}>
              <InstagramIcon fontSize="small" style={{ color: grey[700] }} />
            </Tooltip>
          )}
          {ticket.channel === "facebook" && (
            <Tooltip title={`Atribuido à ${ticketUser}`}>
              <FacebookIcon fontSize="small" style={{ color: grey[700] }} />
            </Tooltip>
          )*/}

        </>
      );
    }
  };

  return (
    <React.Fragment key={ticket.id}>
      <TicketMessagesDialog
        open={openTicketMessageDialog}
        handleClose={() => handleMessageDialog(false)}
        ticketId={ticket.id}
      ></TicketMessagesDialog>
      <ListItem
        dense
        button
        onClick={(e) => {
          if (ticket.status === "pending") return;
          handleSelectTicket(ticket);
        }}
        selected={ticketId && +ticketId === ticket.id}
        className={clsx(classes.ticket, {
          [classes.pendingTicket]: ticket.status === "pending",
        })}
      >
        <Tooltip
          arrow
          placement="right"
          title={ticket.queue?.name || "Sem fila"}
        >
          <span
            style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }}
            className={classes.ticketQueueColor}
          ></span>
        </Tooltip>
        <ListItemAvatar>
          <Avatar src={ticket?.contact?.profilePicUrl} />
        </ListItemAvatar>
        <ListItemText
          disableTypography
          primary={
            <span className={classes.contactNameWrapper}>

              <Typography
                noWrap
                component="span"
                variant="body2"
                color="textPrimary"
              >
                {ticket.channel === "whatsapp" && (
                  <Tooltip title={`Atribuido à ${ticketUser}`}>
                    <WhatsAppIcon fontSize="inherit" style={{ color: grey[700] }} />
                  </Tooltip>
                )}
                {ticket.channel === "instagram" && (
                  <Tooltip title={`Atribuido à ${ticketUser}`}>
                    <InstagramIcon fontSize="small" style={{ color: grey[700] }} />
                  </Tooltip>
                )}
                {ticket.channel === "facebook" && (
                  <Tooltip title={`Atribuido à ${ticketUser}`}>
                    <FacebookIcon fontSize="small" style={{ color: grey[700] }} />
                  </Tooltip>
                )}
                {' '}
                {ticket.contact.name}
              </Typography>

            </span>
          }
          secondary={
            <span className={classes.contactNameWrapper}>
              <Typography
                className={classes.contactLastMessage}
                noWrap
                component="span"
                variant="body2"
                color="textSecondary" 
              > {ticket.lastMessage.includes('"previewType":') ? <MarkdownWrapper>Link</MarkdownWrapper>
                : ticket.lastMessage.includes('","color') ? <MarkdownWrapper>Atendimento Finalizado</MarkdownWrapper>
                : ticket.lastMessage.includes('data:image/png;base64') ? <MarkdownWrapper> Localização</MarkdownWrapper>
                  : ticket.lastMessage.includes('BEGIN:VCARD') ? <MarkdownWrapper> Contato</MarkdownWrapper>
                    : ticket.lastMessage?.includes('"text":"http') ? <MarkdownWrapper> Link </MarkdownWrapper>
                      : <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>}
                {/* {ticket.lastMessage === "" ? <br /> : <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>} */}
              </Typography>
              <ListItemSecondaryAction style={{ left: 73 }}>
                <Box className={classes.ticketInfo1}>{renderTicketInfo()}</Box>
              </ListItemSecondaryAction>
            </span>

          }
        />
        <ListItemSecondaryAction style={{}}>
          {ticket.status === "closed" && (
            <Badge
              className={classes.Radiusdot}
              badgeContent={"FECHADO"}
              //color="primary"
              style={{
                backgroundColor: ticket.queue?.color || "#ff0000",
                height: 18,
                padding: 5,
                paddingHorizontal: 12,
                borderRadius: 7,
                color: "white",
                top: -28,
                marginRight: 5

              }}
            />
          )}

          {ticket.lastMessage && (
            <>

              <Typography
                className={classes.lastMessageTime}
                component="span"
                variant="body2"
                color="textSecondary"
              >
                {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                  <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                ) : (
                  <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                )}
              </Typography>

              <Badge
                className={classes.newMessagesCount}
                badgeContent={ticket.unreadMessages ? ticket.unreadMessages : null}
                classes={{
                  badge: classes.badgeStyle,
                }}
              />
              <br />

            </>
          )}

        </ListItemSecondaryAction>

      </ListItem>
      <Divider variant="inset" component="li" />
    </React.Fragment>
  );
};

export default TicketListItemCustom;
