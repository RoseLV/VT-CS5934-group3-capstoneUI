import React, { useState } from "react";
import { Button, Input, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import throttle from "lodash/throttle";

const { TextArea } = Input;

const LandingPage = () => {
  const [text, setText] = useState("");
  const [isFake, setFakeNews] = useState(null);
  const [isPositive, setIsPositive] = useState(null);

  // Mock API call to determine if the text is "Real" or "Fake"
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
      const fallbackPrediction = fallbackData[0]?.fake_news_prediction=="True"? "False":"True" || null;
      return fallbackPrediction;
    } catch (fallbackError) {
      console.error("Fallback API error:", fallbackError);
      return null; // Return null for invalid cases; // Final fallback value
    }
  };

  // Mock API call to determine if the text is "Real" or "Fake"
  const fetchvalidate = async (text) => {
    try {
      var fallbackResponse = await fetch(
        "http://cs5934-offline-group3-alb-985856241.us-east-1.elb.amazonaws.com/validate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vtext: text}), // The /predict endpoint expects a "texts" array
        }
      );

      if (!fallbackResponse.ok) throw new Error("Fallback API call failed");

      var fallbackData = await fallbackResponse.json();

      // Extract prediction from the first result in the response array
      var validateResponse = [];// array of obj
      if(fallbackData.is_valid == true){
        validateResponse = fallbackData?.similar_articles;
      }
      else{
        validateResponse=[{
          "title": "No similar articles found",
          "link": "",
          "similarity": 0
        }]
      }
      let maxSimilarityValue = Math.max(...validateResponse.map(article => article.similarity));
      let maxSimilarityValuePrecentage = Math.ceil(maxSimilarityValue * 10000) / 100 + " %";

      // Generate the HTML for the list of related news articles
      const relatedNewsHTML = validateResponse.map(article => {
          return `<li><a href="${article.link}" target="_blank">${article.title}</a></li>`;
      }).join('');

      // Insert the HTML into the document for validated news
      document.getElementById('accuracy').innerText = `Alignment Percentage: ${maxSimilarityValuePrecentage}`;
      document.getElementById('related-news').innerHTML = relatedNewsHTML;

      return validateResponse;
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
    document.getElementById('loader').style.display = 'block';

    // const result = await fetchFakeOrReal(text);
    // setFakeNews(result);

    // // call Sentiment
    // const resultSentiment = await fetchSentiment(text);
    // setIsPositive(resultSentiment);

    // //call validate api
    // const validateResponse = await fetchvalidate(text);

    const [result, resultSentiment, validateResponse] = await Promise.all([
      fetchFakeOrReal(text),
      fetchSentiment(text),
      fetchvalidate(text)
    ]);
  
    setFakeNews(result);
    setIsPositive(resultSentiment);

    document.getElementById('loader').style.display = 'none';
    
    message.success(`The text is classified as: ${result}`);
  };

  const handleReset = () => {
    setText("");
    setFakeNews(null);
    setIsPositive(null);

    // Insert the HTML into the document for validated news
    document.getElementById('accuracy').innerText = `Accuracy: ${0}%`;
    document.getElementById('related-news').innerHTML = [];
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
    <div className="container">
      {/* Left Section */}
      <div className="left-section">
        <h1 className="header">Misinformation Detector</h1>
        <TextArea
          placeholder="Input Text..."
          className="text-area"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoSize={{
            minRows: 6,
            maxRows: 10,
          }}
        />
        <div className="button-group">
          <Button type="primary" onClick={handleFakeNewsClick}>
            Check Fake News
          </Button>
          {/* <Button type="primary" onClick={handleSentimentClick}>
            Check Sentiment
          </Button> */}
          <Button type="default" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      {/* Right Section */}
      <div className="right-section">
      <div id="loader" className="loader" style={{ color: 'red',display:'none' }}><h1>Loading.....</h1></div>
        <h1>Result</h1>
        <p>
          <b>Fake News:</b> <span className={isFake === "Negative" ? "negative" : "positive"}>{isFake}</span>
        </p>
        <p>
          <b>Sentiment:</b> <span className={isPositive === "Positive" ? "positive" : "negative"}>{isPositive}</span>
        </p>
        
        <h2>Ground Truth Output</h2>
        <p>
          {/* <b>Accuracy:</b> 30% */}
          <div id="accuracy"></div>
        </p>
        <div className="related-news">
          <b>Related News:</b>
          {/* <ul>
            <li>Apple</li>
            <li>Cat</li>
            <li>Tot</li>
          </ul> */}
          <ul id="related-news"></ul>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
