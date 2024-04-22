import { useState, useEffect } from "react";
import { exit } from "@tauri-apps/api/process"
import { getOpenFile, openFile,  openFolder, saveFile, closeFile, isOpenFilesEmpty, newFile, openNewWindow, getRecentFile } from "./FileOperations"

import CodeEditor from "./CodeEditor";
import CommandMenu from "./components/CommandMenu";
import OpenFilesViewer from "./components/OpenFilesViewer";
import { ConfirmDialog } from"./ConfirmDialog";
import Home from "./Home";

import "./App.css";

//toast = {
//  type: error/warning/success
//  message: String
//}

function createCommand(command, action, keys) {
    const last = keys.length -1;
    const styledKeys = keys.map((key, index) => {
      return (<>
      <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">{key}</span>{(!(last === index) ? "+" : "")}
      </>)
    });
    return {
      command: command,
      action: action,
      keys: (
        <div className="flex flex-row gap-1 items-center">
        {styledKeys}
        </div>),
    }
}

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

  const [OpenConfirm, setOpenConfirm] = useState(false);

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
      <div className="mr-5 mb-5 pr-4 border border-zinc-600 rounded-md flex flex-row origin-bottom-right animate-Toast">
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
  const fileNewHandler = async () => {
    const [newFilePath, newFileName, newFileType, newFileIcon , FileData] = await newFile();
          if (newFilePath) {
            SetContent(FileData);
            SetFileType(newFileType);
            SetFileName(newFileName);
            SetFileIcon(newFileIcon);
            SetFilePath(newFilePath);
            SetHomeState(false);
    }
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

  const newWindowHandler = async () => {
    const status = await openNewWindow();
    if (status) {
      useToast("success","Window Opened")
    } else {
      useToast("error","Opening Window Failed")
    }
  };

  const fileCloseHandler = async () => {
    if (!isHomeOpen) {
      const data = await getOpenFile(FilePath);
      if (data.status) {
        if (data.file.modified) {
          setOpenConfirm(true)
        } else {
          const closingStatus = await closeFile(FilePath);
          if (closingStatus) {
            const tempName = FileName;
            const isEmpty = await isOpenFilesEmpty();
            if (isEmpty) {
              SetHomeState(true);
              SetContent("");
              SetFileType("");
              SetFileName("");
              SetFileIcon("");
              SetFilePath("");
            } else {
              const recentFilePath = await getRecentFile();
              const data = await getOpenFile(recentFilePath);
              if (data.status) {
                SetHomeState(false);
                SetContent(data.file.content);
                SetFileType(data.file.language);
                SetFileName(data.file.name);
                SetFileIcon(data.file.icon);
                SetFilePath(recentFilePath);
              } else {
                useToast("error","Getting Recent File Failed");
              }
            }
            useToast("", (tempName+": Closed"))
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

  const setCurrentFile = async (path) => {
    const data = await getOpenFile(path);
    if (data.status) {
      SetHomeState(false);
      SetContent(data.file.content);
      SetFileType(data.file.language);
      SetFileName(data.file.name);
      SetFileIcon(data.file.icon);
      SetFilePath(path);
    } else {
      useToast("error","Changing Files Failed");
    }
  }

  const handleConfirm = async (type) => {
    if (type === "save") {
      await fileSaveHandler();
      const closingStatus = await closeFile(FilePath);
      if (closingStatus) {
        const tempName = FileName;
        const isEmpty = await isOpenFilesEmpty();
        if (isEmpty) {
          SetHomeState(true);
          SetContent("");
          SetFileType("");
          SetFileName("");
          SetFileIcon("");
          SetFilePath("");
        } else {
          const recentFilePath = await getRecentFile();
          const data = await getOpenFile(recentFilePath);
          if (data.status) {
            SetHomeState(false);
            SetContent(data.file.content);
            SetFileType(data.file.language);
            SetFileName(data.file.name);
            SetFileIcon(data.file.icon);
            SetFilePath(recentFilePath);
          } else {
            useToast("error","Getting Recent File Failed");
          }
        }
        useToast("", (tempName+": Closed"))
      } else {
        useToast("error", "Closing Failed");
      }
      setOpenConfirm(false)
    } else if (type === "dontsave" ) {
      const closingStatus = await closeFile(FilePath);
      if (closingStatus) {
        const tempName = FileName;
        const isEmpty = await isOpenFilesEmpty();
        if (isEmpty) {
          SetHomeState(true);
          SetContent("");
          SetFileType("");
          SetFileName("");
          SetFileIcon("");
          SetFilePath("");
        } else {
          const recentFilePath = await getRecentFile();
          const data = await getOpenFile(recentFilePath);
          if (data.status) {
            SetHomeState(false);
            SetContent(data.file.content);
            SetFileType(data.file.language);
            SetFileName(data.file.name);
            SetFileIcon(data.file.icon);
            SetFilePath(recentFilePath);
          } else {
            useToast("error","Getting Recent File Failed");
          }
        }
        useToast("", (tempName+": Closed"))
      } else {
        useToast("error", "Closing Failed");
      }
      setOpenConfirm(false)
    } else if (type === "cancel") {
      setOpenConfirm(false)
    }

  };

  const [CommandOptions, setCommandOptions] = useState([
      createCommand("New File", fileNewHandler, ["Ctrl","n"]),
      createCommand("Open File", fileOpenHandler, ["Ctrl","o"]),
      createCommand("Open Folder", async () => {
        openFolder();
        //yet to implement
      }, ["Ctrl","k","o"]),
      createCommand("Open New Window", newWindowHandler, ["Ctrl","Shift","n"]),
      createCommand("Save File", fileSaveHandler, ["Ctrl","s"]),
      createCommand("Close Application", () => {closeApplication(0)}, ["Ctrl","q"]),
      createCommand("Close File", fileCloseHandler, ["Ctrl","w"]),
    ]);

  useEffect(() => {
    setCommandOptions([
      createCommand("New File", fileNewHandler, ["Ctrl","n"]),
      createCommand("Open File", fileOpenHandler, ["Ctrl","o"]),
      createCommand("Open Folder", async () => {
        openFolder();
        //yet to implement
      }, ["Ctrl","k","o"]),
      createCommand("Open New Window", newWindowHandler, ["Ctrl","Shift","n"]),
      createCommand("Save File", fileSaveHandler, ["Ctrl","s"]),
      createCommand("Close Application", () => {closeApplication(0)}, ["Ctrl","q"]),
      createCommand("Close File", fileCloseHandler, ["Ctrl","w"]),
    ]);
  }, [isHomeOpen, FilePath, FileName]);


  let keys = {};
  useEffect( () => {
    const handler = async (event) => {
        const currentKey = event.key.toLowerCase();
        keys[currentKey] = true;
        if (event.ctrlKey && (currentKey === "o") && !keys["k"]) {
          await fileOpenHandler()
          keys["o"] = false;
        }
        else if (event.ctrlKey && (currentKey === "o") && keys["k"]) {
          openFolder();
          keys["k"] = false;
          keys[currentKey] = false;
          SetHomeState(false);
        } else if (event.ctrlKey && (currentKey === "n") && !event.shiftKey) {
            await fileNewHandler()
            keys["n"] = false;
        } else if (event.ctrlKey && (currentKey === "n") && event.shiftKey) {
          await newWindowHandler();
          keys["n"] = false;
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
      } else if (event.ctrlKey && (currentKey === "w")) {
        await fileCloseHandler();
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
      <OpenFilesViewer setCurrentFile={setCurrentFile}></OpenFilesViewer>
      <ConfirmDialog FileName={FileName} Open={OpenConfirm} handleConfirm={handleConfirm} ></ConfirmDialog>
      {
        isHomeOpen ? <Home/> :
        <div className="h-screen p-0 w-screen">
          <div className="bg-black text-white border-b-2 border-pink-400 py-3 px-4 flex flex-row items-center gap-3 mb-2">
          <img src={"/icons/"+FileIcon+".svg"} alt="" className="w-8" />
          <p className="text-lg">{FileName}</p><p className="text-zinc-400 text-xs">{FilePath}</p>
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
