import { useState } from "react";
import BoardView from "../components/BoardView";
import ListView from "../components/ListView";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters";

function Home() {
  const [showBoard, setShowBoard] = useState(true);

  const handleToggle = () => {
    setShowBoard((prev) => !prev);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-slate-50 font-mono ">
        <div className="h-12 w-full flex items-center border-b border-neutral-700 mb-5  px-3 py-6">
          Voice Enabled - Task Tracker
        </div>

        <div className="px-3 pb-4">
          <TaskForm />
        </div>

        <div className="px-3 pb-6 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-neutral-200">
            {showBoard ? "Board View" : "List View"}
          </h2>
          <button
            type="button"
            onClick={handleToggle}
            className="inline-flex items-center justify-center rounded border border-neutral-700 bg-black px-3 py-1 text-xs font-semibold text-white hover:bg-neutral-900"
          >
            Switch to {showBoard ? "List" : "Board"} View
          </button>
        </div>

        <div className="px-3 pb-4">
          <TaskFilters />
        </div>

        <div className="px-3 pb-6">
          {showBoard ? <BoardView /> : <ListView />}
        </div>
      </div>
    </>
  );
}

export default Home;
