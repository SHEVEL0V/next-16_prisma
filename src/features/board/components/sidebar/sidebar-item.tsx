/** @format */
"use client";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import { Box, ListItem, ListItemButton, ListItemIcon, Tooltip, Typography } from "@mui/material";
import Link from "next/link";
import { useActionState, startTransition, useRef, useState } from "react";
import EditableTextField from "@/components/ui/fields/editable-text-field";
import { MoreButton } from "@/components/ui/buttons";
import { deleteBoardAction, updateBoardAction } from "../../actions";
import CustomDialog from "@/components/ui/modals/custom-dialog";

import type { Dict } from "@/types";

interface SidebarItemProps {
  id: string;
  title: string;
  isActive: boolean;
  isOpen: boolean;
  dict?: Dict;
}

export default function SidebarItem({ id, title, isActive, isOpen, dict }: SidebarItemProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [, updateAction, isPendingUpdate] = useActionState(updateBoardAction, {
    success: false,
    errors: {},
  });
  const [deleteState, deleteAction, isPendingDelete] = useActionState(deleteBoardAction, {
    success: false,
    errors: {},
  });

  const handleSubmit = async (formData: FormData) => {
    updateAction(formData);
    setIsEditing(false);
  };

  const handleConfirmDelete = () => {
    const formData = new FormData();
    formData.append("id", id);
    startTransition(() => {
      deleteAction(formData);
    });
    setIsDeleteDialogOpen(false);
  };

  const isPending = isPendingUpdate || isPendingDelete;

  return (
    <>
      <ListItem disablePadding sx={{ mb: 0.5, "&:hover .more-btn": { opacity: 1 } }}>
        <Tooltip title={title} placement="right" disableHoverListener={isOpen}>
          <ListItemButton
            selected={isOpen && isActive}
            component={isEditing ? "div" : Link}
            href={isEditing ? undefined : `?id=${id}`}
            sx={{ borderRadius: 2, px: isOpen ? 2 : 1, minHeight: 48 }}
          >
            <ListItemIcon
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ViewKanbanIcon color={isActive ? "primary" : "inherit"} />
            </ListItemIcon>

            {isOpen && (
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                {isEditing ? (
                  <form action={handleSubmit} ref={formRef} style={{ width: "100%" }}>
                    <input type="hidden" name="id" value={id} />
                    <EditableTextField
                      defaultValue={title}
                      name="title"
                      autoFocus
                      handleToggleEdit={setIsEditing}
                      formRef={formRef}
                    />
                  </form>
                ) : (
                  <>
                    <Typography variant="body1" noWrap sx={{ flexGrow: 1 }}>
                      {title}
                    </Typography>
                    <Box
                      className="more-btn"
                      sx={{ opacity: { xs: 1, md: 0 }, transition: "0.2s" }}
                    >
                      <MoreButton
                        onClickEditAction={() => setIsEditing(true)}
                        onClickDeleteAction={() => setIsDeleteDialogOpen(true)}
                        isPending={isPending}
                        dict={dict}
                      />
                    </Box>
                  </>
                )}
              </Box>
            )}
          </ListItemButton>
        </Tooltip>
      </ListItem>

      <CustomDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={dict?.Board?.deleteBoard || "Delete board"}
        description={(
          dict?.Board?.confirmDelete ||
          'Are you sure you want to delete the board "{title}"? This action cannot be undone.'
        ).replace("{title}", title)}
        state={deleteState}
        isPending={isPendingDelete}
        dict={dict?.Dialog}
      />
    </>
  );
}
