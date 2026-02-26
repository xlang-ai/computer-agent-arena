import { useEffect, useState } from "react";

interface CodeDownloadProps {
  onConfirm: (data: { download_url: string }) => void;
}

export default function CodeDownload({ onConfirm }: CodeDownloadProps) {
  const [downloadUrl, setDownloadUrl] = useState("");

  // Update hidden input when form data changes
  useEffect(() => {
    const dataElement = document.getElementById("commandData");
    if (dataElement) {
      (dataElement as HTMLInputElement).value = JSON.stringify({
        download_url: downloadUrl,
      });
    }
  }, [downloadUrl]);

  return (
    <div className="border-b border-gray-900/10 m-4 gap-4">
      <p className="mt-1 text-sm/6 text-gray-600">
        Enter the Jupyter Notebook file URL you want to download
      </p>

      <div className="w-full grid grid-cols-1 gap-x-6 gap-y-8">
        <div className="col-span-full">
          <label
            htmlFor="downloadUrl"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Download URL
          </label>
          <div className="mt-2">
            <div className="w-full max-w-md flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <input
                type="text"
                id="downloadUrl"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://example.com/notebook.ipynb"
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