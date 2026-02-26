import { useEffect, useState } from "react";

interface GoogleOpenUrlProps {
  name: string;
  setParameters: (parameters: Record<string, any>) => void;
}

export default function GoogleOpenUrl({ name, setParameters }: GoogleOpenUrlProps) {
  const [url, setUrl] = useState("");

  // 当URL改变时，更新parameters
  useEffect(() => {
    if (url && url !== "") {
      setParameters({ action: "open_url", url: url, app_name: "Chrome" });
    }
  }, [url, setParameters]);

  return (
    <div className="border-b border-gray-900/10 m-1 gap-1">
      <p className="mt-1 text-sm/6 text-gray-600">
        Open your targeted website in the Chrome browser.
      </p>

      <div className="w-full grid grid-cols-1 gap-x-3 gap-y-4">
        <div className="col-span-full">
          <label
            htmlFor="url"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Website URL
          </label>
          <div className="mt-2">
            <div className="w-full max-w-md flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm/6"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
