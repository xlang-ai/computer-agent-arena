import { ProCard, ProDescriptions } from "@ant-design/pro-components";
import React, { useCallback } from "react";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Button, Divider, message, Upload } from "antd";
import "../CSS/VncViewer.css"; // 假设你的CSS文件名为VncViewer.css
import SocketIOService from "../../utils/SocketService";

const { Dragger } = Upload;

interface VncViewerProps {
  os: string | undefined;
  agent: string | undefined;
  vlm: string | undefined;
  isVncConnected: boolean;
  socketService: SocketIOService;
  disconnectVnc: () => void;
}

const VncViewer: React.FC<VncViewerProps> = ({
  os,
  agent,
  vlm,
  isVncConnected,
  socketService,
  disconnectVnc,
}) => {
  return (
    <ProCard gutter={8} headerBordered>
      <ProCard
        type="inner"
        colSpan="100%"
      >
        <div className="iframe-container">
          {1 !== 1 ? (
            <iframe
              id="noVncIframe"
              src="noVNC/vnc.html"
              className="responsive-iframe"
            />
          ) : (
            <img
              src="assets/Alt.png"
              alt="Waiting for VNC connection"
              className="responsive-iframe"
            />
          )}
        </div>
      </ProCard>
    </ProCard>
  );
};

export default VncViewer;
