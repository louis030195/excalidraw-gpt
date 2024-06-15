"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { continueConversation } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader } from "lucide-react";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

export default function App() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("default");
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const handleSendDefault = async () => {
    setIsLoading(true);
    console.log("getAppState", excalidrawAPI?.getAppState());
    console.log("history", excalidrawAPI?.history);
    console.log("getSceneElements", excalidrawAPI?.getSceneElements());
    const { object } = await continueConversation(
      `Scene state:\n\n${JSON.stringify(
        excalidrawAPI?.getAppState(),
        null,
        2
      )}\n\nUser input: ${input}`
    );
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
    setIsLoading(false);
  };

  const handleSendAlternative = async () => {
    // Alternative send logic
  };

  const handleSend = () => {
    if (mode === "alternative") {
      handleSendAlternative();
    } else {
      handleSendDefault();
    }
  };

  return (
    <div className="w-screen h-screen flex">
      <div className="flex-grow flex flex-col items-center justify-center">
        <Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)} />
      </div>
      <div className="w-1/4 bg-gray-100 p-4 space-y-4">
        <h3 className="text-lg font-semibold">Chat</h3>
        <span className="text-sm text-gray-500">
          This is an experiment to bring the best of excalidraw.com, cursor.com
          and other ideas. Currently you can only use the default mode and ask
          for &quot;rectangle&quot;, &quot;ellipse&quot;, &quot;diamond&quot;,
          &quot;circle&quot; at the positions or colors you want.
        </span>
        <div className="w-full flex flex-col justify-between space-y-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Mode</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Select Mode</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={mode} onValueChange={setMode}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuRadioItem value="default">
                      Generate Shapes
                    </DropdownMenuRadioItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate shapes from text.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuRadioItem value="alternative">
                      Generate Text (not implemented)
                    </DropdownMenuRadioItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Alternative mode for different sending logic.</p>
                  </TooltipContent>
                </Tooltip>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow mr-4 p-2"
          />
          <Button
            onClick={handleSend}
            className="w-full flex items-center justify-center"
          >
            Send
            {isLoading && <Loader className="ml-2 animate-spin" size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
