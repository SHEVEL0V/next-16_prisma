/** @format */

// features/board/components/board-canvas.tsx
import { Box } from "@mui/material";
import { CenteredMessage } from "@/components/ui/utilities";
import DragDropWrapper from "@/features/board/components/drag-drop";
import Sidebar from "@/features/board/components/sidebar/sidebar";
import { getBoardById, getBoards } from "@/features/board/queries";

export default async function Board({ boardId }: { boardId?: string }) {
  const boards = (await getBoards())?.data ?? [];

  const activeBoard = boardId || boards[0]?.id;

  const data = activeBoard ? (await getBoardById(activeBoard)).data : null;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar boards={boards} activeBoard={activeBoard} />
      {data ? (
        <DragDropWrapper boardId={activeBoard} initialData={data.columns} />
      ) : (
        <CenteredMessage message="Please create a new board." />
      )}
    </Box>
  );
}
