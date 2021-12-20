import React from "react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

import "./App.css";

const API_URL = "https://baconipsum.com/api/?type=meat-and-filler";

let SECONDS = 60;

function App() {
  const [paragraphs, setParagraphs] = useState([]);
  const [words, setWords] = useState([]);
  const [countDown, setCountDown] = useState(SECONDS);
  const [currentInput, setCurrentInput] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(-1);
  const [currentChar, setCurrentChar] = useState("");
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [status, setStatus] = useState("waiting");
  const textInput = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      let arr = [];
      const result = await axios(API_URL);
      setParagraphs(result.data);
      result.data.forEach((item) => {
        let newArr = item.split(" ");
        arr = [...arr, ...newArr];
      });
      setWords(arr);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (status === "started") {
      textInput.current.focus();
    }
  }, [status]);

  function start() {
    if (status === "finished") {
      setCurrentWordIndex(0);
      setCorrect(0);
      setIncorrect(0);
    }
    if (status !== "started") {
      setStatus("started");
      let interval = setInterval(() => {
        setCountDown((prevCountDown) => {
          if (prevCountDown === 0) {
            clearInterval(interval);
            setStatus("finished");
            setCurrentInput("");
            return SECONDS;
          } else {
            return prevCountDown - 1;
          }
        });
      }, 1000);
    }
  }

  function handleKeyDown({ keyCode, key }) {
    if (keyCode === 32) {
      checkMatch();
      setCurrentInput("");
      setCurrentWordIndex(currentWordIndex + 1);
      setCurrentCharIndex(-1);
    } else {
      setCurrentCharIndex(currentCharIndex + 1);
      setCurrentChar(key);
    }
  }

  function checkMatch() {
    const wordToCompare = words[currentWordIndex];
    const doesItMatch = wordToCompare === currentInput.trim();
    if (doesItMatch) {
      setCorrect(correct + 1);
    } else {
      setIncorrect(incorrect + 1);
    }
  }

  function getCharClass(wordIdx, charIdx, char) {
    if (
      wordIdx === currentWordIndex &&
      charIdx === currentCharIndex &&
      currentChar &&
      status !== "finished"
    ) {
      if (char === currentChar) {
        return "successBG";
      } else {
        return "errBG";
      }
    } else {
      return "";
    }
  }

  return (
    <div className="App">
      <div className="apiText">
        {paragraphs.map((item, i) => (
          <span key={i}>
            {item
              .toLowerCase()
              .split("")
              .map((char, idx) => (
                <span className={getCharClass(i, idx, char)} key={idx}>
                  {char}
                </span>
              ))}
            ;<span></span>
          </span>
        ))}
      </div>
      <section>
        <div className="time">
          <h2>{countDown}</h2>
        </div>
      </section>
      <section id="control">
        <input
          ref={textInput}
          disabled={status !== "started"}
          type="text"
          className="inputFld"
          onKeyDown={handleKeyDown}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
        ></input>
      </section>
      <section id="btn">
        <button onClick={start}>Start</button>
      </section>

      {status === "finished" && (
        <section className="results">
          <div className="columns">
            <div className="column">
              <p>Words per minute:</p>
              <p>{correct}</p>
            </div>
            <div className="column">
              <p>Accuracy:</p>
              <p>{Math.round((correct / (correct + incorrect)) * 100)} %</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
