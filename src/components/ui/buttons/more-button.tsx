/** @format */
"use client";
import type React from "react";
import { useState, useCallback } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import type { Dict } from "@/types";

export default function MoreButton({
  onClickEditAction,
  onClickDeleteAction,
  isPending = false,
  dict,
}: {
  onClickEditAction: () => void;
  onClickDeleteAction: () => void;
  isPending?: boolean;
  dict?: Dict;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = useCallback(() => {
    handleClose();
    onClickEditAction();
  }, [onClickEditAction]);

  const handleDelete = useCallback(() => {
    handleClose();
    onClickDeleteAction();
  }, [onClickDeleteAction]);

  return (
    <>
      <IconButton
        size="small"
        onClick={handleOpen}
        aria-controls={open ? "action-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        disabled={isPending}
      >
        {isPending ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <MoreHorizIcon fontSize="small" />
        )}
      </IconButton>

      <Menu
        id="action-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleEdit} disabled={isPending}>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{dict?.Editor?.edit || "Edit"}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDelete} disabled={isPending} color="error">
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{dict?.Editor?.delete || "Delete"}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
