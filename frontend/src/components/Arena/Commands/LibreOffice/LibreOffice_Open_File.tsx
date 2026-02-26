import React, { useState, useEffect } from 'react';

interface LibreOfficeOpenFileProps {
  type: 'writer' | 'calc' | 'impress';
  onConfirm: (data: any) => void;
}

export default function LibreOfficeOpenFile({ type, onConfirm }: LibreOfficeOpenFileProps) {
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const dataElement = document.getElementById('commandData');
    if (dataElement) {
      (dataElement as HTMLInputElement).value = JSON.stringify({
        download_url: downloadUrl,
        file_name: fileName,
      });
    }
  }, [downloadUrl, fileName]);

  return (
    <div className="w-full border-b border-gray-900/10 m-4 gap-4">
      <p className="mt-1 text-sm/6 text-gray-600">
        Enter the file details to open in LibreOffice {type}
      </p>

      <div className="w-full grid grid-cols-1 gap-x-6 gap-y-8">
        <div className="col-span-full">
          <label htmlFor="downloadUrl" className="block text-sm/6 font-medium text-gray-900">
            Download URL
          </label>
          <div className="mt-2 w-[800px]">
            <div className="w-full flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <input
                type="text"
                id="downloadUrl"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm/6"
                placeholder="Enter file download URL"
                required
              />
            </div>
          </div>
        </div>

        <div className="col-span-full">
          <label htmlFor="fileName" className="block text-sm/6 font-medium text-gray-900">
            File Name
          </label>
          <div className="mt-2 w-[800px]">
            <div className="w-full flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <input
                type="text"
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm/6"
                placeholder="Enter file name"
                required
              />
            </div>
          </div>
        </div>
      </div>
      <input type="hidden" id="commandData" />
    </div>
  );
} 