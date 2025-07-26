import { Board, Column } from "./supabase/models";
import { SupabaseClient } from "@supabase/supabase-js";

export const boardService = {
  async getBoard(supabase: SupabaseClient, boardId: string): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .single();

    if (error) {
      console.error("Error fetching boards:", error.message);
      throw error;
    }

    return data;
  },

  async getBoards(supabase: SupabaseClient, userId: string): Promise<Board[]> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching boards:", error.message);
      throw error;
    }

    return data || [];
  },

  async createBoard(
    supabase: SupabaseClient,
    board: Omit<Board, "id" | "created_at" | "updated_at">
  ): Promise<Board> {
    console.log("Creating board with data:", board);

    const { data, error } = await supabase
      .from("boards")
      .insert(board)
      .select()
      .single();

    if (error) {
      console.error("Error creating board:", error.message);
      throw error;
    }

    console.log("Board created:", data);
    return data;
  },

  async updateBoard(
    supabase: SupabaseClient,
    boardId: string,
    update: Partial<Board>
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq("id", boardId)
      .select()
      .single();

    if (error) {
      console.error("Error updating board:", error.message);
      throw error;
    }

    return data;
  },
};

export const columnService = {
  async createColumn(
    supabase: SupabaseClient,
    column: Omit<Column, "id" | "created_at">
  ): Promise<Column> {
    console.log("Creating column with data:", column);

    const { data, error } = await supabase
      .from("columns")
      .insert(column)
      .select()
      .single();

    if (error) {
      console.error("Error creating column:", error.message, error.details);
      throw error;
    }

    console.log("Column created:", data);
    return data;
  },

  async getColumns(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Column[]> {
    const { data, error } = await supabase
      .from("columns")
      .select("*")
      .eq("board_id", boardId)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching boards:", error.message);
      throw error;
    }

    return data || [];
  },
};

export const BoardDataService = {
  async getBoardWithColumns(supabase: SupabaseClient, boardId: string) {
    const [board, columns] = await Promise.all([
      boardService.getBoard(supabase, boardId),
      columnService.getColumns(supabase, boardId),
    ]);

    if (!board) {
      throw new Error("Board not found");
    }
    return {
      board,
      columns,
    };
  },

  async createBoardWithDefaultColumns(
    supabase: SupabaseClient,
    boardData: {
      title: string;
      description?: string;
      color?: string;
      userId: string;
    }
  ) {
    console.log(
      "Creating board and default columns for user:",
      boardData.userId
    );

    const board = await boardService.createBoard(supabase, {
      title: boardData.title,
      description: boardData.description || null,
      color: boardData.color || "bg-blue-500",
      user_id: boardData.userId,
    });

    const defaultColumns = [
      { title: "To Do", sort_order: 0 },
      { title: "In Progress", sort_order: 1 },
      { title: "Review", sort_order: 2 },
      { title: "Done", sort_order: 3 },
    ];

    const columnsToInsert = defaultColumns.map((col) => ({
      ...col,
      board_id: board.id,
      user_id: boardData.userId,
    }));

    console.log("Inserting default columns:", columnsToInsert);

    await Promise.all(
      columnsToInsert.map((column) =>
        columnService.createColumn(supabase, column)
      )
    );

    console.log("All default columns inserted successfully.");
    return board;
  },
};
