"use client";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBoard } from "@/lib/hooks/useBoards";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import { useSupabase } from "@/lib/supabase/supabaseProvider";
import { DialogTitle } from "@radix-ui/react-dialog";
import { create } from "domain";
import { MoreHorizontal, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

const tailwindColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-rose-500",
];

function Column({
  column,
  children,
  onCreateTask,
  onEditColumn,
}: {
  column: ColumnWithTasks;
  children: React.ReactNode;
  onCreateTask: (taskData: any) => Promise<void>;
  onEditColumn: (column: ColumnWithTasks) => void;
}) {
  return (
    <div className="w-full lg:max-w-[400px] lg:flex-shrink-0 lg-w-80">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Column Header  */}
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {column.title}
              </h3>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {column.tasks.length}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="flex-shrink-0">
              <MoreHorizontal />
            </Button>
          </div>
        </div>

        {/* Column Content */}
        <div className="p-2">{children}</div>
      </div>
    </div>
  );
}

function Task({ task }: { task: Task }) {}

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { board, updateBoard, columns, createRealTask } = useBoard(id);
  const { supabase } = useSupabase();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  async function handleUpdateBoard(e: React.FormEvent) {
    e.preventDefault();

    try {
      await updateBoard(board!.id, {
        title: newTitle.trim(),
        color: newColor || board?.color,
      });
      setIsEditingTitle(false);
    } catch (error) {}
  }

  async function createTask(taskData: {
    title: string;
    description?: string;
    assignee?: string;
    dueDate?: string;
    priority: "low" | "medium" | "high";
  }) {
    const targetColumn = columns[0];
    if (!targetColumn) {
      throw new Error("No column available to add task");
    }

    await createRealTask(targetColumn.id, taskData);
  }

  async function handleCreateTask(e: any) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const taskData = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      assignee: (formData.get("assignee") as string) || undefined,
      dueDate: (formData.get("dueDate") as string) || undefined,
      priority:
        (formData.get("title") as "low" | "medium" | "high") || "medium",
    };

    if (taskData.title.trim()) {
      await createTask(taskData);

      const trigger = document.querySelector(
        '[data-state="open"'
      ) as HTMLElement;
      if (trigger) trigger.click();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        boardTitle={board?.title}
        onEditBoard={() => {
          setNewTitle(board?.title ?? "");
          setNewColor(board?.color ?? "");
          setIsEditingTitle(true);
        }}
        onFilter={() => {
          setIsFilterOpen(true);
        }}
        filterCount={2}
      />

      <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
          </DialogHeader>
          <form className="space-y-6" onSubmit={(e) => handleUpdateBoard(e)}>
            <div className="space-y-2">
              <Label htmlFor="boardTitle">Board Title</Label>
              <Input
                id="boardTitle"
                placeholder="Enter board title..."
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Board Colors</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 space-y-4 place-items-center">
                {tailwindColors.map((color, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className={`h-8 w-8 rounded-full ${color} ${color === newColor ? "ring-2 ring-offset-2 ring-gray-900" : ""}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditingTitle(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader className="text-left">
            <DialogTitle>Filter Tasks</DialogTitle>
            <p className="text-sm text-gray-600">
              Filter tasks by priority, assignee, or due date
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <div className="flex flex-wrap gap-2">
                {["low", "medium", "high"].map((priority, key) => (
                  <Button key={key} variant={"outline"} size="sm">
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* <div className="space-y-2">
              <Label>Assignee</Label>
              <div className="flex flex-wrap gap-2">
                {["low", "medium", "high"].map((priority, key) => (
                  <Button key={key} variant={"outline"} size='sm'>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Button>
                ))}
              </div>
            </div> */}

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" />
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant={"outline"}>
                Clear Filters
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsFilterOpen(false);
                }}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Board content */}

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total Tasks: </span>
              {columns.reduce((sum, col) => sum + col.tasks.length, 0)}
            </div>
          </div>

          {/* add task diallog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
              <DialogHeader className="text-left">
                <DialogTitle>Create New Task</DialogTitle>
                <p className="text-sm text-gray-600">Add a task to the board</p>
              </DialogHeader>

              <form className="space-y-4" onSubmit={handleCreateTask}>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter task title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Input
                    id="assignee"
                    name="assignee"
                    placeholder="who should do this"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input id="dueDate" name="dueDate" type="date" />
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["low", "medium", "high"].map((priority, key) => (
                        <SelectItem key={key} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="submit">Create Task</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Board Columns */}
        <div className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto lg:pb-6 lg:px-2 lg:mx-2 lg:[&::-webkit-scrollbar]:h-2 lg:[&::-webkit-scrollbar-track]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:bg-gray-300 lg:[&::-webkit-scrollbar-track]:rounded-full space-y-4 lg:space-y-8">
          {columns.map((column, key) => (
            <Column
              key={key}
              column={column}
              onCreateTask={createTask}
              onEditColumn={() => {}}
            >
              <div className="space-y-3">
                {column.tasks.map((task, key) => (
                  <Task task={task} key={key} />
                ))}
              </div>
            </Column>
          ))}
        </div>
      </main>
    </div>
  );
}
