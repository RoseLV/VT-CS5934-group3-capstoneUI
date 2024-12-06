import React, { useState } from "react";
import { Button, Input, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const LandingPage = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  // Mock API call to determine if the text is "Real" or "Fake"
  const fetchFakeOrReal = async (text) => {
    console.log("Sending text to API:", text);
    try {
      // Mock API response with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
      const isReal = Math.random() < 0.5; // Randomly determine if text is Real or Fake
      return isReal ? "Real" : "Fake";
    } catch (error) {
      console.error("API error:", error);
      return "Error";
    }
  };

  async function fetchSentiment(text) {
    try {
      const fallbackResponse = await fetch(
        "http://cs5934-offline-group3-alb-985856241.us-east-1.elb.amazonaws.com/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ texts: [text] }), // The /predict endpoint expects a "texts" array
        }
      );

      if (!fallbackResponse.ok) throw new Error("Fallback API call failed");

      const fallbackData = await fallbackResponse.json();

      // Extract prediction from the first result in the response array
      const fallbackPrediction = fallbackData[0]?.prediction || null;
      return fallbackPrediction;
    } catch (fallbackError) {
      console.error("Fallback API error:", fallbackError);
      return null; // Return null for invalid cases; // Final fallback value
    }
  }

  const handleUpload = (info) => {
    console.log("Upload Info:", info);
  };

  const handleClick = async () => {
    if (!text.trim()) {
      message.warning("Please enter some text before submitting.");
      return;
    }
    const result = await fetchSentiment(text);
    setResult(result);
    message.success(`The text is classified as: ${result}`);
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
      <h1>Misinformation Detector</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* 
        <Upload beforeUpload={() => false} onChange={handleUpload}>
          <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
        <p>AND / OR</p> Upload Section */}

        {/* Text Input Section */}
        <TextArea
          placeholder="Enter something..."
          style={{ width: "300px", marginBottom: "2em" }}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Submit Button */}
          <Button type="primary" onClick={handleClick}>
            Submit
          </Button>
        </div>

        {/* Display Result */}
        {result && (
          <div style={{ marginTop: "20px" }}>
            <h3>Result: {result}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
