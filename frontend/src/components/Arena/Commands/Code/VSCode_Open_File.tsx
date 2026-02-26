import { useEffect, useState } from "react";

interface VSCodeOpenFileProps {
  onConfirm: (data: { filePath: string }) => void;
}

export default function VSCodeOpenFile({ onConfirm }: VSCodeOpenFileProps) {
  const [filePath, setFilePath] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  
  useEffect(() => {
    const dataElement = document.getElementById('commandData');
    if (dataElement) {
      (dataElement as HTMLInputElement).value = JSON.stringify({ 
        file_path: filePath, 
        github_repo_url: githubRepoUrl 
      });
    }
  }, [filePath, githubRepoUrl]);

  return (
    <div className="w-full border-b border-gray-900/10 m-4 gap-4">
      <p className="mt-1 text-sm/6 text-gray-600">
        Enter the file path you want to open in VSCode
      </p>

      <div className="w-full grid grid-cols-1 gap-x-6 gap-y-8">
        <div className="col-span-full">
          <label
            htmlFor="filePath"
            className="block text-sm/6 font-medium text-gray-900"
          >
            File Path
          </label>
          <div className="mt-2 w-[800px]">
            <div className="w-full flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <input
                type="text"
                id="filePath"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="/path/to/your/file.txt"
                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm/6"
              />
            </div>
          </div>
          <label
            htmlFor="githubRepoUrl"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Github Repo URL
          </label>
          <div className="mt-2 w-[800px]">
            <div className="w-full flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <input
                    type="text"
                    id="githubRepoUrl"
                    value={githubRepoUrl}
                    onChange={(e) => setGithubRepoUrl(e.target.value)}
                    placeholder="https://github.com/user/repo"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm/6"
                />
            </div>
          </div>
        </div>
      </div>
      <input type="hidden" id="commandData" />
    </div>
  );
}
