import { useEffect, useState } from "react";

interface VSCodeCloneProps {
  setParameters: (params: any) => void;
}

export default function VSCodeClone({  setParameters }: VSCodeCloneProps) {
  const [repositoryUrl, setRepositoryUrl] = useState("");
  
  useEffect(() => {
    if (repositoryUrl && repositoryUrl !== "") {
      setParameters({ action: "git_clone", clone_url: repositoryUrl, app_name: "VS Code" });
    }
  }, [repositoryUrl, setParameters]);

  return (
    <div className="w-full border-b border-gray-900/10 m-1 gap-1">
      <p className="mt-0 text-sm/6 text-gray-600">
        Clone your Git repository into the VSCode on the computer.
      </p>

      <div className="w-full grid grid-cols-1 gap-x-2 gap-y-4">
        <div className="col-span-full">
          <label
            htmlFor="repositoryUrl"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Repository URL
          </label>
          <div className="mt-2 w-[800px]">
            <div className="w-full flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <input
                type="text"
                id="repositoryUrl"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="https://github.com/username/repository.git"
                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm/6"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
