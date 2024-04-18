import { useState, useEffect } from "react";
import { exit } from "@tauri-apps/api/process"
import { getOpenFile, openFile,  openFolder, saveFile, closeFile, isOpenFilesEmpty } from "./FileOperations"

import CodeEditor from "./CodeEditor";
import CommandMenu from "./components/CommandMenu";
import OpenFilesViewer from "./components/OpenFilesViewer";
import Home from "./Home";

import "./App.css";

//toast = {
//  type: Error/Warning/Success
//  message: String
//}

function closeApplication(code) {
    exit(code);
}

function App() {
  const [isHomeOpen, SetHomeState] = useState(true);
  const [toasts, SetToasts] = useState([]);

  const [FileContent, SetContent] = useState("");
  const [FileType, SetFileType] = useState("");
  const [FileName, SetFileName] = useState("");
  const [FileIcon, SetFileIcon] = useState("");
  const [FilePath, SetFilePath] = useState("");

  const useToast = async (type, message) => {
      let color = "";
      if (type === "success") {
        color = "bg-emerald-400"
      } else if (type === "error") {
        color = "bg-red-600"
      } else if (type === "warning") {
        color = "bg-amber-400"
      } else {
        color = "bg-indigo-600"
      }

    const newtoast = (
      <div className="mr-5 mb-5 border border-zinc-600 rounded-md flex flex-row origin-bottom-right animate-Toast">
          <div id="indicator" className={`${color} size-3 rounded-md border-l border-zinc-600 ml-[-4px] mt-[-4px] animate-ping`}>
          </div>
          <div id="indicator" className={`${color} size-2.5 rounded-md border-l border-zinc-600 ml-[-11px] mt-[-3px]`}>
          </div>
          <div id="content" className="p-2 text-sm">
            {message}
          </div>
        </div>
    )
    SetToasts((toasts) => [...toasts, newtoast]);
    setTimeout(() => {
      SetToasts((toasts) => toasts.filter((toast) => toast !== newtoast))
    }, 5000);
  };

  const fileSaveHandler = async () => {
    if (!isHomeOpen){
      const status = await saveFile(FilePath);
      if (status) {
        useToast("success", (FileName + ": Saved"));
      } else {
        useToast("error", (FileName + ": Save Failed"));
      }
    } else {
      useToast("warning", "No File Currently Open");
    };
  }

  const fileOpenHandler = async () => {
    const [newFilePath, newFileName, newFileType, newFileIcon , FileData] = await openFile();
          if (newFilePath) {
            SetContent(FileData);
            SetFileType(newFileType);
            SetFileName(newFileName);
            SetFileIcon(newFileIcon);
            SetFilePath(newFilePath);
            SetHomeState(false);
    }
  };

  const fileCloseHandler = async () => {
    if (!isHomeOpen) {
      const data = await getOpenFile(FilePath);
      if (data.status) {
        if (data.file.modified) {
          useToast("warning", (FileName + ": Not saved"));
        } else {
          const closingStatus = await closeFile(FilePath);
          if (closingStatus) {
            const isEmpty = await isOpenFilesEmpty();
            if (isEmpty) {
              SetHomeState(true);
              SetContent("");
              SetFileType("");
              SetFileName("");
              SetFileIcon("");
              SetFilePath("");
            } else {
              useToast("", "moreFiles");
            }
          } else {
            useToast("error", "Closing Failed");
          }
        }
      } else {
        useToast("error", "Closing Failed");
      }
    } else {
      useToast("warning", "No File Currently Open");
    };
  };

  const CommandOptions =
    [
       {command:"Open File", action: fileOpenHandler,
       keys: (<div className="flex flex-row gap-1 items-center">
        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">Ctrl</span>+
        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">p</span>
        </div>)
      },
        {command:"Open Folder", action: async () => {
          openFolder();
          //yet to implement
        },
        keys: (<div className="flex flex-row gap-1 items-center">
        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">Ctrl</span>+
        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">k</span>+
        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">o</span>
        </div>)
      },
        {command:"Save File", action: fileSaveHandler,
        keys: (<div className="flex flex-row gap-1 items-center">
        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">Ctrl</span>+
        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">s</span>
        </div>)
      },
        {command:"Close Application", action: async () => {closeApplication(0)},
        keys: (<div className="flex flex-row gap-1 items-center">
        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">Ctrl</span>+
        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">q</span>
        </div>)
      },
        {command:"Close File", action: fileCloseHandler,
        keys: (<div className="flex flex-row gap-1 items-center">
        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">Ctrl</span>+
        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">q</span>
        </div>)
      },
    ];

  let keys = {};
  useEffect( () => {
    const handler = async (event) => {
        const currentKey = event.key.toLowerCase();
        keys[currentKey] = true;
        if (event.ctrlKey && (currentKey === "o") && !keys["k"]) {
          await fileOpenHandler()
        }
        else if (event.ctrlKey && (currentKey === "o") && keys["k"]) {
          openFolder();
          keys["k"] = false;
          keys[currentKey] = false;
          SetHomeState(false);
        } else if (event.ctrlKey && (currentKey === "w")) {
          await fileCloseHandler();
          keys["w"] = false;
        }
        //else if (event.ctrlKey && (currentKey === "p")) {
        //  event.preventDefault();
        //  keys["p"] = false;
        //}
        else if (event.ctrlKey && (currentKey === "q")) {
          closeApplication(0);
          keys["q"] = false;
        };
    }
    const remover = (event) => {
        const currentKey = event.key.toLowerCase();
        if (currentKey === "control" || currentKey === "alt" || currentKey === "meta") {
          keys[currentKey] = false;
        }
    }
    window.addEventListener("keydown", handler);
    window.addEventListener("keyup", remover);
    return () => {
        window.removeEventListener("keydown", handler);
        window.removeEventListener("keyup", remover);
    };
  }
  , [isHomeOpen] );

  useEffect(() => {
    const handler = async (event) => {
      const currentKey = event.key.toLowerCase();
      keys[currentKey] = true;
      if (event.ctrlKey && (currentKey === "s")) {
        await fileSaveHandler();
      }
    }
    const remover = (event) => {
      const currentKey = event.key.toLowerCase();
      if (currentKey === "control" || currentKey === "alt" || currentKey === "meta") {
        keys[currentKey] = false;
      }
    }
    window.addEventListener("keydown", handler);
    window.addEventListener("keyup", remover);
    return () => {
        window.removeEventListener("keydown", handler);
        window.removeEventListener("keyup", remover);
    };
  }, [FileContent, FilePath, isHomeOpen]);

  return (
    <div className="h-screen p-0 bg-black w-screen font-Iosevka">
      <CommandMenu CommandOptions={CommandOptions}></CommandMenu>
      <OpenFilesViewer></OpenFilesViewer>
      {
        isHomeOpen ? <Home/> :
        <div className="h-screen p-0 w-screen">
          <div className="bg-black text-white border-b-2 border-pink-400 py-3 px-4 flex flex-row gap-3 mb-2">
          <img src={"/icons/"+FileIcon+".svg"} alt="" className="w-6" />
          <p>{FileName}</p>
          </div>
          <CodeEditor className="m-0 w-screen h-[98vh]" data = { FileContent } type = { FileType } path = {FilePath} onChange={SetContent}/>
        </div>
      }
      <div className="bottom-0 right-0 absolute text-white">
        {toasts}
      </div>
    </div>

  );
}


export default App;
