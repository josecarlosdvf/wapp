import React, { useState, useEffect, useReducer, useRef } from "react";

import { isSameDay, parseISO, format, parse, setQuarter } from "date-fns";
import clsx from "clsx";

import { green } from "@material-ui/core/colors";
import {
  Avatar,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";

import {
  AccessTime,
  Block,
  Done,
  DoneAll,
  ExpandMore,
  GetApp,
  Facebook,
  Instagram,
} from "@material-ui/icons";

import MarkdownWrapper from "../MarkdownWrapper";
import ModalImageCors from "../ModalImageCors";
import MessageOptionsMenu from "../MessageOptionsMenu";
import whatsBackground from "../../assets/wa-background.png";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { socketConnection } from "../../services/socket";

import vcard from "vcard-parser";
import JSZip from "jszip";

import GetAppIcon from '@material-ui/icons/GetApp';
import NewTicketModal from "../NewTicketModal";
import { useHistory } from "react-router-dom";

const isMobile = window.innerWidth < 600;


const useStyles = makeStyles((theme) => ({
  messagesListWrapper: {
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    width: "100%",
    minWidth: 300,
    minHeight: 200,
  },

  messagesList: {
    backgroundImage: `url(${whatsBackground})`,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: "20px 20px 20px 20px",
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },

  circleLoading: {
    color: green[500],
    position: "absolute",
    opacity: "70%",
    top: 0,
    left: "50%",
    marginTop: 12,
  },

  messageLeft: {
    marginRight: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },

    whiteSpace: "pre-wrap",
    backgroundColor: "#ffffff",
    color: "#303030",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 10,
    boxShadow: "0 1px 1px #b3b3b3",
  },

  messageLeftMedia: {
    gridTemplateAreas: isMobile? `"a a a"` : `"a a a a"`,
    gap: 10,
    gridAutoRows: 94,
    gridAutoColumns: 94,
    display: 'grid',
    //width: 230,
    marginRight: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    padding: 10,
    paddingBottom: 20,
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },

    whiteSpace: "pre-wrap",
    backgroundColor: "#ffffff",
    color: "#303030",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    boxShadow: "0 1px 1px #b3b3b3",
  },

  quotedContainerLeft: {
    margin: "-3px -80px 6px -6px",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  quotedMsg: {
    padding: 10,
    maxWidth: 300,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },

  quotedSideColorLeft: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },

  messageRight: {
    marginLeft: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },

    whiteSpace: "pre-wrap",
    backgroundColor: "#dcf8c6",
    color: "#303030",
    alignSelf: "flex-end",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 10,
    boxShadow: "0 1px 1px #b3b3b3",
  },

  messageRightMedia: {
    gridTemplateAreas: isMobile? `"a a a"` : `"a a a a"`,
    gap: 10,
    gridAutoRows: 94,
    gridAutoColumns: 94,
    display: 'grid',
    //width: 230,
    marginRight: 0,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    marginLeft: 20,
    padding: 10,
    paddingBottom: 20,
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },

    whiteSpace: "pre-wrap",
    backgroundColor: "#dcf8c6",
    color: "#303030",
    alignSelf: "flex-end",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    boxShadow: "0 1px 1px #b3b3b3",
  },

  quotedContainerRight: {
    margin: "-3px -80px 6px -6px",
    overflowY: "hidden",
    backgroundColor: "#cfe9ba",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  quotedMsgRight: {
    padding: 10,
    maxWidth: 300,
    height: "auto",
    whiteSpace: "pre-wrap",
  },

  quotedSideColorRight: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },

  messageActionsButton: {
    display: "none",
    position: "relative",
    color: "#999",
    zIndex: 1,
    backgroundColor: "inherit",
    opacity: "90%",
    "&:hover, &.Mui-focusVisible": { backgroundColor: "inherit" },
  },

  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },

  textContentItem: {
    overflowWrap: "break-word",
    padding: "3px 80px 6px 6px",
  },

  textContentItemDeleted: {
    fontStyle: "italic",
    color: "rgba(0, 0, 0, 0.36)",
    overflowWrap: "break-word",
    padding: "3px 80px 6px 6px",
  },

  messageMedia: {
    objectFit: "cover",
    width: 250,
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },

  timestamp: {
    fontSize: 11,
    position: "absolute",
    bottom: 0,
    right: 5,
    color: "#999",
    width: 60
  },

  dailyTimestamp: {
    alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
    width: "110px",
    backgroundColor: "#e1f3fb",
    margin: "10px",
    borderRadius: "10px",
    boxShadow: "0 1px 1px #b3b3b3",
  },

  dailyTimestampText: {
    color: "#808888",
    padding: 8,
    alignSelf: "center",
    marginLeft: "0px",
  },

  ackIcons: {
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  deletedIcon: {
    fontSize: 18,
    verticalAlign: "middle",
    marginRight: 4,
  },

  ackDoneAllIcon: {
    color: green[500],
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  downloadMedia: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "inherit",
    padding: 10,
  },
  imageLocation: {
    position: 'relative',
    width: 190,
    height: 190,
    borderRadius: 5
  },
  textDownloadMedias: {
    textAlign: 'center',
    fontSize: 11,
    color: 'grey',
    paddingTop: 20,
    top: 10,
    left: 65,
    opacity: 0.6,
    cursor: 'pointer'
  },
  hiddenTextContentItem: {
    bottom: 0,
    right: 0,
    position: 'absolute'
  },
  bodyMsgLink: {
    color: '#000',
    textDecoration: 'none'
  },
  messageLink: {
    display: 'flex',
    flexDirection: 'row',
    borderRadius: 5,
    overflow: 'hidden',
    width: '114%',
    backgroundColor: '#d9d9d9',
    marginBottom: 5
  },
  imageLink: {
    width: 100,
    height: 100,
  },
  titleMsgLink: {
    fontWeight: '500',
    marginTop: 5
  },
  descriptionMsgLink: {
    overflow: 'hidden',
    lineHeight: '22px',
    fontSize: 12
  },
  statusTicket: {
    width: isMobile ? '90%' : '60%',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 15,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  }

}));

const reducer = (state, action) => {
  if (action.type === "LOAD_MESSAGES") {
    const messages = action.payload;
    const newMessages = [];

    messages.forEach((message) => {
      const messageIndex = state.findIndex((m) => m.id === message.id);
      if (messageIndex !== -1) {
        state[messageIndex] = message;
      } else {
        newMessages.push(message);
      }
    });

    return [...newMessages, ...state];
  }

  if (action.type === "ADD_MESSAGE") {
    const newMessage = action.payload;
    const messageIndex = state.findIndex((m) => m.id === newMessage.id);

    if (messageIndex !== -1) {
      state[messageIndex] = newMessage;
    } else {
      state.push(newMessage);
    }

    return [...state];
  }

  if (action.type === "UPDATE_MESSAGE") {
    const messageToUpdate = action.payload;
    const messageIndex = state.findIndex((m) => m.id === messageToUpdate.id);

    if (messageIndex !== -1) {
      state[messageIndex] = messageToUpdate;
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const MessagesList = ({ ticket, ticketId, isGroup }) => {
  const classes = useStyles();
  const history = useHistory();

  const [messagesList, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [userVCARD, setuserVCARD] = useState({});

  const [update, setUpdate] = useState(0);
  const [mediasToDownload, setmediasToDownload] = useState([]);
  const [dontShowThisMessages, setdontShowThisMessages] = useState([]);
  const lastMessageRef = useRef();
  const modalMessageMediaRef = useRef();

  const [selectedMessage, setSelectedMessage] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const messageOptionsMenuOpen = Boolean(anchorEl);
  const currentTicketId = useRef(ticketId);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);

    currentTicketId.current = ticketId;
  }, [ticketId]);

  useEffect(() => {
    setLoading(true);

    const delayDebounceFn = setTimeout(() => {
      const fetchMessages = async () => {
        if (ticketId === undefined) return;
        try {
          const { data } = await api.get("/messages/" + ticketId, {
            params: { pageNumber },
          });

          if (currentTicketId.current === ticketId) {
            dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
            setHasMore(data.hasMore);
            setLoading(false);
          }

          if (pageNumber === 1 && data.messages.length > 1) {
            scrollToBottom();
          }

        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchMessages();

    }, 800);
    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [pageNumber, ticketId]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketConnection({ companyId });

    socket.on("connect", () => socket.emit("joinChatBox", `${ticket.id}`));

    socket.on(`company-${companyId}-appMessage`, (data) => {
      if (data.action === "create") {
        dispatch({ type: "ADD_MESSAGE", payload: data.message });
        scrollToBottom();
        setUpdate(Math.random());
      }

      if (data.action === "update") {
        dispatch({ type: "UPDATE_MESSAGE", payload: data.message });
        setUpdate(Math.random());
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId, ticket]);

  const loadMore = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({});
    }
  };

  const handleScroll = (e) => {
    if (!hasMore) return;
    const { scrollTop } = e.currentTarget;

    if (scrollTop === 0) {
      document.getElementById("messagesList").scrollTop = 100;
    }

    if (loading) {
      return;
    }

    if (scrollTop < 1) {
      loadMore();
      document.getElementById("messagesList").scrollTop = 100;
    }
  };

  const handleOpenMessageOptionsMenu = (e, message) => {
    setAnchorEl(e.currentTarget);
    setSelectedMessage(message);
  };

  const handleCloseMessageOptionsMenu = (e) => {
    setAnchorEl(null);
  };

  const checkMessageMedia = (message, idx, fromMe) => {
    if (message.mediaType === "image") {
      const isMedias = checkIsMultiMedias(idx, fromMe)
      if (isMedias) {
        return isMedias.map((media, idx, array) => {
          if (isMedias.filter(item => item.id === media.id).length > 1) return
          return (
            <>
              <ModalImageCors
                group
                width={100}
                imageUrl={media.mediaUrl}
              />
              {idx + 1 == isMedias.length &&
                <Typography
                  onClick={() => onChangeFile(isMedias)}
                  className={classes.textDownloadMedias}>
                  <GetAppIcon style={{ fontSize: 30 }} />{'\n'}SALVAR TODOS</Typography>}
            </>
          )
        });

      } else {
        return <ModalImageCors width='auto' imageUrl={message.mediaUrl}
        />;
      }

    }
    if (message.mediaType === "audio") {
      return (
        <audio controls>
          <source src={message.mediaUrl} type="audio/ogg"></source>
        </audio>
      );
    }

    if (message.mediaType === "video") {
      return (
        <video
          className={classes.messageMedia}
          src={message.mediaUrl}
          controls
        />
      );
    } else {
      return (
        <>
          <div className={classes.downloadMedia}>
            <Button
              startIcon={<GetApp />}
              color="primary"
              variant="outlined"
              target="_blank"
              href={message.mediaUrl}
            >
              Download
            </Button>
          </div>
          <Divider />
        </>
      );
    }
  };

  const checkIsMultiMedias = (idx, fromMe) => {
    const media1createdAt = messagesList[idx]?.createdAt;
    const media2createdAt = messagesList[idx + 1]?.createdAt;
    const media1IsImage = messagesList[idx]?.mediaType === 'image';
    const media2IsImage = messagesList[idx + 1]?.mediaType === 'image';
    const media3IsImage = messagesList[idx - 1]?.mediaType === 'image';
    const media1IsFromMe = messagesList[idx]?.fromMe == fromMe;
    const media2IsFromMe = messagesList[idx + 1]?.fromMe == fromMe;
    const media3IsFromMe = messagesList[idx - 1]?.fromMe == fromMe;
    if (
      difTime(media1createdAt, media2createdAt) < 70 && media1IsImage && media2IsImage && media1IsFromMe && media2IsFromMe
    ) {
      return renderGroupImages(idx, fromMe);
    } else if (difTime(messagesList[idx - 1]?.createdAt, media1createdAt) < 70 && media1IsImage && media3IsImage && media1IsFromMe && media3IsFromMe) {
      return renderGroupImages(idx, fromMe);
    } else {
      return false;
    }
  };

  const messageIsMultiMedias = (idx, isNotMedia, fromMe) => {
    const media1createdAt = messagesList[idx]?.createdAt;
    const media2createdAt = messagesList[idx + 1]?.createdAt;
    const media1IsImage = messagesList[idx]?.mediaType === 'image';
    const media2IsImage = messagesList[idx + 1]?.mediaType === 'image';
    const media3IsImage = messagesList[idx - 1]?.mediaType === 'image';
    const media1IsFromMe = messagesList[idx]?.fromMe == fromMe;
    const media2IsFromMe = messagesList[idx + 1]?.fromMe == fromMe;
    const media3IsFromMe = messagesList[idx - 1]?.fromMe == fromMe;
    if (isNotMedia) {
      return false;
    } else if (difTime(media1createdAt, media2createdAt) < 70 && media1IsImage && media2IsImage && media1IsFromMe && media2IsFromMe) {
      return true
    } else if (difTime(messagesList[idx - 1]?.createdAt, media1createdAt) < 70 && media1IsImage && media3IsImage && media1IsFromMe && media3IsFromMe) {
      return true
    } else { return false; }
  };

  const hiddenMultiMessages = (idx, isNotMedia, fromMe) => {
    const media1IsImage = messagesList[idx]?.mediaType === 'image';
    const media3IsImage = messagesList[idx - 1]?.mediaType === 'image';
    const media1IsFromMe = messagesList[idx]?.fromMe == fromMe;
    const media3IsFromMe = messagesList[idx - 1]?.fromMe == fromMe;
    if (!isNotMedia && difTime(messagesList[idx - 1]?.createdAt, messagesList[idx]?.createdAt) < 70 && media1IsImage && media3IsImage && media1IsFromMe && media3IsFromMe) {
      return true;
      //if (document.getElementById(message.id)) document.getElementById(message.id).style.display = 'none';
    } else {
      return false;
    }
  };

  const renderGroupImages = (idxCurrent, fromMe, isNotMedia) => {
    const media1IsFromMe = messagesList[idxCurrent]?.fromMe == fromMe;
    const media1IsImage = messagesList[idxCurrent]?.mediaType === 'image';
    var messagesMedia = messagesList.filter((message, idx, array_) => difTime(messagesList[idxCurrent]?.createdAt, message?.createdAt) < 70 && media1IsFromMe && message.fromMe == fromMe && media1IsImage && message.mediaType === 'image');
    return messagesMedia;
  };

  const difTime = (date1, date2) => {
    var inicio = new Date(date1);
    var fim = new Date(date2);
    const diferenca = new Date(fim - inicio);

    var resultado = diferenca.getUTCHours() * 60;
    resultado += diferenca.getUTCMinutes() * 60;
    resultado += diferenca.getUTCSeconds();
    return resultado;
  };

  const renderMessageAck = (message, status) => {
    if(status){ return <DoneAll fontSize="small" className={classes.ackDoneAllIcon} />; }
    if (message.ack === 0) {
      return <AccessTime fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 1) {
      return <Done fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 2) {
      return <DoneAll fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 3 || message.ack === 4) {
      return <DoneAll fontSize="small" className={classes.ackDoneAllIcon} />;
    }
  };

  const renderDailyTimestamps = (message, index) => {
    if (index === 0) {
      return (
        <span
          className={classes.dailyTimestamp}
          key={`timestamp-${message.id}`}
        >
          <div className={classes.dailyTimestampText}>
            {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
          </div>
        </span>
      );
    }
    if (index < messagesList.length - 1) {
      let messageDay = parseISO(messagesList[index].createdAt);
      let previousMessageDay = parseISO(messagesList[index - 1].createdAt);

      if (!isSameDay(messageDay, previousMessageDay)) {
        return (
          <span
            className={classes.dailyTimestamp}
            key={`timestamp-${message.id}`}
          >
            <div className={classes.dailyTimestampText}>
              {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
            </div>
          </span>
        );
      }
    }
    if (index == messagesList.length - 1) {
      return (
        <div
          key={`ref-${message.createdAt}`}
          ref={lastMessageRef}
          style={{ float: "left", clear: "both" }}
        />
      );
    }
  };

  const scrollTo = (message, index) => {
    if (index == messagesList.length - 1) {
      return (
        <div
          key={`ref-${message.createdAt}`}
          ref={lastMessageRef}
          style={{ float: "left", clear: "both" }}
        />
      );
    } else { return <></> }
  }

  const renderMessageDivider = (message, index) => {
    if (index < messagesList.length && index > 0) {
      let messageUser = messagesList[index].fromMe;
      let previousMessageUser = messagesList[index - 1].fromMe;

      if (messageUser !== previousMessageUser) {
        return (
          <span style={{ marginTop: 16 }} key={`divider-${message.id}`}></span>
        );
      }
    }
  };

  const renderQuotedMessage = (message) => {

    const quotedBodyMsg = message.quotedMsg?.body;

    return (
      <div
        onClick={() => {
          const y = document.getElementById(message.quotedMsg?.id).offsetTop - 10;
          document.getElementById("messagesList").scroll({
            top: y,
            behavior: 'smooth'
          });
        }}
        className={clsx(classes.quotedContainerLeft, {
          [classes.quotedContainerRight]: message.fromMe,
        })}
      >
        <span
          className={clsx(classes.quotedSideColorLeft, {
            [classes.quotedSideColorRight]: message.quotedMsg?.fromMe,
          })}
        ></span>
        <div className={classes.quotedMsg}>
          {!message.quotedMsg?.fromMe && (
            <span className={classes.messageContactName}>
              {message.quotedMsg?.contact?.name}
            </span>
          )}
          {quotedBodyMsg}
          {isVCard(quotedBodyMsg) ? 'Contato'
            : quotedBodyMsg.includes('data:image') ? 'Localização'
              : messageLink(message.body) && 'Link'}
        </div>
      </div>
    );
  };

  const isVCard = (message) => {
    return message.includes('BEGIN:VCARD');
  };

  const vCard = (message) => {
    var card = vcard?.parse(message);
    const name = card?.fn?.[0]?.value;
    const description = card?.['X-WA-BIZ-DESCRIPTION']?.[0]?.value || '';
    const numeros = card?.tel?.[0]?.value;
    const image = card?.photo?.[0]?.value;

    const user = {
      name,
      number: numeros,
      email: "",
    };

    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
          <Avatar style={{ marginRight: 10, marginLeft: 20, width: 60, height: 60 }} src={'data:image/png;base64, ' + image} />
          <div style={{ width: 350 }}>
            <div>
              <Typography
                noWrap
                component="h4"
                variant="body2"
                color="textPrimary"
                style={{ fontWeight: '700' }}
              >
                {name}
              </Typography>
            </div>

            <div style={{ width: 350 }}>
              <Typography
                component="span"
                variant="body2"
                color="textPrimary"
                style={{ display: 'flex' }}
              >
                {description}
              </Typography>
            </div>
            <div style={{ width: 350 }}>
              <Typography
                component="span"
                variant="body2"
                color="textPrimary"
                style={{ display: 'flex' }}
              >
                {numeros}
              </Typography>

            </div>
          </div>

        </div>
        <div style={{
          width: '100%', display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 20,
          borderWidth: '1px 0 0 0',
          borderTopColor: '#bdbdbd',
          borderStyle: 'solid',
          padding: 8
        }}>
          <Typography
            noWrap
            component="h4"
            variant="body2"
            color="textPrimary"
            style={{ fontWeight: '700', color: '#2c9ce7', cursor: 'pointer' }}
            onClick={() => { setNewTicketModalOpen(true); setuserVCARD(user) }}
          >
            Conversar
          </Typography>
        </div>
      </div>
    )
  };

  const onChangeFile = async (medias, url) => {
    const zip = new JSZip();
    const remoteZips = medias.map(async (media) => {

      const response = await fetch(media.mediaUrl);
      const data = await response.blob();
      const nameFile = media.mediaUrl.split('/').at(-1);

      zip.file(`${nameFile}`, data);
      return data;
    })

    Promise.all(remoteZips).then(() => {

      zip.generateAsync({ type: "blob" }).then((blob) => {
        const url = window.URL.createObjectURL(
          new Blob([blob]),
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `FileName.zip`,
        );

        document.body.appendChild(link);

        link.click();

        link.parentNode.removeChild(link);
      });


    })
  }

  const messageLocation = (message, createdAt) => {
    const image = message.body.split(' | ')[0];
    const link = message.body.split(' | ')[1];
    return (
      <>
        <a href={link} target="_blank" className={classes.bodyMsgLink}>
          <div className={classes.messageLink} style={{ width: '100%' }} >
            <img src={image} className={classes.imageLink} style={{ height: 220, width: 220 }} />
          </div>
          <a target="_blank" href={link} style={{ fontWeight: '500', color: 'gray', display: 'block' }} >Clique aqui para ver a localização!</a>
          <br />
        </a>
        <span className={classes.timestamp}>
          {format(parseISO(createdAt), "HH:mm")}
          {renderMessageAck(message, true)}
        </span>
      </>
    )
  };

  const messageLink = (message) => {

    if (!message.includes('"text":"http')) return
    const msgFormated = JSON.parse(message);
    const isThumbnailURL = msgFormated?.jpegThumbnail?.includes?.('https');
    return (
      <a href={msgFormated?.text} target="_blank" className={classes.bodyMsgLink}>
        <div className={classes.messageLink} >
          {isThumbnailURL? <img src={msgFormated?.jpegThumbnail} className={classes.imageLink} /> 
            : msgFormated?.jpegThumbnail && <img src={'data:image/png;base64,' + msgFormated?.jpegThumbnail} className={classes.imageLink} />}
          <div style={{ marginLeft: 5, height: 100, paddingTop: 10, }} >
            <span className={classes.titleMsgLink}>{msgFormated?.title}{'\n'}</span>
            <span className={classes.descriptionMsgLink}>{msgFormated?.description}{msgFormated?.description}</span>
          </div>
        </div>
        <a target="_blank" href={msgFormated?.text} style={{ fontWeight: '500', color: 'gray', display: 'block' }} >{msgFormated?.text}</a>
      </a>
    )
  };

  const quotedMessageLink = (message) => {

    if (!message.includes('"previewType":')) return
    const msgFormated = JSON.parse(message);
    return (
      <div>
        {msgFormated?.text}
      </div>
    )
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const renderStatusTicket = (message) =>{
    const formatedMsg = JSON.parse(message);
    return <div style={{backgroundColor: formatedMsg?.color,}} className={classes.statusTicket}>
      <p style={{color: '#000', fontWeight: '500', fontSize: isMobile? 12 : 15}}>  {formatedMsg?.text} {format(parseISO(formatedMsg?.date), "dd/MM/yyyy - HH:mm")}</p>
    </div>
  };
 
  const renderMessages = () => {
    if (messagesList.length > 0) {
      const viewMessagesList = messagesList.map((message, index) => {
        const isNotImage = message.mediaType !== 'image';
        const isNotMultimedia = !messageIsMultiMedias(index, isNotImage, message.fromMe);
        if (message.mediasGroup) { alert(message.mediasGroup) }
        if (!message.fromMe) {
          if (hiddenMultiMessages(index, isNotImage, false)) return scrollTo(message, index)
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderMessageDivider(message, index)}
              <div
                id={message.id}
                className={isNotMultimedia ? classes.messageLeft : classes.messageLeftMedia}
                title={message.queueId && message.queue?.name}
              >
                <IconButton
                  variant="contained"
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  className={classes.messageActionsButton}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                >
                  <ExpandMore />
                </IconButton>
                {isGroup && (
                  <span className={classes.messageContactName}>
                    {message.contact?.name}
                  </span>
                )}
                {message.mediaUrl && checkMessageMedia(message, index, false)}

                {message.body.includes('data:image') ? messageLocation(message, message.createdAt)
                  :
                  isVCard(message.body) ?
                    <div className={[classes.textContentItem, { marginRight: 0 }]}>
                      {vCard(message.body)}
                    </div>

                    :

                    (<div className={isNotMultimedia ? classes.textContentItem : classes.hiddenTextContentItem}>
                      {message.quotedMsg && renderQuotedMessage(message)}
                      {messageLink(message.body)}
                      {quotedMessageLink(message.body)}

                      <MarkdownWrapper>{(!isNotImage && !message.body.includes("jpeg") && isNotMultimedia) && message.body}</MarkdownWrapper>

                      <MarkdownWrapper>{(isNotImage && !messageLink(message.body) && !quotedMessageLink(message.body)) && message.body}</MarkdownWrapper>
                      <span className={classes.timestamp}>
                        {format(parseISO(message.createdAt), "HH:mm")}
                        {renderMessageAck(message, true)}
                      </span>
                    </div>)}
              </div>
            </React.Fragment>
          );
        } else {
          if (hiddenMultiMessages(index, isNotImage, true)) return scrollTo(message, index)
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderMessageDivider(message, index)}
              {message.body.includes('","color')? renderStatusTicket(message.body)
              : <div
                id={message.id}
                className={isNotMultimedia ? classes.messageRight : classes.messageRightMedia}
                title={message.queueId && message.queue?.name}
              >
                <IconButton
                  variant="contained"
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  className={classes.messageActionsButton}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                >
                  <ExpandMore />
                </IconButton>

                {message.mediaUrl && checkMessageMedia(message, index, true)}
                <div
                  className={clsx(isNotMultimedia ? classes.textContentItem : classes.hiddenTextContentItem, {
                    [classes.textContentItemDeleted]: message.isDeleted,
                  }
                  )}
                >
                  {message.isDeleted && (
                    <Block
                      color="disabled"
                      fontSize="small"
                      className={classes.deletedIcon}
                    />
                  )}
                  {message.body.includes('data:image') ? messageLocation(message, message.createdAt)
                    :
                    isVCard(message.body) ?
                      <div className={[classes.textContentItem]}>
                        {vCard(message.body)}
                      </div>

                      :
                      (message.quotedMsg) && renderQuotedMessage(message)}
                  {messageLink(message.body)}
                  {quotedMessageLink(message.body)}

                  <MarkdownWrapper>{(!isNotImage && !message.body.includes("jpeg") && isNotMultimedia) && message.body}</MarkdownWrapper>

                  <MarkdownWrapper>{(isNotImage && !messageLink(message.body) && !quotedMessageLink(message.body)) && message.body}</MarkdownWrapper> 
                  <span className={classes.timestamp}>
                    {format(parseISO(message.createdAt), "HH:mm")}
                    {renderMessageAck(message)}
                  </span>
                </div>
              </div> }
            </React.Fragment>
          );
        }
      });
      return viewMessagesList;
    } else {
      return <div>Say hello to your new contact!</div>;
    }
  };

  return (
    <div className={classes.messagesListWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialSearch={userVCARD}
        onClose={(ticket) => {
          //console.log("ticket", ticket);
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <MessageOptionsMenu
        message={selectedMessage}
        anchorEl={anchorEl}
        menuOpen={messageOptionsMenuOpen}
        handleClose={handleCloseMessageOptionsMenu}
      />
      <div
        id="messagesList"
        className={classes.messagesList}
        onScroll={handleScroll}
      >
        {messagesList.length > 0 ? renderMessages() : []}
      </div>
      {ticket?.channel !== "whatsapp" && (
        <div
          style={{
            width: "100%",
            display: "flex",
            padding: "10px",
            alignItems: "center",
            backgroundColor: "#E1F3FB",
          }}
        >
          {ticket?.channel === "facebook" ? (
            <Facebook small />
          ) : (
            <Instagram small />
          )}

          <span>
            Você tem 24h para responder após receber uma mensagem, de acordo
            com as políticas do Facebook.
          </span>
        </div>
      )}
      {loading && (
        <div>
          <CircularProgress className={classes.circleLoading} />
        </div>
      )}
    </div>
  );
};

export default MessagesList;