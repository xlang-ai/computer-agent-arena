import { useArena } from "../../../context/ArenaContext";

interface ControlProps {
  name: string;
  setParameters: (parameters: Record<string, any>) => void;
}

export default function Control({ name, setParameters }: ControlProps) {
  return (
    <div className="w-full h-full border-b border-gray-900/10 m-1 gap-4">
      <p className="mt-1 text-sm/6 text-gray-600">
        Or just click on "Go!" and setup the desktop by normally click, type or scroll just like your own ones!
      </p>
    </div>
  );
}
