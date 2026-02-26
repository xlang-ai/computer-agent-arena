import { Fragment, useEffect, useState } from "react";
import { Combobox, Dialog, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChrome,
  faUbuntu,
  faWindows,
} from "@fortawesome/free-brands-svg-icons";
import GoogleDocIcon from "../../assets/setup/google-doc.png";
import GoogleSlideIcon from "../../assets/setup/google-slides.svg";
import GoogleFormIcon from "../../assets/setup/google-forms.png";
import GoogleSheetIcon from "../../assets/setup/google-sheets.png";
import GmailIcon from "../../assets/setup/gmail.png";
import WindowsSettingsIcon from "../../assets/setup/windows-settings.png";
import WindowsPaintIcon from "../../assets/setup/windows-paint.png";
import WindowsFileExplorerIcon from "../../assets/setup/windows-file-explorer.png";
import WindowsControlPanelIcon from "../../assets/setup/windows-control-panel.webp";
import {
  faFileWord,
  faFileExcel,
  faFilePowerpoint,
  faCode,
  faFileCode,
  faGlobe,
  faPhotoFilm,
  faShuffle,
  faDisplay,
  faSchool,
  faMoneyBill,
  faHeart,
  faFilm,
  faTrophy,
  faNewspaper,
  faPlane,
  faShoppingCart,
  faSearch,
  faComputer,
  faImage,
  faFile,
  faGamepad,
  faCalculator,
  faTerminal,
  faCog,
  faPaintBrush,
  faVideo,
  faFilePdf,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import GoogleOpenUrl from "./Commands/Chrome/Google_Open_Url";
import VSCodeOpenFile from "./Commands/Code/VSCode_Open_File";
import VSCodeClone from "./Commands/Code/VSCode_Clone";
import LibreOfficeOpenFile from "./Commands/LibreOffice/LibreOffice_Open_File";
import { useAuth } from "../../context/AuthContext";
import { useArena } from "../../context/ArenaContext";
import ChromeLogin from "./Commands/Chrome/Chrome_Login";
import LibreOfficeDownloadFile from "./Commands/LibreOffice/LibreOffice_Download";
import CodeDownload from "./Commands/Code/Code_Download";
import CodeUpload from "./Commands/Code/Code_Upload";
import { tryParseUrlDomain } from "./utils";
import { faHandPointLeft } from "@fortawesome/free-solid-svg-icons";
import "../CSS/eval.css";
import FileUpload from "./Commands/file_upload";
import Control from "./Commands/control";

// 新增型定义

interface InitAppCategory {
  id: string;
  name: string;
  icon: any;
  apps?: InitApp[];
  weight?: number;
}

interface InitApp {
  category: string;
  id: string;
  name: string;
  icon: any;
  url?: string;
  app?: string;
  is_special?: boolean;
  supported?: string[];
}

interface AppCategory {
  id: string;
  name: string;
  apps: App[];
}

interface App {
  id: string;
  name: string;
  icon: any;
  supportedActions: Action[];
  app?: string;
}

interface Action {
  id: string;
  name: string;
  action: string;
  requiredParams: string[];
  node?: React.ReactNode;
  handleSubmit: (data: any) => void;
}

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}



export default function CommandPalette({
  isOpen,
  setIsOpen,
  onSelectApp,
  IsWaiting = false,
  WaitingMessage = "",
  inUse = false,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelectApp: (category: string, app_name: string, parameters: Record<string, any>) => void;
  IsWaiting?: boolean;
  WaitingMessage?: string;
  inUse?: boolean;
}) {
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [activeTab, setActiveTab] = useState("quick");
  const { socketService, user_id } = useAuth();
  const { os, chat_id } = useArena();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(true);
  const { isSpecialEnv } = useArena();

  const tabs = [
    { name: "Quick Setup", id: "quick", current: activeTab === "quick" },
    // {
    //   name: "Customized Setup",
    //   id: "customized",
    //   current: activeTab === "customized",
    // },
  ];


  // 组织应用数据结构
  //   {
  //     'Web': [{
  //         'app_name': 'Chrome',
  //         'supported_actions': {
  //             'open_url': ['url'],
  //             'google_login': ['username', 'password'],
  //             'load_preset': ['preset'],
  //             'default': []
  //         }
  //     }],
  //     'Office': [{
  //             'app_name': 'LibreOffice Calc',
  //             'supported_actions': {
  //                 'download_file': ['download_url'],
  //                 'upload_file': ['file_name'],
  //                 'load_preset': ['preset'],
  //                 'default': []
  //             }
  //         },
  //         {
  //             'app_name': 'LibreOffice Impress',
  //             'supported_actions': {
  //                 'download_file': ['download_url'],
  //                 'upload_file': ['file_name'],
  //                 'load_preset': ['preset'],
  //                 'default': []
  //             }
  //         },
  //         {
  //             'app_name': 'LibreOffice Writer',
  //             'supported_actions': {
  //                 'download_file': ['download_url'],
  //                 'upload_file': ['file_name'],
  //                 'load_preset': ['preset'],
  //                 'default': []
  //             }
  //         }
  //     ],
  //     'Code': [{
  //             'app_name': 'VS Code',
  //             'supported_actions': {
  //                 'git_clone': ['clone_url'],
  //                 'open_file': ['file_name'],
  //                 'default': []
  //             }
  //         },
  //         {
  //             'app_name': 'Jupyter Notebook',
  //             'supported_actions': {
  //                 'download_file': ['download_url'],
  //                 'upload_file': ['file_name'],
  //                 'load_preset': ['preset'],
  //                 'default': []
  //             }
  //         }
  //     ]
  // }
  const categories: AppCategory[] = [
    {
      id: "web",
      name: "Web",
      apps: [
        {
          id: "chrome",
          name: "Chrome",
          icon: faChrome,
          supportedActions: [
            {
              id: "open_url",
              name: "Open URL",
              action: "chrome_open_url",
              requiredParams: ["url"],
              handleSubmit: (data) => {
                socketService.Send("quick_setup", {
                  user_id,
                  chat_id,
                  app_name: "Chrome",
                  parameters: {
                    action: "open_url",
                    ...data,
                  },
                });
              },
            },
            {
              id: "google_login",
              name: "Google Login",
              action: "chrome_google_login",
              requiredParams: ["username", "password"],
              node: <ChromeLogin onConfirm={(data) => console.log(data)} />,
              handleSubmit: (data) => {
                
                socketService.Send("quick_setup", {
                  user_id,
                  chat_id,
                  app_name: "Chrome",
                  parameters: {
                    action: "google_login",
                    ...data,
                  },
                });
              },
            },
          ],
        },
      ],
    },
    {
      id: "office",
      name: "Office",
      apps: [
        {
          id: "libreoffice_calc",
          name: "LibreOffice Calc",
          icon: faFileExcel,
          supportedActions: [
            {
              id: "download_file",
              name: "Download File",
              action: "libreoffice_download_file",
              requiredParams: ["download_url"],
              node: (
                <LibreOfficeDownloadFile
                  onConfirm={(data: any) => console.log(data)}
                />
              ),
              handleSubmit: (data) => {
                socketService.Send("quick_setup", {
                  user_id,
                  chat_id,
                  app_name: "LibreOffice Calc",
                  parameters: {
                    action: "download_file",
                    ...data,
                  },
                });
              },
            },
            {
              id: "upload_file",
              name: "Upload File",
              action: "libreoffice_upload_file",
              requiredParams: ["file_name"],
              node: <></>,
              handleSubmit: (data) => {
                console.log(data);
              },
            },
          ],
        },
        {
          id: "libreoffice_impress",
          name: "LibreOffice Impress",
          icon: faFilePowerpoint,
          supportedActions: [
            {
              id: "download_file",
              name: "Download File",
              action: "libreoffice_download_file",
              requiredParams: ["download_url"],
              node: (
                <LibreOfficeDownloadFile
                  onConfirm={(data: any) => console.log(data)}
                />
              ),
              handleSubmit: (data) => {
                socketService.Send("quick_setup", {
                  user_id,
                  chat_id,
                  app_name: "LibreOffice Impress",
                  parameters: {
                    action: "download_file",
                    ...data,
                  },
                });
              },
            },
            {
              id: "upload_file",
              name: "Upload File",
              action: "libreoffice_upload_file",
              requiredParams: ["file_name"],
              node: <></>,
              handleSubmit: (data) => {
                console.log(data);
              },
            },
          ],
        },
        {
          id: "libreoffice_writer",
          name: "LibreOffice Writer",
          icon: faFileWord,
          supportedActions: [
            {
              id: "download_file",
              name: "Download File",
              action: "libreoffice_download_file",
              requiredParams: ["download_url"],
              node: (
                <LibreOfficeDownloadFile
                  onConfirm={(data: any) => console.log(data)}
                />
              ),
              handleSubmit: (data) => {
                socketService.Send("quick_setup", {
                  user_id,
                  chat_id,
                  app_name: "LibreOffice Writer",
                  parameters: {
                    action: "download_file",
                    ...data,
                  },
                });
              },
            },
            {
              id: "upload_file",
              name: "Upload File",
              action: "libreoffice_upload_file",
              requiredParams: ["file_name"],
              node: <></>,
              handleSubmit: (data) => {
                console.log(data);
              },
            },
          ],
        },
      ],
    },
    {
      id: "code",
      name: "Code",
      apps: [
        {
          id: "vscode",
          name: "VS Code",
          icon: faCode,
          supportedActions: [
            {
              id: "git_clone",
              name: "Git Clone",
              action: "vscode_git_clone",
              requiredParams: ["clone_url"],
              node: <></>,
              handleSubmit: (data) => {
                console.log(data);
              },
            },
            {
              id: "open_file",
              name: "Open File",
              action: "vscode_open_file",
              requiredParams: ["file_name"],
              node: <></>,
              handleSubmit: (data: any) => {
                console.log(data);
              },
            },
          ],
        },
        {
          id: "jupyter_notebook",
          name: "Jupyter Notebook",
          icon: faFileCode,
          supportedActions: [
            {
              id: "download_file",
              name: "Download File",
              action: "jupyter_notebook_download_file",
              requiredParams: ["download_url"],
              node: (
                <CodeDownload onConfirm={(data: any) => console.log(data)} />
              ),
              handleSubmit: (data) => {
                socketService.Send("quick_setup", {
                  user_id,
                  chat_id,
                  app_name: "Jupyter Notebook",
                  parameters: {
                    action: "download_file",
                    ...data,
                  },
                });
              },
            },
            {
              id: "upload_file",
              name: "Upload File",
              action: "jupyter_notebook_upload_file",
              requiredParams: ["file_name"],
              node: <CodeUpload onConfirm={(data: any) => console.log(data)} />,
              handleSubmit: (data) => {
                socketService.Send("quick_setup", {
                  user_id,
                  chat_id,
                  app_name: "Jupyter Notebook",
                  parameters: {
                    action: "upload_file",
                    ...data,
                  },
                });
              },
            },
          ],
        },
      ],
    },
  ];

  // Add new state for environment selection
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedAppName, setSelectedAppName] = useState<string>("");

  const SupportedEnvironments: InitAppCategory[] = [
    {
      id: "System",
      name: "System",
      icon: <FontAwesomeIcon icon={faComputer} color="#FF6B6B" />,
      weight: 1.5,
      apps: [
        {
          category: "System",
          id: "windows_settings",
          name: "Windows Settings",
          icon: <img src={WindowsSettingsIcon} alt="Windows Settings" className="w-3 h-3 sm:w-4 sm:h-4" />,
          is_special: false,
          supported: ["Windows"]
        },
        {
          category: "System",
          id: "windows_command_line",
          name: "Windows Command Line",
          icon: <FontAwesomeIcon icon={faTerminal} color="#FF6B6B" />,
          url: "https://www.microsoft.com/en-us/windows/settings",
          is_special: false,
          supported: ["Windows"]
        },
        {
          category: "System",
          id: "windows_file_explorer",
          name: "Windows File Explorer",
          icon: <img src={WindowsFileExplorerIcon} alt="Windows File Explorer" className="w-3 h-3 sm:w-4 sm:h-4" />,
          is_special: false,
          supported: ["Windows"]
        },
        {
          category: "System",
          id: "windows_control_panel",
          name: "Windows Control Panel",
          icon: <img src={WindowsControlPanelIcon} alt="Windows Control Panel" className="w-3 h-3 sm:w-4 sm:h-4" />,
          is_special: false,
          supported: ["Windows"]
        },
        {
          category: "System",
          id: "ubuntu_settings",
          name: "Ubuntu Settings",
          icon: <FontAwesomeIcon icon={faUbuntu} color="#FF6B6B" />,
          url: "https://www.ubuntu.com",
          is_special: false,
          supported: ["Ubuntu"]
        },
        {
          category: "System",
          id: "ubuntu_games",
          name: "Ubuntu Games",
          icon: <FontAwesomeIcon icon={faGamepad} color="#FF6B6B" />,
          url: "https://www.ubuntu.com",
          is_special: false,
          supported: ["Ubuntu"]
        },
      ],
    },
    {
      id: "Shopping",
      name: "Shopping",
      icon: <FontAwesomeIcon icon={faGlobe} color="#FF6B6B" />,
      weight: 1.2,
      apps: [
        {
          category: "Shopping",
          id: "amazon_shopping",
          name: "Amazon Shopping",
          icon: <UrlIcon url="https://www.amazon.com" />,
          url: "https://www.amazon.com",
          app: "chrome",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Shopping",
          id: "ebay_shopping",
          name: "eBay",
          icon: <UrlIcon url="https://www.ebay.com" />,
          url: "https://www.ebay.com",
          app: "chrome",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Shopping",
          id: "ikea_shopping",
          name: "IKEA",
          icon: <UrlIcon url="https://www.ikea.com" />,
          url: "https://www.ikea.com",
          app: "chrome",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Shopping",
          id: "instacart_shopping",
          name: "Instacart",
          icon: <UrlIcon url="https://www.instacart.com" />,
          url: "https://www.instacart.com",
          app: "chrome",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Shopping",
          id: "apple_shopping",
          name: "Apple",
          icon: <UrlIcon url="https://www.apple.com" />,
          url: "https://www.apple.com",
          app: "chrome",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Shopping",
          id: "nike_snkrs_shopping",
          name: "Nike SNKRS",
          icon: <UrlIcon url="https://www.nike.com" />,
          url: "https://www.nike.com",
          app: "chrome",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
      ],
    },
    {
      id: "Coding",
      name: "Coding",
      icon: <FontAwesomeIcon icon={faCode} color="#4834D4" />,
      weight: 1.8,
      apps: [
        {
          category: "Coding",
          id: "stack_overflow",
          name: "Stack Overflow",
          icon: <UrlIcon url="https://stackoverflow.com" />,
          url: "https://stackoverflow.com",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Coding",
          id: "huggingface",
          name: "HuggingFace",
          icon: <UrlIcon url="https://huggingface.co" />,
          url: "https://huggingface.co",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Coding",
          id: "github",
          name: "GitHub",
          icon: <UrlIcon url="https://github.com" />,
          url: "https://github.com",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Coding",
          id: "leetcode",
          name: "LeetCode",
          icon: <UrlIcon url="https://leetcode.com" />,
          url: "https://leetcode.com",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Coding",
          id: "kaggle",
          name: "Kaggle",
          icon: <UrlIcon url="https://kaggle.com" />,
          url: "https://kaggle.com",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Coding",
          id: "vscode",
          name: "VS Code",
          icon: <UrlIcon url="https://code.visualstudio.com" />,
          url: "https://code.visualstudio.com",
          app: "vscode",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Coding",
          id: "notepad++",
          name: "Notepad++",
          icon: <FontAwesomeIcon icon={faFileCode} color="#2C3E50" />,
          url: "https://notepad-plus-plus.org",
          is_special: false,
          supported: ["Windows"]
        }
      ],
    },
    {
      id: "Professional",
      name: "Professional",
      icon: <FontAwesomeIcon icon={faFileWord} color="#2C3E50" />,
      weight: 1,
    },
    {
      id: "Entertainment",
      name: "Entertainment",
      icon: <FontAwesomeIcon icon={faFilm} color="#8E44AD" />,
      weight: 1,
      apps: [
        // {
        //   category: "Entertainment",
        //   id: "spotify",
        //   name: "Spotify",
        //   icon: <UrlIcon url="https://www.spotify.com" />,
        //   url: "https://www.spotify.com",
        //   is_special: true,
        //   supported: ["Windows"]
        // },
        // {
        //   category: "Entertainment",
        //   id: "tiktok",
        //   name: "TikTok",
        //   icon: <UrlIcon url="https://www.tiktok.com" />,
        //   url: "https://www.tiktok.com",
        //   is_special: false,
        //   supported: ["Windows", "Ubuntu"]
        // },
        // {
        //   category: "Entertainment",
        //   id: "yelp",
        //   name: "Yelp",
        //   icon: <UrlIcon url="https://www.yelp.com" />,
        //   url: "https://www.yelp.com",
        //   is_special: false,
        //   supported: ["Windows", "Ubuntu"]
        // },
        {
          category: "Entertainment",
          id: "twitch",
          name: "Twitch",
          icon: <UrlIcon url="https://www.twitch.tv" />,
          url: "https://www.twitch.tv",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        // {
        //   category: "Entertainment",
        //   id: "x",
        //   name: "X",
        //   icon: <UrlIcon url="https://x.com/" />,
        //   url: "https://x.com/",
        //   is_special: true,
        //   supported: ["Windows"]
        // },
        // {
        //   category: "Entertainment",
        //   id: "reddit",
        //   name: "Reddit",
        //   icon: <UrlIcon url="https://www.reddit.com" />,
        //   url: "https://www.reddit.com",
        //   is_special: true,
        // },
        // {
        //   category: "Entertainment",
        //   id: "pinterest",
        //   name: "Pinterest",
        //   icon: <UrlIcon url="https://www.pinterest.com" />,
        //   url: "https://www.pinterest.com",
        //   is_special: true,
        //   supported: ["Windows"]
        // },
        // {
        //   category: "Entertainment",
        //   id: "youtube",
        //   name: "YouTube",
        //   icon: <UrlIcon url="https://www.youtube.com" />,
        //   url: "https://www.youtube.com",
        //   is_special: true,
        //   supported: ["Windows"]
        // },
      ],
    },
    {
      id: "Finance",
      name: "Finance",
      icon: <FontAwesomeIcon icon={faMoneyBill} color="#16A085" />,
      weight: 0.2,
    },
    {
      id: "Graphics & Design",
      name: "Graphics & Design",
      icon: <FontAwesomeIcon icon={faPhotoFilm} color="#9B59B6" />,
      weight: 1.2,

      apps: [
        {
          category: "Graphics & Design",
          id: "vlc",
          name: "VLC",
          icon: <FontAwesomeIcon icon={faVideo} color="#2C3E50" />,
          url: "https://www.videolan.org/vlc/",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Graphics & Design",
          id: "windows_paint",
          name: "Windows Paint",
          icon: <img src={WindowsPaintIcon} alt="Windows Paint" className="w-3 h-3 sm:w-4 sm:h-4" />,
          is_special: false,
          supported: ["Windows"]
        },
        {
          category: "Graphics & Design",
          id: "capcut",
          name: "CapCut",
          icon: <FontAwesomeIcon icon={faVideo} color="#2C3E50" />,
          url: "https://www.capcut.com",
          is_special: false,
          supported: ["Windows"]
        },
        {
          category: "Graphics & Design",
          id: "gimp",
          name: "GIMP",
          icon: <FontAwesomeIcon icon={faImage} color="#2C3E50" />,
          url: "https://www.gimp.org",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        // {
        //   category: "News",
        //   id: "nytimes",
        //   name: "NYTimes",
        //   icon: <UrlIcon url="https://www.nytimes.com" />,
        //   url: "https://www.nytimes.com",
        //   is_special: false,
        //   supported: ["Windows", "Ubuntu"]
        // },
        {
          category: "News",
          id: "medium",
          name: "Medium",
          icon: <UrlIcon url="https://www.medium.com" />,
          url: "https://www.medium.com",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        // {
        //   category: "News",
        //   id: "google_news",
        //   name: "Google News",
        //   icon: <UrlIcon url="https://news.google.com" />,
        //   url: "https://news.google.com",
        //   is_special: false,
        //   supported: ["Windows", "Ubuntu"]
        // },
      ],
    },
    {
      id: "Sports",
      name: "Sports",
      icon: <FontAwesomeIcon icon={faTrophy} color="#F39C12" />,
      weight: 0.2,
      apps: [
        {
          category: "Sports",
          id: "espn",
          name: "ESPN",
          icon: <UrlIcon url="https://www.espn.com" />,
          url: "https://www.espn.com",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Sports",
          id: "nba",
          name: "NBA",
          icon: <UrlIcon url="https://www.nba.com" />,
          url: "https://www.nba.com",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
      ],
    },
    {
      id: "Travel",
      name: "Travel",
      icon: <FontAwesomeIcon icon={faPlane} color="#3498DB" />,
      weight: 0.5,
      apps: [
        {
          category: "Travel",
          id: "google_maps",
          name: "Google Maps",
          icon: <UrlIcon url="https://www.google.com/maps" />,
          url: "https://www.google.com/maps",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Travel",
          id: "expedia",
          name: "Expedia",
          icon: <UrlIcon url="https://www.expedia.com" />,
          url: "https://www.expedia.com",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Travel",
          id: "trip_com",
          name: "Trip.com",
          icon: <UrlIcon url="https://www.trip.com" />,
          url: "https://www.trip.com",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Travel",
          id: "airbnb",
          name: "Airbnb",
          icon: <UrlIcon url="https://www.airbnb.com" />,
          url: "https://www.airbnb.com",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Travel",
          id: "booking_com",
          name: "Booking.com",
          icon: <UrlIcon url="https://www.booking.com" />,
          url: "https://www.booking.com",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
      ],
    },
    {
      id: "Productivity",
      name: "Productivity",
      icon: <FontAwesomeIcon icon={faDisplay} color="#1ABC9C" />,
      weight: 2,
      apps: [
        {
          category: "Productivity",
          id: "google_docs",
          name: "Google Docs",
          icon: <img src={GoogleDocIcon} alt="Google Docs" className="h-3 w-3 sm:h-4 sm:w-4" />,
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Productivity",
          id: "google_forms",
          name: "Google Forms",
          icon: <img src={GoogleFormIcon} alt="Google Forms" className="h-3 w-3 sm:h-4 sm:w-4" />,
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Productivity",
          id: "google_sheets",
          name: "Google Sheets",
          icon: <img src={GoogleSheetIcon} alt="Google Sheets" className="h-3 w-3 sm:h-4 sm:w-4" />,
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Productivity",
          id: "google_slides",
          name: "Google Slides",
          icon: <img src={GoogleSlideIcon} alt="Google Slides" className="h-3 w-3 sm:h-4 sm:w-4" />,
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        // {
        //   category: "Productivity",
        //   id: "google_colab",
        //   name: "Google Colab",
        //   icon: <UrlIcon url="https://colab.research.google.com" />,
        //   url: "https://colab.google/",
        //   is_special: true,
        //   supported: ["Windows"]
        // },
        // {
        //   category: "Productivity",
        //   id: "google_gmail",
        //   name: "Google Gmail",
        //   icon: <img src={GmailIcon} alt="Google Gmail" className="h-3 w-3 sm:h-4 sm:w-4" />,
        //   is_special: true,
        //   supported: ["Windows"]
        // },
        // {
        //   category: "Productivity",
        //   id: "google_drive",
        //   name: "Google Drive",
        //   icon: <UrlIcon url="https://drive.google.com" />,
        //   url: "https://drive.google.com",
        //   is_special: false
        // },
        // {
        //   category: "Productivity",
        //   id: "google_calendar",
        //   name: "Google Calendar",
        //   icon: <UrlIcon url="https://calendar.google.com" />,
        //   url: "https://calendar.google.com",
        //   is_special: true,
        //   supported: ["Windows"]
        // },
        // {
        //   category: "Productivity",
        //   id: "onecalendar",
        //   name: "OneCalendar",
        //   icon: <UrlIcon url="https://www.onecalendar.nl/" />,
        //   url: "https://www.onecalendar.nl/",
        //   is_special: true,
        // },
        {
          category: "Productivity",
          id: "libreoffice_calc",
          name: "LibreOffice Calc",
          icon: <FontAwesomeIcon icon={faFileExcel} color="#FF6B6B" className="h-3 w-3 sm:h-4 sm:w-4"/>,
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Productivity",
          id: "libreoffice_writer",
          name: "LibreOffice Writer",
          icon: <FontAwesomeIcon icon={faFileWord} color="#2C3E50" className="h-3 w-3 sm:h-4 sm:w-4"/>,
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "Productivity",
          id: "libreoffice_impress",
          name: "LibreOffice Impress",
          icon: <FontAwesomeIcon icon={faFilePowerpoint} color="#2C3E50" className="h-3 w-3 sm:h-4 sm:w-4"/>,
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        // {
        //   category: "Productivity",
        //   id: "slack",
        //   name: "Slack",
        //   icon: <UrlIcon url="https://www.slack.com" />,
        //   url: "https://www.slack.com",
        //   is_special: true,
        //   supported: ["Windows"]
        // },
        // {
        //   category: "Productivity",
        //   id: "notion",
        //   name: "Notion",
        //   icon: <UrlIcon url="https://www.notion.so" />,
        //   url: "https://www.notion.so",
        //   is_special: true,
        //   supported: ["Windows"]
        // },
        // {
        //   category: "Productivity",
        //   id: "outlook",
        //   name: "Outlook",
        //   icon: <UrlIcon url="https://www.outlook.com" />,
        //   url: "https://www.outlook.com",
        //   is_special: true,
        //   supported: ["Windows"]
        // },
        // {
        //   category: "Productivity",
        //   id: "zoom",
        //   name: "Zoom",
        //   icon: <UrlIcon url="https://www.zoom.us" />,
        //   url: "https://www.zoom.us",
        //   is_special: true,
        //   supported: ["Windows"]
        // },
        {
          category: "Productivity",
          id: "pdfedit",
          name: "PDF Editor",
          icon: <FontAwesomeIcon icon={faFilePdf} color="#2C3E50" />,
          url: "https://pdf-xchange.eu/pdf-xchange-editor/",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        }, {
          category: "Productivity",
          id: "marktext",
          name: "MarkText",
          icon: <FontAwesomeIcon icon={faFilePdf} color="#2C3E50" />,
          url: "https://www.marktext.cc/",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        }
      ],
    },
    {
      id: "AI Benchmarks",
      name: "AI Benchmarks",
      icon: <FontAwesomeIcon icon={faComputer} color="#9B59B6" />,
      weight: 1.5,
      apps: [
        {
          category: "AI Benchmarks",
          id: "staynb",
          name: "Staynb (Airbnb Clone)",
          icon: <FontAwesomeIcon icon={faPlane} color="#FF5A5F" />,
          url: "https://evals-staynb.vercel.app/",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "AI Benchmarks",
          id: "omnizon",
          name: "Omnizon (Amazon Clone)",
          icon: <FontAwesomeIcon icon={faShoppingCart} color="#FF9900" />,
          url: "https://evals-omnizon.vercel.app/",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "AI Benchmarks",
          id: "dashdish",
          name: "DashDish (DoorDash Clone)",
          icon: <FontAwesomeIcon icon={faShoppingCart} color="#FF3008" />,
          url: "https://evals-dashdish.vercel.app/",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "AI Benchmarks",
          id: "gocalendar",
          name: "GoCalendar (Google Calendar Clone)",
          icon: <FontAwesomeIcon icon={faDisplay} color="#4285F4" />,
          url: "https://evals-gocalendar.vercel.app/",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "AI Benchmarks",
          id: "gomail",
          name: "GoMail (Gmail Clone)",
          icon: <FontAwesomeIcon icon={faDisplay} color="#EA4335" />,
          url: "https://evals-gomail.vercel.app/",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "AI Benchmarks",
          id: "opendining",
          name: "OpenDining (OpenTable Clone)",
          icon: <FontAwesomeIcon icon={faFilm} color="#DA3743" />,
          url: "https://evals-opendining.vercel.app/",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "AI Benchmarks",
          id: "networkin",
          name: "NetworkIn (LinkedIn Clone)",
          icon: <FontAwesomeIcon icon={faCode} color="#0077B5" />,
          url: "https://evals-networkin.vercel.app/",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "AI Benchmarks",
          id: "udriver",
          name: "Udriver (Uber Clone)",
          icon: <FontAwesomeIcon icon={faPlane} color="#000000" />,
          url: "https://evals-udriver.vercel.app/",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "AI Benchmarks",
          id: "fly_unified",
          name: "Fly Unified (United Clone)",
          icon: <FontAwesomeIcon icon={faPlane} color="#0074D9" />,
          url: "https://evals-flyunified.vercel.app/",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "AI Benchmarks",
          id: "topwork",
          name: "TopWork (UpWork Clone)",
          icon: <FontAwesomeIcon icon={faCode} color="#14A800" />,
          url: "https://evals-topwork.vercel.app/",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        },
        {
          category: "AI Benchmarks",
          id: "zilloft",
          name: "Zilloft (Zillow Clone)",
          icon: <FontAwesomeIcon icon={faShoppingCart} color="#006AFF" />,
          url: "https://evals-zilloft.vercel.app/",
          is_special: false,
          supported: ["Windows", "Ubuntu"]
        }
      ],
    },
    // {
    //   id: "Search Engine",
    //   name: "Search Engine",
    //   icon: <FontAwesomeIcon icon={faSearch} color="#FF6B6B" />,
    //   apps: [
    //     {
    //       category: "Search Engine",
    //       id: "google_search",
    //       name: "Google Search",
    //       icon: <UrlIcon url="https://www.google.com" />,
    //       url: "https://www.google.com",
    //     },
    //     {
    //       category: "Search Engine",
    //       id: "bing_search",
    //       name: "Bing Search",
    //       icon: <UrlIcon url="https://www.bing.com" />,
    //       url: "https://www.bing.com",
    //     },
    //   ],
    // },
  ];

  const [categoryOptions] = useState(() => {
    const SupportedCategories = SupportedEnvironments.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
    }));
    return [
      {
        id: "all",
        name: "All",
        icon: null,
      },
      ...SupportedCategories,
    ];
  });
  const [envStatus, setEnvStatus] = useState<Record<string, any>>({});
  // 1. 添加一个状态来追踪特殊环境的可用性
  const [isSpecialAvailable, setIsSpecialAvailable] = useState(true);

  // 2. 修改轮询的useEffect
  useEffect(() => {
    if (!isOpen || !socketService || !user_id) return;

    const queryEnvStatus = async () => {
      const res = await socketService.Post("query_env_status", { user_id: user_id });
      if (!res.error) {
        setEnvStatus(res.env_status);
        // 更新特殊环境可用性状态
        setIsSpecialAvailable(res.env_status[os || "Windows"]?.special?.idle > 0 || inUse);
      }
    }

    // 立即执行一次
    queryEnvStatus();

    // 设置轮询
    const intervalId = setInterval(queryEnvStatus, 5000);

    // 清理
    return () => {
      clearInterval(intervalId);
    };
  }, [isOpen, socketService, user_id, os]); // 添加 os 作为依赖

  const [AppNameOptions, setAppNameOptions] = useState(() => {
    const getRandomApps = () => {
      // Step 1: Get categories with apps and filter System apps based on OS
      const categoriesWithApps = SupportedEnvironments.filter(cat => cat.apps && cat.apps.length > 0)
        .map(category => {
          if (category.id === "System") {
            return {
              ...category,
              apps: category.apps?.filter(app =>
                (isSpecialEnv ? true : !(app.is_special === true)) &&
                (app.supported?.includes(os as string) || app.supported?.length === 0)
              )
            };
          }
          return {
            ...category,
            apps: category.apps?.filter(app =>
              (isSpecialEnv ? true : !(app.is_special === true)) &&
                (app.supported?.includes(os as string) || app.supported?.length === 0)
            )
          };
        })
        .filter(cat => cat.apps && cat.apps.length > 0);

      // 计算权重总和
      const totalWeight = categoriesWithApps.reduce((sum, cat) => sum + (cat.weight || 1), 0);

      // 根据权重选择类别
      const numCategoriesToSelect = Math.min(6, categoriesWithApps.length * 2); // 允许更多选择以支持重复
      const selectedCategories: typeof categoriesWithApps = [];

      // 为每个类别计算最大重复次数（基于权重）
      const maxRepetitions = categoriesWithApps.reduce((acc, cat) => {
        acc[cat.id] = Math.floor(((cat.weight || 1) / totalWeight) * numCategoriesToSelect * 2);
        return acc;
      }, {} as Record<string, number>);

      // 跟踪每个类别的出现次数
      const categoryCount: Record<string, number> = {};

      while (selectedCategories.length < numCategoriesToSelect) {
        const rand = Math.random() * totalWeight;
        let weightSum = 0;

        for (const category of categoriesWithApps) {
          weightSum += category.weight || 1;
          if (rand <= weightSum) {
            // 检查该类别是否达到最大重复次数
            categoryCount[category.id] = (categoryCount[category.id] || 0) + 1;
            if (categoryCount[category.id] <= maxRepetitions[category.id]) {
              selectedCategories.push(category);
            }
            break;
          }
        }
      }
      selectedCategories.sort((a, b) => (b.weight || 1) - (a.weight || 1));
      // Step 2: Sample apps from each selected category
      const appsPerCategory = 3;
      // 用于跟踪每个类别已选择的应用
      const selectedAppIds = new Set<string>();

      const randomApps = selectedCategories.flatMap(category => {
        const categoryApps = category.apps || [];
        const filteredApps = categoryApps.filter(app =>
          (isSpecialEnv ? true : !(app.is_special === true)) &&
          (app.supported?.includes(os as string) || app.supported?.length === 0) &&
          // 排除该类别中已经被选择的应用
          !selectedAppIds.has(`${category.id}-${app.id}`)
        );

        // 随机选择应用
        const selectedAppsForCategory = [...filteredApps]
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(appsPerCategory, filteredApps.length));

        // 将选中的应用ID添加到已选择集合中
        selectedAppsForCategory.forEach(app => {
          selectedAppIds.add(`${category.id}-${app.id}`);
        });

        return selectedAppsForCategory.map(app => ({
          ...app,
          category: category.id
        }));
      });

      return randomApps;
    };
    return getRandomApps();
  });

  const refreshAppOptions = () => {
    setAppNameOptions(prev => {
      console.log(os);
      const categoriesWithApps = SupportedEnvironments.filter(cat => cat.apps && cat.apps.length > 0)
        .map(category => {
          if (category.id === "System") {
            // Filter system apps based on OS
            return {
              ...category,
              apps: category.apps?.filter(app =>
                (isSpecialEnv ? true : !(app.is_special === true)) &&
                (app.supported?.includes(os as string) || app.supported?.length === 0)
              )
            };
          }
          return {
            ...category,
            apps: category.apps?.filter(app =>
              (isSpecialEnv ? true : !(app.is_special === true)) &&
                (app.supported?.includes(os as string) || app.supported?.length === 0)
            )
          };
        })
        .filter(cat => cat.apps && cat.apps.length > 0); // Remove categories with no apps after filtering


      // 计算权重总和
      const totalWeight = categoriesWithApps.reduce((sum, cat) => sum + (cat.weight || 1), 0);

      // 根据权重选择类别
      const numCategoriesToSelect = Math.min(6, categoriesWithApps.length * 2); // 允许更多选择以支持重复
      const selectedCategories: typeof categoriesWithApps = [];

      // 为每个类别计算最大重复次数（基于权重）
      const maxRepetitions = categoriesWithApps.reduce((acc, cat) => {
        acc[cat.id] = Math.floor(((cat.weight || 1) / totalWeight) * numCategoriesToSelect * 2);
        return acc;
      }, {} as Record<string, number>);

      // 跟踪每个类别的出现次数
      const categoryCount: Record<string, number> = {};

      while (selectedCategories.length < numCategoriesToSelect) {
        const rand = Math.random() * totalWeight;
        let weightSum = 0;

        for (const category of categoriesWithApps) {
          weightSum += category.weight || 1;
          if (rand <= weightSum) {
            // 检查该类别是否达到最大重复次数
            categoryCount[category.id] = (categoryCount[category.id] || 0) + 1;
            if (categoryCount[category.id] <= maxRepetitions[category.id]) {
              selectedCategories.push(category);
            }
            break;
          }
        }
      }
      selectedCategories.sort((a, b) => (b.weight || 1) - (a.weight || 1));
      const appsPerCategory = 3;
      // 用于跟踪每个类别已选择的应用
      const selectedAppIds = new Set<string>();

      const randomApps = selectedCategories.flatMap(category => {
        const categoryApps = category.apps || [];
        const filteredApps = categoryApps.filter(app =>
          (isSpecialEnv ? true : !(app.is_special === true)) &&
          (app.supported?.includes(os as string) || app.supported?.length === 0) &&
          // 排除该类别中已经被选择的应用
          !selectedAppIds.has(`${category.id}-${app.id}`)
        );

        // 随机选择应用
        const selectedAppsForCategory = [...filteredApps]
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(appsPerCategory, filteredApps.length));

        // 将选中的应用ID添加到已选择集合中
        selectedAppsForCategory.forEach(app => {
          selectedAppIds.add(`${category.id}-${app.id}`);
        });

        return selectedAppsForCategory.map(app => ({
          ...app,
          category: category.id
        }));
      });

      return [
        // {
        //   category: "Random",
        //   id: "random",
        //   name: "Random",
        //   icon: <FontAwesomeIcon icon={faShuffle} />,
        //   url: null,
        // },
        ...randomApps,
      ];
    });
  };

  // 将AppNameOptions按category分组，超过3个应用的类别会创建新分组
  const groupedAppOptions = AppNameOptions.reduce((acc, app) => {
    if (app?.category) {
      const categoryInfo = SupportedEnvironments.find(env => env.id === app.category);
      const baseCategoryId = app.category;
      
      // 检查该类别当前已有的分组数量
      const existingGroups = Object.keys(acc).filter(key => 
        key.startsWith(`${baseCategoryId}-group-`)
      );
      
      // 找到最后一个分组或创建新分组
      let targetGroupId = existingGroups.length > 0 
        ? existingGroups[existingGroups.length - 1] 
        : `${baseCategoryId}-group-1`;
      
      // 如果最后一个分组已满（3个应用），创建新分组
      if (acc[targetGroupId]?.apps.length >= 3) {
        targetGroupId = `${baseCategoryId}-group-${existingGroups.length + 1}`;
      }
      
      // 如果分组不存在，创建新分组
      if (!acc[targetGroupId]) {
        acc[targetGroupId] = {
          name: categoryInfo?.name || app.category,
          icon: categoryInfo?.icon,
          apps: []
        };
      }
      
      acc[targetGroupId].apps.push(app as InitApp);
    }
    return acc;
  }, {} as Record<string, { name: string; icon: React.ReactNode; apps: InitApp[] }>);

  // Add useEffect to watch os changes
  useEffect(() => {
    setAppNameOptions(prev => {
      const categoriesWithApps = SupportedEnvironments.filter(cat => cat.apps && cat.apps.length > 0)
        .map(category => {
          if (category.id === "System") {
            // Filter system apps based on OS
            return {
              ...category,
              apps: category.apps?.filter(app =>
                (isSpecialEnv ? true : !(app.is_special === true)) &&
                (app.supported?.includes(os as string) || app.supported?.length === 0)
              )
            };
          }
          // For non-System categories, only filter based on isSpecialEnv
          return {
            ...category,
            apps: category.apps?.filter(app =>
              (isSpecialEnv ? true : !(app.is_special === true)) &&
              (app.supported?.includes(os as string) || app.supported?.length === 0)
            )
          };
        })
        .filter(cat => cat.apps && cat.apps.length > 0);


      // 计算权重总和
      const totalWeight = categoriesWithApps.reduce((sum, cat) => sum + (cat.weight || 1), 0);

      // 根据权重选择类别
      const numCategoriesToSelect = Math.min(6, categoriesWithApps.length * 2); // 允许更多选择以支持重复
      const selectedCategories: typeof categoriesWithApps = [];

      // 为每个类别计算最大重复次数（基于权重）
      const maxRepetitions = categoriesWithApps.reduce((acc, cat) => {
        acc[cat.id] = Math.floor(((cat.weight || 1) / totalWeight) * numCategoriesToSelect * 2);
        return acc;
      }, {} as Record<string, number>);

      // 跟踪每个类别的出现次数
      const categoryCount: Record<string, number> = {};

      while (selectedCategories.length < numCategoriesToSelect) {
        const rand = Math.random() * totalWeight;
        let weightSum = 0;

        for (const category of categoriesWithApps) {
          weightSum += category.weight || 1;
          if (rand <= weightSum) {
            // 检查该类别是否达到最大重复次数
            categoryCount[category.id] = (categoryCount[category.id] || 0) + 1;
            if (categoryCount[category.id] <= maxRepetitions[category.id]) {
              selectedCategories.push(category);
            }
            break;
          }
        }
      }
      selectedCategories.sort((a, b) => (b.weight || 1) - (a.weight || 1));
      const appsPerCategory = 3;
      // 用于跟踪每个类别已选择的应用
      const selectedAppIds = new Set<string>();

      const randomApps = selectedCategories.flatMap(category => {
        const categoryApps = category.apps || [];
        const filteredApps = categoryApps.filter(app =>
          (isSpecialEnv ? true : !(app.is_special === true)) &&
          (app.supported?.includes(os as string) || app.supported?.length === 0) &&
          // 排除该类别中已经被选择的应用
          !selectedAppIds.has(`${category.id}-${app.id}`)
        );

        // 随机选择应用
        const selectedAppsForCategory = [...filteredApps]
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(appsPerCategory, filteredApps.length));

        // 将选中的应用ID添加到已选择集合中
        selectedAppsForCategory.forEach(app => {
          selectedAppIds.add(`${category.id}-${app.id}`);
        });

        return selectedAppsForCategory.map(app => ({
          ...app,
          category: category.id
        }));
      });

      return [
        ...randomApps,
      ];

    });
  }, [os]); // Add os as dependency

  // Add new state for parameters
  const [parameters, setParameters] = useState<Record<string, any>>({});
  useEffect(() => {
    // 每当selectedAppName发生变化时，将parameters设置为空
    if (selectedAppName && selectedAppName !== "") {
      setParameters({});
    }
  }, [selectedAppName]);
  // 添加新的功能选项定义
  const functionTabs = [
    { name: 'Upload File', id: 'upload', current: true, component: <FileUpload setParameters={setParameters} name="Default" /> },
    { name: 'Chrome Open URL', id: 'url', current: false, component: <GoogleOpenUrl setParameters={setParameters} name="Default" /> },
    { name: 'Github Clone Repo', id: 'clone', current: false, component: <VSCodeClone setParameters={setParameters} /> },
    { name: 'Normal Desktop Control', id: 'control', current: false, component: <Control setParameters={setParameters} name="Default" /> },
  ];
  // 在 CommandPalette 组件内添加状态
  const [currentFunction, setCurrentFunction] = useState(functionTabs[0].id);
  // Add helper function to render form based on selected app
  const renderCustomizeForm = () => {
    // if (!selectedAppName || selectedAppName === "") {
      return (
        <div className="w-full border-b border-gray-900/10 m-0 px-2 py-1">

          <div className="hidden sm:block">
            <nav className="isolate flex divide-x divide-gray-200 rounded-lg shadow mx-2 my-1" aria-label="Functions">
              {functionTabs.map((tab, tabIdx) => (
                <span
                  key={tab.id}
                  onClick={() => {
                    setCurrentFunction(tab.id);
                  }
                  }

                  className={classNames(
                    currentFunction === tab.id ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
                    tabIdx === 0 ? 'rounded-l-lg' : '',
                    tabIdx === functionTabs.length - 1 ? 'rounded-r-lg' : '',
                    'group relative min-w-0 flex-1 overflow-hidden bg-white py-2 px-2 text-center text-sm font-medium hover:bg-gray-50 focus:z-10 cursor-pointer'
                  )}
                >
                  <span>{tab.name}</span>
                  <span
                    aria-hidden="true"
                    className={classNames(
                      currentFunction === tab.id ? 'bg-indigo-500' : 'bg-transparent',
                      'absolute inset-x-0 bottom-0 h-0.5'
                    )}
                  />
                </span>
              ))}
            </nav>
          </div>

          {/* Render selected component */}
          <div className="px-2 py-1">
            {functionTabs.find(tab => tab.id === currentFunction)?.component}
          </div>
        </div>
      );


    // 原有的 app 相关逻辑保持不变
    switch (selectedAppName) {
      case 'Google Docs':
      case 'Google Sheets':
      case 'Google Slides':
      case 'Google Forms':
      case 'Google Colab':
      case 'Google Gmail':
      case 'Google Drive':
      case 'Google Calendar':
      case 'Amazon Shopping':
      case 'eBay':
      case 'IKEA':
      case 'Instacart':
      case 'Apple':
      case 'Nike SNKRS':
      case 'Stack Overflow':
      case 'HuggingFace':
      case 'GitHub':
      case 'LeetCode':
      case 'Kaggle':
      case 'Youtube':
      case 'TikTok':
      case 'Yelp':
      case 'Twitch':
      case 'BBC News':
      case 'CNN':
      case 'Bloomberg':
      case 'NYTimes':
      case 'Medium':
      case 'Google News':
      case 'ESPN':
      case 'NBA':
      case 'Expedia':
      case 'Trip.com':
      case 'Booking.com':
      case 'Airbnb':
      case 'Google Search':
      case 'Bing Search':
      case 'Chrome':
      case 'Zoom':
      case 'Todoist':
      case 'Staynb (Airbnb Clone)':
      case 'Omnizon (Amazon Clone)':
      case 'DashDish (DoorDash Clone)':
      case 'GoCalendar (Google Calendar Clone)':
      case 'GoMail (Gmail Clone)':
      case 'OpenDining (OpenTable Clone)':
      case 'NetworkIn (LinkedIn Clone)':
      case 'Udriver (Uber Clone)':
      case 'Fly Unified (United Clone)':
      case 'TopWork (UpWork Clone)':
      case 'Zilloft (Zillow Clone)':
        return (
          <GoogleOpenUrl
            name={selectedAppName}
            setParameters={setParameters}
          />
        );
      case 'VS Code':
        return (
          <VSCodeClone
            setParameters={setParameters}
          />
        );
      case 'Windows File Explorer':
      case 'Windows Paint':
      case "Notepad++":
      case "LibreOffice Impress":
      case "LibreOffice Writer":
      case "LibreOffice Calc":
      case "VLC":
      case "CapCut":
      case "GIMP":
        return (
          <FileUpload
            name={selectedAppName}
            setParameters={setParameters}
          />
        );
      case "":
        return <div className="w-full border-b border-gray-900/10 m-1 px-2 py-1">
          <p className="text-gray-500 py-0 sm:pt-1 mt-1 sm:mt-2 mb-2 sm:mb-4 text-start text-xs sm:text-sm">
            Customize the initial environment
          </p>
        </div>
      default:
        return <div className="w-full border-b border-gray-900/10 m-1 px-2 py-1">
          <p className="text-gray-500 py-0 sm:pt-1 mt-1 sm:mt-2 mb-2 sm:mb-4 text-start text-xs sm:text-sm"> Features coming soon... Try Chrome, VS Code or other apps.</p>
        </div>;
    }
  };

  // 3. 修改检查函数以使用状态
  const isSpecialEnvAvailable = () => {
    return isSpecialAvailable;
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-800 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-full py-20 overflow-y-auto">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="ml-[10%] w-[80%] mr-[10%] transform overflow-hidden rounded-xl bg-white shadow-2xl">
              {/* Mobile tab selector */}
              {/* <div className="sm:hidden px-4 py-4">
                <label htmlFor="tabs" className="sr-only">
                  Select a tab
                </label>
                <select
                  id="tabs"
                  name="tabs"
                  className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                >
                  {tabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.name}
                    </option>
                  ))}
                </select>
              </div> */}

              {/* Desktop tabs */}
              {/* <div className="hidden sm:block px-4 py-4">
                <nav
                  className="isolate flex flex-row divide-x divide-gray-200"
                  aria-label="Tabs"
                >
                  {tabs.map((tab, tabIdx) => (
                    <span
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={classNames(
                        tab.current
                          ? "text-gray-900"
                          : "text-gray-500 hover:text-gray-700",
                        "group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-center text-lg font-medium border-solid border border-gray-200 rounded-lg"
                      )}
                      aria-current={tab.current ? "page" : undefined}
                    >
                      <span>{tab.name}</span>
                      <span
                        aria-hidden="true"
                        className={classNames(
                          tab.current ? "bg-indigo-500" : "bg-transparent",
                          "absolute inset-x-0 bottom-0 h-0.5"
                        )}
                      />
                    </span>
                  ))}
                </nav>
              </div> */}

              {/* Tab content */}
              {activeTab === "customized" ? (
                <div className="flex transform-gpu divide-x divide-gray-100 grid grid-cols-3 gap-4">
                  {/* First Column - Apps List */}
                  <div className="col-span-1 overflow-y-auto px-4 py-2">
                    <div className="w-full text-sm text-gray-700">
                      {categories.map((category) => (
                        <div key={category.id} className="w-full">
                          <h3 className="px-2 py-1 text-sm font-semibold text-gray-600">
                            {category.name}
                          </h3>
                          {category.apps.map((app) => (
                            <div
                              key={app.id}
                              className={classNames(
                                "flex cursor-pointer select-none items-center rounded-md w-[80%] px-4 py-2",
                                selectedApp?.id === app.id ? "bg-gray-100" : ""
                              )}
                              onClick={() => {
                                setSelectedApp(app);
                                setSelectedAction(null);
                              }}
                            >
                              {/* {app.icon} */}
                              <span className="ml-3 flex-auto truncate">
                                {app.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Second Column - Actions List */}
                  {selectedApp && (
                    <div className="col-span-1 overflow-y-auto px-4 py-2 mb-4 bg-gray-100 rounded-lg">
                      <div className="w-full">
                        <h3 className="px-2 py-1 text-sm font-semibold text-gray-600">
                          Supported Actions
                        </h3>
                      </div>
                      <div className="w-full text-sm text-gray-700">
                        {selectedApp.supportedActions.map((action) => (
                          <div
                            key={action.id}
                            className={classNames(
                              "flex cursor-pointer select-none items-center rounded-md w-[80%] px-4 py-2",
                              selectedAction?.id === action.id
                                ? "bg-gray-200"
                                : ""
                            )}
                            onClick={() => setSelectedAction(action)}
                          >
                            <span className="flex-auto truncate">
                              {action.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Third Column - Action Form */}
                  {selectedAction && (
                    <div className="col-span-1 overflow-y-auto px-6 py-4">
                      <div className="w-full">
                        <h3 className="px-2 py-1 text-sm font-semibold text-gray-600">
                          Action Parameters
                        </h3>
                      </div>
                      <div className="max-w-full space-y-4">
                        {selectedAction.node}
                        <div className="flex justify-end gap-2 pt-4">
                          <span
                            onClick={() => {
                              const dataElement =
                                document.getElementById("commandData");
                              if (dataElement instanceof HTMLInputElement) {
                                try {
                                  const parameters = JSON.parse(
                                    dataElement.value
                                  );
                                  selectedAction.handleSubmit(parameters);
                                  setIsOpen(false);
                                } catch (e) {
                                  console.error("Failed to parse command data");
                                }
                              }
                            }}
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          >
                            Confirm
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-4 sm:px-8 py-2 sm:py-4">
                  <div className="flex justify-between items-center flex-col sm:flex-row gap-2 sm:gap-0">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 py-1 sm:py-2 my-1 sm:my-2 text-start">
                      Option 1: Choose preset startup desktop & initial apps
                    </h1>
                    <span
                      onClick={refreshAppOptions}
                      className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-solid border border-gray-200 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 text-sm"
                      title="Refresh random apps"
                    >
                      <FontAwesomeIcon icon={faShuffle} className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span className="hidden sm:inline">Refresh with another batch</span>
                      <span className="sm:hidden">Refresh</span>
                    </span>
                  </div>

                  <p className="text-gray-500 py-0 sm:pt-1 mt-1 sm:mt-2 mb-2 sm:mb-4 text-start text-xs sm:text-sm">
                    We provide a set of initial environments for you to choose from. They will be used to setup the computer before the conversation starts. Check Customize Section to DIY your own environment.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 auto-rows-auto grid-flow-row-dense">
                    {Object.entries(groupedAppOptions)
                      .sort(([aId, a], [bId, b]) => {
                        // 首先按照类别权重排序
                        const aCategoryId = aId.split('-group-')[0];
                        const bCategoryId = bId.split('-group-')[0];
                        const aCategoryInfo = SupportedEnvironments.find(env => env.id === aCategoryId);
                        const bCategoryInfo = SupportedEnvironments.find(env => env.id === bCategoryId);
                        
                        // 如果是同一个类别，按照组号排序
                        if (aCategoryId === bCategoryId) {
                          const aGroupNum = parseInt(aId.split('-group-')[1]);
                          const bGroupNum = parseInt(bId.split('-group-')[1]);
                          return aGroupNum - bGroupNum;
                        }
                        
                        // 不同类别按照权重排序
                        return (bCategoryInfo?.weight || 1) - (aCategoryInfo?.weight || 1);
                      })
                      .map(([categoryId, category]) => (
                        <div
                          key={categoryId}
                          className="bg-white rounded-lg p-0 shadow-sm border border-gray-200 h-fit"
                        >
                          <div className="flex items-center gap-1 sm:gap-1 text-[8px] px-1 py-0">
                            {category.icon}
                            <h3 className="font-medium text-gray-500 text-xs">{category.name}</h3>
                          </div>

                          <div className="space-y-0">
                            {category.apps.map((app) => {
                              const isDisabled = app.is_special && !isSpecialEnvAvailable();
                              return (
                                <div
                                  key={app.id}
                                  className={`flex items-center gap-0 px-1 py-1 sm:px-2 sm:py-1 rounded-md 
                                    ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer transition-transform hover:scale-105'}`}
                                  onClick={() => {
                                    if (!isDisabled) {
                                      setSelectedCategory(category.name);
                                      setSelectedAppName(app.name);
                                    }
                                  }}
                                >
                                  <div
                                    className={`flex items-center gap-1 sm:gap-2 w-full 
                                      ${selectedAppName === app.name ? "bg-indigo-100" : "bg-gray-50"}
                                      ${isDisabled ? 'border border-gray-200' : ''}
                                      rounded-xl px-1 py-0.5 sm:px-2 sm:py-1`}
                                  >
                                    {app.url ? (
                                      <img
                                        src={`https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(app.url)}`}
                                        alt=""
                                        className="h-3 w-3 sm:h-4 sm:w-4"
                                      />
                                    ) : (
                                      app.icon
                                    )}
                                    <span className={`text-xs sm:text-sm ${selectedCategory === app.id && !IsWaiting ? "text-indigo-600" : "text-gray-600"}`}>
                                      {app.name}
                                      {isDisabled && <span className="ml-2 text-red-500">(Waiting...)</span>}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                  {!isSpecialEnvAvailable() && os === "Windows" && (
                    <p className="text-gray-500 py-0 sm:pt-1 mt-1 sm:mt-2 mb-2 sm:mb-4 text-start text-xs sm:text-sm">
                      <span className="text-red-500 rounded-lg border border-solid border-red-500 px-2 py-1">Waiting...</span> means that these setup need advanced computers, which are limited in amounts for use and might be busy right now. So you may need to wait for a while until those computers are ready.
                    </p>
                  )}
                  <div className="mt-2 border-t border-gray-200 pt-2">
                    <div
                      className="flex w-auto items-center justify-start text-left hover:bg-gray-100 rounded-lg px-2 py-0"
                      onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
                    >
                      <h1 className="text-base sm:text-lg font-bold text-gray-900">
                        Option 2: Customize your initial desktop
                      </h1>
                      {/* <span className="animate-bounce-left ml-6">
                        <FontAwesomeIcon icon={faHandPointLeft} color="green" />
                        <span className="ml-2 text-green-800 text-sm">Click Me to Customize!</span>
                      </span> */}

                    </div>


                    {/* Collapsible content */}
                    {isCustomizeOpen && (
                      <div>
                        <div className="mt-0 px-2 py-0">
                          <div className="mt-0 border-t border-gray-200 pt-0">
                            {renderCustomizeForm()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-4 mb-2">
                    By continuing, I agree to the Computer Agent Arena's <a href="/terms-of-use" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms of Use</a> and <a href="https://computeragentarena.com/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>.
                  </p>
                  
                  <div className="flex flex-row gap-2 justify-end mt-4">

                    {/* <span
                      onClick={() => {
                        setSelectedCategory("original");
                        setSelectedAppName("original");
                        onSelectApp("original", "original");
                        setIsOpen(false);
                      }}
                      className="text-gray-500 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-100"
                    >
                      Skip
                    </span> */}
                    <span
                      onClick={() => {
                        if (parameters && parameters.app_name) {
                          // 从parameters的dict里面删除app_name
                          let app_name = parameters.app_name;
                          delete parameters.app_name;
                          onSelectApp(selectedCategory, app_name, parameters);
                        } else {
                          onSelectApp(selectedCategory, selectedAppName, parameters);
                        }
                        setIsOpen(false);
                      }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-md sm:text-lg font-semibold"
                    >
                      Go!
                    </span>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

const UrlIcon = ({ url }: { url: string }) => {
  const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!url.includes(".")) return;
    const domain = tryParseUrlDomain(url);
    if (!domain) return;
    setIconUrl(
      `https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(
        domain
      )}`
    );
  }, [url]);

  return (
    <img
      alt=""
      src="https://www.google.com/s2/favicons?sz=32&domain_url=https://github.com/"
      className="h-4 w-4"
    />
  );
};
