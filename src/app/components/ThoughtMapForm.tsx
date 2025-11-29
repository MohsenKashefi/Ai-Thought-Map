import { useState } from "react";
import type { MindMap, GenerateMindMapResponse } from "../../types/mindmap";
import { MindMapVisualization } from "./MindMapVisualization";
import { SavedMaps } from "./SavedMaps";
import { MindMapStorage, type SavedMindMap } from "../../services/storage";

export const ThoughtMapForm: React.FC = () => {
  const [userInput, setUserInput] = useState("");
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInput.trim()) {
      setError("Please enter a problem, idea, or question");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMindMap(null);

    try {
      const response = await fetch("/api/generate-mindmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInput }),
      });

      const data: GenerateMindMapResponse = await response.json();

      if (!data.success || !data.mindMap) {
        throw new Error(data.error || "Failed to generate mind map");
      }

      setMindMap(data.mindMap);

      // Auto-save the generated mind map
      try {
        const saved = MindMapStorage.save(data.mindMap, userInput);
        setCurrentSavedId(saved.id);
        setSaveMessage("✓ Saved");
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (saveErr) {
        console.error("Failed to save mind map:", saveErr);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUserInput("");
    setMindMap(null);
    setError(null);
    setCurrentSavedId(null);
    setSaveMessage(null);
  };

  const handleLoad = (saved: SavedMindMap) => {
    setUserInput(saved.userInput);
    setMindMap(saved.mindMap);
    setCurrentSavedId(saved.id);
    setError(null);
    setSaveMessage("✓ Loaded");
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="thought-map-container">
      <SavedMaps onLoad={handleLoad} />

      <div className="form-section">
        <h1>AI Thought Map</h1>
        <p className="subtitle">
          Enter a problem, idea, or question and we'll generate a mind map to help you explore it
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="E.g., How can I improve my productivity?&#10;E.g., Starting a sustainable business&#10;E.g., Learning a new programming language"
            rows={6}
            disabled={isLoading}
            className="input-textarea"
          />

          <div className="button-group">
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? "Generating..." : "Generate Map"}
            </button>

            {mindMap && (
              <button type="button" onClick={handleReset} className="btn btn-secondary">
                New Map
              </button>
            )}

            {saveMessage && (
              <span className="save-message">{saveMessage}</span>
            )}
          </div>
        </form>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {mindMap && (
        <div className="result-section">
          <MindMapVisualization mindMap={mindMap} />
        </div>
      )}
    </div>
  );
};
