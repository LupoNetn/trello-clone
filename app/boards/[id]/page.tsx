"use client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoard } from "@/lib/hooks/useBoards";
import { useSupabase } from "@/lib/supabase/supabaseProvider";
import { DialogTitle } from "@radix-ui/react-dialog";
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

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { board,updateBoard } = useBoard(id);
  const { supabase } = useSupabase();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");

  async function handleUpdateBoard(e: React.FormEvent) {
    e.preventDefault();

    try {
      await updateBoard(board!.id, {
        title: newTitle.trim(),
        color: newColor || board?.color,
      });
      setIsEditingTitle(false)
    } catch (error) {}
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
    </div>
  );
}
