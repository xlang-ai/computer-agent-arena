import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faGoogle,
  faMicrosoft,
} from "@fortawesome/free-brands-svg-icons";

interface LoginOption {
  id: number;
  name: string;
  action: string;
  description: string;
  url: string;
  imageUrl: string;
  icon: React.ReactNode;
  features: string[];
}


const loginOptions: LoginOption[] = [
  {
    id: 1,
    name: "Google",
    action: "google_login",
    description: "Encrypted sign in with your Google account to two computers",
    url: "https://accounts.google.com",
    imageUrl: "/google-icon.png",
    icon: <FontAwesomeIcon icon={faGoogle} />,
    features: [
      "Access to Google services",
      "Single sign-on capability",
      "Enhanced security with 2FA",
    ],
  },
  {
    id: 2,
    name: "Github",
    action: "github_login",
    description: "Encrypted sign in with your Github account to two computers",
    url: "https://github.com/login",
    imageUrl: "/github-icon.png",
    icon: <FontAwesomeIcon icon={faGithub} className="" />,
    features: [
      "Access to repositories",
      "Collaboration tools",
      "Version control integration",
    ],
  },
  {
    id: 3,
    name: "Microsoft",
    action: "microsoft_login",
    description:
      "Encrypted sign in with your Microsoft account to two computers",
    url: "https://login.microsoftonline.com",
    imageUrl: "/microsoft-icon.png",
    icon: <FontAwesomeIcon icon={faMicrosoft} />,
    features: [
      "Access to Microsoft services",
      "Single sign-on capability",
      "Enhanced security with 2FA",
    ],
  },
];

interface LoginPaletteProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelectLogin: (option: {
    action: string;
    username: string;
    password: string;
  }) => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function LoginPalette({
  isOpen,
  setIsOpen,
  onSelectLogin,
}: LoginPaletteProps) {
  const [selectedOption, setSelectedOption] = useState<LoginOption>(
    loginOptions[0]
  );
  const [activeOptionId, setActiveOptionId] = useState<number>(
    loginOptions[0].id
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const activeOption = loginOptions.find((opt) => opt.id === activeOptionId);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto py-4 sm:py-6 md:py-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="ml-[20%] w-[60%] mr-[0%] transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <div className="flex transform-gpu divide-x divide-gray-100">
                <div className="max-h-96 min-w-0 flex-auto scroll-py-4 overflow-y-auto px-6 py-4">
                  <div className="-mx-2 text-sm text-gray-700">
                    {loginOptions.map((option) => (
                      <div
                        key={option.id}
                        className={classNames(
                          "flex cursor-pointer select-none items-center rounded-md p-2",
                          activeOptionId === option.id
                            ? "bg-gray-100 text-gray-900"
                            : ""
                        )}
                        onClick={() => setActiveOptionId(option.id)}
                      >
                        {option.icon}
                        <span className="ml-3 flex-auto truncate">
                          {option.name}
                        </span>
                        {activeOptionId === option.id && (
                          <ChevronRightIcon
                            className="ml-3 h-5 w-5 flex-none text-gray-400"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {activeOption && (
                  <div className="bg-gray-100 rounded-xl m-2 hidden h-96 w-1/2 flex-none flex-col divide-y divide-gray-100 sm:flex">
                    <div className="flex-none py-2 px-6 text-center">
                      <h2 className="mt-3 font-semibold text-gray-900">
                        {activeOption.icon} {activeOption.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {activeOption.description}
                      </p>
                    </div>
                    <div className="flex flex-auto flex-col justify-between py-4 px-6">
                      <form className="space-y-4 w-full">
                        <div className="w-full">
                          <label
                            htmlFor="username"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Account
                          </label>
                          <div className="mt-2 w-full flex justify-center">
                            <input
                              id="username"
                              name="username"
                              type="username"
                              required
                              autoComplete="username"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="block w-full max-w-xs rounded-md bg-white px-2 py-1 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="password"
                              className="block text-sm/6 font-medium text-gray-900"
                            >
                              Password
                            </label>
                          </div>
                          <div className="mt-2 w-full flex justify-center">
                            <input
                              id="password"
                              name="password"
                              type="password"
                              required
                              autoComplete="current-password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="block w-full max-w-xs rounded-md bg-white px-2 py-1 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                          </div>
                        </div>

                        <div className="w-full flex justify-center">
                          <span
                            onClick={() => {
                              onSelectLogin({
                                action: activeOption.action,
                                username: username,
                                password: password,
                              });
                              setIsOpen(false);
                            }}
                            className="flex w-[75%] items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          >
                            Sign in with {activeOption.name}
                          </span>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
