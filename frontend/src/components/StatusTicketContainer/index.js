import { Chip, Paper, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useEffect, useRef, useState } from "react";
import { isArray, isString } from "lodash";
import toastError from "../../errors/toastError";
import api from "../../services/api";

export function StatusTicketContainer ({ ticket }) {

    const [tags, setTags] = useState([]);
    const [selecteds, setSelecteds] = useState([]);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    useEffect(() => {
        if (isMounted.current) {
            loadTags().then(() => {
                if (Array.isArray(ticket.statusTicket)) {
                    setSelecteds(ticket.statusTicket);
                } else {
                    setSelecteds([]);
                }
            });
        }
    }, [ticket]);

    const createTag = async (data) => {
        try {
            const { data: responseData } = await api.post(`/tickets-status/`, data);
            return responseData;
        } catch (err) {
            toastError(err);
        }
    }

    const loadTags = async () => {
        try {
            const { data } = await api.get(`/tickets-status/listSimple`);
            setTags(data);
            console.log(data)
        } catch (err) {
            toastError(err);
        }
    }

    const syncTags = async (data) => {
        try {
            const { data: responseData } = await api.post(`/tickets-status/sync`, data);
            return responseData;
        } catch (err) {
            toastError(err);
        }
    }

    const onChange = async (value, reason) => {
        let optionsChanged = []
        if (reason === 'create-option') {
            if (isArray(value)) {
                for (let item of value) {
                    if (isString(item)) {
                        //const newTag = await createTag({ name: item })
                        //optionsChanged.push(newTag);
                    } else {
                        optionsChanged.push(item);
                    }
                }
            }
            await loadTags();
        } else {
            optionsChanged = value;
        }
        setSelecteds(optionsChanged);
        await syncTags({ ticketId: ticket.id, tags: optionsChanged });
    }

    return (
        <Paper style={{padding: 12}}>
            <Autocomplete
                multiple
                size="small"
                options={tags}
                value={selecteds}
                freeSolo
                onChange={(e, v, r) => onChange(v, r)}
                getOptionLabel={(option) => option.title}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            variant="outlined"
                            style={{backgroundColor: option.color || '#eee', textShadow: '1px 1px 1px #000', color: 'white'}}
                            label={option.title}
                            {...getTagProps({ index })}
                            size="small"
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" placeholder="Status" />
                )}
                PaperComponent={({ children }) => (
                    <Paper style={{width: 400, marginLeft: 12}}>
                        {children}
                    </Paper>
                )}
            />
        </Paper>
    )
}