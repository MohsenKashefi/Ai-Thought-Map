import { ThoughtMapForm } from "./app/components/ThoughtMapForm";

export const App = () => {
  return (
    <div className="app-container">
      <header>
        <h1>AI Thought Map</h1>
        <p>Transform your ideas into structured mind maps</p>
      </header>
      <main>
        <ThoughtMapForm />
      </main>
    </div>
  );
};
