"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listModels } from "@/actions/list-models";
import { createModel } from "@/actions/create-model";
import { createProblem } from "@/actions/create-problem";

const DEFAULT_MODEL = "google/gemini-2.5-flash";

interface CreateProblemFormProps {
  encryptedUserId: string;
}

export default function CreateProblemForm({
  encryptedUserId,
}: CreateProblemFormProps) {
  const router = useRouter();
  const [models, setModels] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [newModelName, setNewModelName] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  useEffect(() => {
    async function loadModels() {
      try {
        const modelsList = await listModels(encryptedUserId);
        setModels(modelsList);
        if (modelsList.length > 0) {
          setSelectedModel(modelsList[0].name);
        } else {
          setSelectedModel(DEFAULT_MODEL);
        }
      } catch (error) {
        console.error("Failed to load models:", error);
        setSelectedModel(DEFAULT_MODEL);
      } finally {
        setIsLoadingModels(false);
      }
    }
    loadModels();
  }, [encryptedUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      let modelToUse = selectedModel;

      // If a new model name is provided, create it first
      if (newModelName.trim()) {
        try {
          const newModel = await createModel(newModelName.trim(), encryptedUserId);
          modelToUse = newModel.name;
          // Refresh models list
          const updatedModels = await listModels(encryptedUserId);
          setModels(updatedModels);
          setNewModelName("");
        } catch (error) {
          console.error("Failed to create model:", error);
          alert("Failed to create model. Please try again.");
          setIsCreating(false);
          return;
        }
      }

      // Create problem with selected model
      const { problemId } = await createProblem(modelToUse, encryptedUserId);
      router.push(`/problem/${problemId}`);
    } catch (error) {
      console.error("Failed to create problem:", error);
      alert("Failed to create problem. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Problem</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="model-select">Select Model</Label>
          {isLoadingModels ? (
            <div className="text-sm text-muted-foreground">Loading models...</div>
          ) : (
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
              disabled={isCreating}
            >
              <SelectTrigger id="model-select" className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.name}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-model">Or Add New Model</Label>
          <Input
            id="new-model"
            type="text"
            placeholder="Enter model name (e.g., google/gemini-2.5-flash)"
            value={newModelName}
            onChange={(e) => setNewModelName(e.target.value)}
            disabled={isCreating}
          />
          <p className="text-sm text-muted-foreground">
            If you enter a new model name, it will be created and used for this problem.
          </p>
        </div>

        <Button type="submit" disabled={isCreating || isLoadingModels}>
          {isCreating ? "Creating..." : "Create Problem"}
        </Button>
      </form>
    </div>
  );
}

