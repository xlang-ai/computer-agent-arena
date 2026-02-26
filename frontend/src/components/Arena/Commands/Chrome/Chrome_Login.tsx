import { useEffect, useState } from "react";

interface ChromeLoginProps {
  onConfirm: (data: { username: string; password: string }) => void;
}

export default function ChromeLogin({ onConfirm }: ChromeLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Update hidden input when form data changes
  useEffect(() => {
    const dataElement = document.getElementById("commandData");
    if (dataElement) {
      (dataElement as HTMLInputElement).value = JSON.stringify({
        username,
        password,
      });
    }
  }, [username, password]);

  return (
    <div className="border-b border-gray-900/10 m-4 gap-4">
      <p className="mt-1 text-sm/6 text-gray-600">
        Enter your login credentials for Chrome browser
      </p>

      <div className="w-full grid grid-cols-1 gap-x-6 gap-y-8">
        <div className="col-span-full">
          <label
            htmlFor="username"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Username
          </label>
          <div className="mt-2">
            <div className="w-full max-w-md flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm/6"
              />
            </div>
          </div>
        </div>

        <div className="col-span-full">
          <label
            htmlFor="password"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Password
          </label>
          <div className="mt-2">
            <div className="w-full max-w-md flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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
