import { useEffect, useState, DragEvent } from "react";
import axios from 'axios';
import { useAuth } from "../../../context/AuthContext";
import { useArena } from "../../../context/ArenaContext";

interface FileUploadProps {
  name: string;
  setParameters: (parameters: Record<string, any>) => void;
}

export default function FileUpload({ name, setParameters }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const { user_id } = useAuth();

  useEffect(() => {
    if (file) {
      const uploadFile = async () => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', user_id || '');
        
        setIsUploading(true);
        setUploadProgress(0);
        
        try {
          const response = await axios.post( process.env.REACT_APP_DOMAIN + '/command_upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent: any) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1)
              );
              setUploadProgress(percentCompleted);
            }
          });
          
          setParameters({ 
            action: "upload_file", 
            fileInfo: {
              name: file.name,
              size: file.size,
              type: file.type,
              path: response.data.file_path
            }
          });
        } catch (error) {
          console.error('File upload failed:', error);
        } finally {
          setIsUploading(false);
        }
      };

      uploadFile();
    }
  }, [file, setParameters]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
    console.log("handleFileChange", files);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
    console.log("handleDrop", files);
  };

  return (
    <div className="w-full h-full border-b border-gray-900/10 m-1 gap-4">
      <p className="mt-1 text-sm/6 text-gray-600">
        Upload your customzied file to the computer.
      </p>

      <div className="w-full grid grid-cols-1 gap-x-3 gap-y-4">
        <div className="col-span-full">
          <label
            htmlFor="file-upload"
            className="block text-sm/6 font-medium text-gray-900"
          >
            File Upload
          </label>
          <div
            className={`mt-2 flex justify-center rounded-lg border border-dashed px-2 py-4 ${
              isDragging
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-900/25"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <svg
                className="mx-auto size-12 text-gray-300"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="mt-2 flex flex-row items-center text-sm/6 text-gray-600 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                >
                  <span>Upload a file here</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              {file && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected file: {file.name}
                </p>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {uploadProgress}%
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Uploading {file?.name}...
              </p>
            </div>
          )}

          {/* Show file name after upload */}
          {!isUploading && file && (
            <p className="mt-2 text-sm text-gray-500">
              Uploaded: {file.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
