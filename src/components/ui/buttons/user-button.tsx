/** @format */
"use client";

import type React from "react";
import { memo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteSession } from "@/utils/session";

// MUI Components
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";

// MUI Icons
import AccountCircle from "@mui/icons-material/AccountCircle";
import Logout from "@mui/icons-material/Logout";
import Person from "@mui/icons-material/Person";

interface UserButtonProps {
  dict?: {
    profile?: string;
    signOut?: string;
  };
}

function ButtonUser({ dict }: UserButtonProps) {
  const router = useRouter();

  // Дефолтні переклади
  const profileLabel = dict?.profile || "Profile";
  const signOutLabel = dict?.signOut || "Sign Out";

  // Menu state management
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Open menu on click
  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  // Close menu
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Logout handler with error handling
  const handleLogout = useCallback(async () => {
    handleClose();

    try {
      await deleteSession();
      router.push("/signin");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [router, handleClose]);

  return (
    <>
      {/* Menu trigger button */}
      <Tooltip title={profileLabel}>
        <IconButton
          onClick={handleClick}
          size="large"
          color="inherit"
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          sx={{
            "&:hover": { backgroundColor: "action.hover" },
          }}
        >
          <AccountCircle fontSize="inherit" />
        </IconButton>
      </Tooltip>

      {/* Dropdown menu */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              minWidth: 150,
              mt: 1.5,
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Profile menu item */}
        <MenuItem component={Link} href="/user/profile">
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          {profileLabel}
        </MenuItem>

        <Divider />

        {/* Logout menu item */}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          {signOutLabel}
        </MenuItem>
      </Menu>
    </>
  );
}

// Memoize to prevent unnecessary re-renders from parent updates
export default memo(ButtonUser);
