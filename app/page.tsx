"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { continueConversation } from "./actions";
import { readStreamableValue } from "ai/rsc";
// import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
// import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

// const Excalidraw = dynamic(
//   async () => (await import("@excalidraw/excalidraw")).Excalidraw,
//   {
//     ssr: false,
//   }
// );

export default function App() {
  const [elements, setElements] = useState<any>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    const { object } = await continueConversation(input);
    let newElements: any = [];
    for await (const partialObject of readStreamableValue(object)) {
      console.log(partialObject);
      // newElements = [...newElements, ...partialObject];
      // setElements(convertToExcalidrawElements(newElements));
    }
  };

  return (
    <div className="w-screen h-screen">
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
      </div>
      {/* <Excalidraw initialData={{ elements }} /> */}
    </div>
  );
}
