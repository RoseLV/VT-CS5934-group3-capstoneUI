import React, { useState } from "react";
import { Button, Input, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import throttle from "lodash/throttle";

const { TextArea } = Input;

const LandingPage = () => {
  const [text, setText] = useState("");
  const [isFake, setFakeNews] = useState(null);
  const [isPositive, setIsPositive] = useState(null);

  const fetchFakeOrReal = async (text) => {
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
      const fallbackPrediction = fallbackData[0]?.fake_news_prediction || null;
      return fallbackPrediction;
    } catch (fallbackError) {
      console.error("Fallback API error:", fallbackError);
      return null; // Return null for invalid cases; // Final fallback value
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
      const fallbackPrediction = fallbackData[0]?.sentiment_prediction || null;
      return fallbackPrediction;
    } catch (fallbackError) {
      console.error("Fallback API error:", fallbackError);
      return null; // Return null for invalid cases; // Final fallback value
    }
  }

  const handleSentimentClick = async () => {
    if (!text.trim()) {
      message.warning("Please enter some text before submitting.");
      return;
    }
    const result = await fetchSentiment(text);
    setIsPositive(result);
    message.success(`The text is classified as: ${result}`);
  };

  const handleFakeNewsClick = async () => {
    if (!text.trim()) {
      message.warning("Please enter some text before submitting.");
      return;
    }
    const result = await fetchFakeOrReal(text);
    setFakeNews(result);
    message.success(`The text is classified as: ${result}`);
  };

  const handleReset = () => {
    setText("");
    setFakeNews(null);
    setIsPositive(null);
  };

  const handleDisagree = async (label) => {
    try {
      const response = await fetch(
        "http://cs5934-offline-group3-alb-985856241.us-east-1.elb.amazonaws.com/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tweet_id: "",
            tweet_text: text,
            predicted_label: label,
            disagree: true,
          }),
        }
      );

      if (!response.ok) throw new Error("API call failed");

      const data = await response.json();
      message.info(data.message);
      // Process the response as needed (this example assumes a simple success message or additional data)
      return data;
    } catch (error) {
      console.error("API error:", error);
      return null; // Return null for error cases
    }
  };

  const throttledHandleDisagree = throttle(handleDisagree, 5000);
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
      <div>
        <h3>Misinformation Detector</h3>
        {/* Display Result */}
        <div style={{ margin: "20px", textAlign: "left" }}>
          <p>
            Fake News: {isFake}{" "}
            {isFake && (
              <Button
                type="primary"
                danger
                onClick={() => throttledHandleDisagree(isFake)}
              >
                disagree
              </Button>
            )}
          </p>
          <p>
            Sensiment: {isPositive}{" "}
            {isPositive && (
              <Button
                type="primary"
                danger
                onClick={() => throttledHandleDisagree(isPositive)}
              >
                disagree
              </Button>
            )}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Text Input Section */}
        <TextArea
          placeholder="Enter something..."
          style={{ width: "300px", marginBottom: "2em" }}
          value={text}
          autoSize={{
            minRows: 6,
            maxRows: 20,
          }}
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
          <Button type="primary" onClick={throttle(handleFakeNewsClick, 3000)}>
            Check Fake News
          </Button>
          <Button type="primary" onClick={throttle(handleSentimentClick, 3000)}>
            Check Sentiment
          </Button>
          <Button type="primary" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
