import React from "react";
import { Button, Input, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
const { TextArea } = Input;

const LandingPage = () => {
  const handleUpload = (info) => {
    console.log("Upload Info:", info);
  };

  return (
    <div
      style={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        justifyContent: "space-between",
      }}
    >
      <h1> Misinformation Detector</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Upload beforeUpload={() => false} onChange={handleUpload}>
          <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
        <p>AND / OR</p>
        <TextArea
          placeholder="Enter something..."
          style={{ width: "300px", marginBottom: "2em" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Upload Button on the Left */}

          {/* Submit Button on the Right */}
          <Button type="primary">Submit</Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
