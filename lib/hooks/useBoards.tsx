"use client";

import { useUser } from "@clerk/nextjs";
import { BoardDataService, boardService, taskService } from "../services";
import { useEffect, useState } from "react";
import { Board, Column, ColumnWithTasks } from "../supabase/models";
import { useSupabase } from "../supabase/supabaseProvider";

export function useBoards() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBoards();
    }
  }, [user, supabase]);

  async function loadBoards() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await boardService.getBoards(supabase!, user.id);
      setBoards(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while loading the boards"
      );
    } finally {
      setLoading(false);
    }
  }

  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
  }) {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    // Call the service to create a board with default columns
    try {
      const newBoard = await BoardDataService.createBoardWithDefaultColumns(
        supabase!,
        {
          ...boardData,
          userId: user.id,
        }
      );
      setBoards((prevBoards) => [newBoard, ...prevBoards]);
      setLoading(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while creating the board"
      );
    }
  }

  return { boards, loading, error, createBoard };
}

export function useBoard(boardId: string) {
  const { supabase } = useSupabase();
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (boardId) {
      loadBoard();
    }
  }, [boardId, supabase]);

  async function loadBoard() {
    if (!boardId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await BoardDataService.getBoardWithColumns(
        supabase!,
        boardId
      );
      setBoard(data.board);
      setColumns(data.columnsWithTasks);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while loading the board"
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateBoard(board: string, updates: Partial<Board>) {
    try {
      const updateBoard = await boardService.updateBoard(
        supabase!,
        boardId,
        updates
      );
      setBoard(updateBoard);
      return updateBoard;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the board"
      );
    }
  }

  async function createRealTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority: "low" | "medium" | "high";
    }
  ) {
    try {
      const newTask = await taskService.createTask(supabase!, {
        title: taskData.title,
        description: taskData.description || null,
        assignee: taskData.assignee || null,
        due_date: taskData.dueDate || null,
        column_id: columnId,
        sort_order:
          columns.find((col) => col.id === columnId)?.tasks.length || 0,
        priority: taskData.priority || "medium",
      });

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
        )
      );

      return newTask;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while creatung the task"
      );
    }
  }

  return { board, columns, loading, error, updateBoard, createRealTask,setColumns };
}
