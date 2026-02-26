import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCode } from "@fortawesome/free-solid-svg-icons";
import { useArena } from "../../../../context/ArenaContext";
import { useAuth } from "../../../../context/AuthContext";

interface CodeUploadProps {
  onConfirm: (data: { file_name: string }) => void;
}

export default function CodeUpload({ onConfirm }: CodeUploadProps) {
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const { chat_id } = useArena();
  const { user_id } = useAuth();

  useEffect(() => {
    const dataElement = document.getElementById("commandData");
    if (dataElement) {
      (dataElement as HTMLInputElement).value = JSON.stringify({
        file_name: fileName,
      });
    }
  }, [fileName]);

  const uploadFiles = async (files: FileList) => {
    if (files.length > 0) {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("file", file));
      formData.append("user_id", user_id || "");
      formData.append("chat_id", chat_id || "");

      try {
        const response = await fetch("/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        console.log("Upload successful", data);
        setFileName(files[0].name);
      } catch (error) {
        console.error("Error uploading files:", error);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    uploadFiles(files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
  };

  return (
    <div className="border-b border-gray-900/10 m-4 gap-4">
      <p className="mt-1 text-sm/6 text-gray-600">
        Upload a Jupyter Notebook file to open
      </p>

      <div
        className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 ${
          isDragging
            ? "border-indigo-600 bg-indigo-50"
            : "border-gray-900/25"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <FontAwesomeIcon
            icon={faFileCode}
            className="mx-auto h-12 w-12 text-gray-300"
          />
          <div className="mt-4 flex text-sm/6 text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".ipynb"
                onChange={handleFileChange}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs/5 text-gray-600">
            Jupyter Notebook files (.ipynb)
          </p>
          {fileName && (
            <p className="mt-2 text-sm text-gray-600">
              Selected file: {fileName}
            </p>
          )}
        </div>
      </div>
      <input type="hidden" id="commandData" />
    </div>
  );
}