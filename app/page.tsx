"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { continueConversation } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types/types";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  }
);

export default function App() {
  const [input, setInput] = useState("");
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const handleSend = async () => {
    const { object } = await continueConversation(input);
    let newElements = [];
    for await (const partialObject of readStreamableValue(object)) {
      if (
        "type" in partialObject &&
        "x" in partialObject &&
        "y" in partialObject &&
        "width" in partialObject &&
        "height" in partialObject
      ) {
        newElements.push(partialObject);
      }
    }
    newElements = convertToExcalidrawElements(newElements);

    if (excalidrawAPI) {
      const currentElements = excalidrawAPI.getSceneElements();
      const updatedElements = [...currentElements, ...newElements];
      const sceneData = {
        elements: updatedElements,
      };
      excalidrawAPI.updateScene(sceneData);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <div className="w-3/4 flex justify-between">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow mr-4 p-2"
        />
        <button onClick={handleSend} className="p-2 bg-blue-500 text-white">
          Send
        </button>
      </div>
      <Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)} />
    </div>
  );
}
