"use client";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Calendar, MoreHorizontal, Plus, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import {DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, rectIntersection, useDroppable} from '@dnd-kit/core'
import {SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'


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

function DroppableColumn({
  column,
  children,
  onCreateTask,
  onEditColumn,
  handleCreateTask,
}: {
  column: ColumnWithTasks;
  children: React.ReactNode;
  onCreateTask: (taskData: any) => Promise<void>;
  onEditColumn: (column: ColumnWithTasks) => void;
  handleCreateTask: (taskData: any) => Promise<void>;
}) {

  const {setNodeRef, isOver} = useDroppable({id: column.id})

  return (
    <div ref={setNodeRef} className={`w-full lg:max-w-[400px] lg:flex-shrink-0 lg-w-80 ${isOver ? 'bg-blue-50 rounded-lg' : ''}`}>
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
        <div className="p-2">
          {children}

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full mt-3 sm:w-auto text-gray-500 hover:text-gray-700"
              >
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
      </div>
    </div>
  );
}

function SortableTask({ task }: { task: Task }) {

 
  const {attributes,listeners,setNodeRef,transform,transition,isDragging} = useSortable({id: task.id})

   const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }


  function getPriorityColor(
    priority: "low" | "medium" | "high"): string {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-green-500";
      case "low":
        return "bg-yellow-500";

      default:
        return "bg-yellow-500"
    }
  }
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={styles}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            {/* Task Header */}
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-gray-900 leading-tight flex-1 min-w-0 pr-2">
                {task.title}
              </h4>
            </div>

            {/* Task Description */}
            <p className="text-xs text-gray-600 line-clamp-2">
              {task.description || "No description."}
            </p>

            {/* Task Metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                {task.assignee && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span className="truncate">{task.assignee}</span>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <div>
                      <Calendar className="h-3 w-3" />
                    </div>
                    <span className="truncate">{task.due_date}</span>
                  </div>
                )}
              </div>
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


function TaskOverlay({ task }: { task: Task }) {

  function getPriorityColor(
    priority: "low" | "medium" | "high"): string {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-green-500";
      case "low":
        return "bg-yellow-500";

      default:
        return "bg-yellow-500"
    }
  }
  return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            {/* Task Header */}
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-gray-900 leading-tight flex-1 min-w-0 pr-2">
                {task.title}
              </h4>
            </div>

            {/* Task Description */}
            <p className="text-xs text-gray-600 line-clamp-2">
              {task.description || "No description."}
            </p>

            {/* Task Metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                {task.assignee && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span className="truncate">{task.assignee}</span>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <div>
                      <Calendar className="h-3 w-3" />
                    </div>
                    <span className="truncate">{task.due_date}</span>
                  </div>
                )}
              </div>
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
  );
}


export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { board, updateBoard, columns, createRealTask,setColumns } = useBoard(id);
  const { supabase } = useSupabase();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTask,setIsActiveTask] = useState<Task | null>(null)

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
        (formData.get("priority") as "low" | "medium" | "high") || "medium",
    };

    if (taskData.title.trim()) {
      await createTask(taskData);

      const trigger = document.querySelector(
        '[data-state="open"'
      ) as HTMLElement;
      if (trigger) trigger.click();
    }
  }

  function handleDragStart(event: DragStartEvent) {
       const taskId = event.active.id as string
       const task = columns.flatMap((col) => col.tasks.find((task) => taskId === task.id))

       if(task) {
        setIsActiveTask(task)
       }
  }

  function handleDragOver(event: DragOverEvent) {
    const {active,over} = event  

    const activeId = active.id as string;
    const overId = over!.id as string

    const sourceColumn = columns.find((col) => col.tasks.some((task) => task.id === activeId))

    const targetColumn = columns.find((col) => col.tasks.some((task) => task.id === overId))

    if(!sourceColumn || !targetColumn) return;

    if(sourceColumn.id === targetColumn.id) {
      const activeIndex = sourceColumn.tasks.findIndex((task) => task.id === activeId)

       const overIndex = sourceColumn.tasks.findIndex((task) => task.id === overId)

       if(activeIndex !== overIndex) {
        setColumns((prev: ColumnWithTasks[]) => {
          const newColumns = [...prev];
          const column = newColumns.find((col) => col.id === sourceColumn.id)
          if(column) {
            const tasks = [...column.tasks];
            const [removed] = tasks.splice(activeIndex,1)
            tasks.splice(overIndex,0,removed)
            column.tasks = tasks;
          }
          return newColumns;
        })
       }
    }


  }

  function handleDragEnd(event: DragEndEvent) {

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
        <DialogContent className="w-[90vw] max-w-[425px] mx-auto">
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

        <DndContext
          sensors={}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto lg:pb-6 lg:px-2 lg:mx-2 lg:[&::-webkit-scrollbar]:h-2 lg:[&::-webkit-scrollbar-track]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:bg-gray-300 lg:[&::-webkit-scrollbar-track]:rounded-full space-y-4 lg:space-y-8">
            {columns.map((column, key) => (
              <DroppableColumn
                key={key}
                column={column}
                onCreateTask={createTask}
                onEditColumn={() => {}}
                handleCreateTask={handleCreateTask}
              >
               <SortableContext items={column.tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                 <div className="space-y-3">
                  {column.tasks.map((task, key) => (
                    <SortableTask task={task} key={key} />
                  ))}
                </div>
               </SortableContext>
              </DroppableColumn>
            ))}

            <DragOverlay>
              {activeTask ? <TaskOverlay task={activeTask}/> : null }
            </DragOverlay>
          </div>
        </DndContext>
      </main>
    </div>
  );
}
