"use client";

import { useUser } from "@clerk/nextjs";
import { BoardDataService, boardService } from "../services";
import { useEffect, useState } from "react";
import { Board } from "../supabase/models";
import { useSupabase } from "../supabase/supabaseProvider";

export function useBoards() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if(user) {
      loadBoards();
    }
  },[user, supabase]);

  async function loadBoards() {
    if(!user) return; 

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
      setLoading(false)
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
