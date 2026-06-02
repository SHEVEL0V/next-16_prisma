/** @format */
"use client";

import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { Box, Divider, IconButton, List, Typography } from "@mui/material";
import { useState } from "react";
import CreateBoardForm from "./create-board-form";
import BoardItem from "./sidebar-item";

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 80;

import type { Dict } from "@/types";

type SidebarProps = {
  boards: { id: string; title: string }[];
  activeBoard?: string;
  dict?: Dict;
};

export default function Sidebar({ boards, activeBoard, dict }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const openSidebar = () => setIsOpen(true);

  return (
    <Box
      component="aside"
      className="glass-effect"
      sx={{
        minWidth: isOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        transition: "width 0.3s ease",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen ? "space-between" : "center",
          height: 64,
        }}
      >
        {isOpen && (
          <Typography id="board-title" variant="h6" sx={{ fontWeight: "bold" }}>
            {dict?.Board?.boardsTitle || "Boards"}
          </Typography>
        )}
        <IconButton onClick={toggleSidebar}>{isOpen ? <MenuOpenIcon /> : <MenuIcon />}</IconButton>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, overflowY: "auto", p: isOpen ? 2 : 1 }}>
        {boards.map((board) => (
          <BoardItem
            key={board.id}
            id={board.id}
            title={board.title}
            isActive={board.id === activeBoard}
            isOpen={isOpen}
            dict={dict}
          />
        ))}
      </List>

      <Divider />
      <CreateBoardForm isOpen={isOpen} onOpenSidebarAction={openSidebar} dict={dict} />
    </Box>
  );
}
