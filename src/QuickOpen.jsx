import {Search} from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { quickOpenSearch } from "./FileOperations";
import { getFolder } from "./FileOperations";

export default function QuickOpen({ParentOpen, SetParentOpen,openFile, useToast}) {
    const [isopen, setOpen] = useState(false);
    const [temp, setTemp] = useState([]);
    const [inputValue, setValue] = useState("");
    const [FolderPath, SetFolderPath] = useState("");
    const inputRef = useRef(null);

    const [focusedIndex, setFocusedIndex] = useState(-1);
    const buttonRefs  = useRef([])

    const handler = async (event) => {
      const value = event.target.value.toLowerCase();
      setValue(value);
      if (value === "") {
        setTemp([]);
      } else {
        const data = await quickOpenSearch(value);
        setTemp(data);
      }
    }

    const handleReturn = (event) => {
      const currentKey = event.key.toLowerCase()
      if (currentKey === "enter" && !(temp.length === 0)) {
        buttonRefs.current[0].focus();
      } else if (currentKey === 'arrowup' || currentKey === 'arrowdown') {
        event.preventDefault();
      }
    }

    //const openFileHandler = (path) => {
    //}

    const setFolder = async () => {
      const folder = await getFolder();
      SetFolderPath(folder);
    }

    useEffect(() => {
      const handler = async () => {
        await setFolder();
        if (ParentOpen) {
          if (FolderPath) {
            setOpen(true);
            setTimeout(handFocus,10)
          } else {
            useToast("warning", "No Folder Currently Open");
            SetParentOpen(false)
          }
        }
      };
      handler();
    }, [ParentOpen])

    useEffect(() => {
      const handleKeyDown = (event) => {
        const currentKey = event.key.toLowerCase();
        if (currentKey === "home") {
          setFocusedIndex(0);
        } else if (currentKey === "end") {
          setFocusedIndex(temp.length-1);
        }
        if (currentKey === "arrowup") {
          setFocusedIndex((prevIndex) =>
            prevIndex === 0 ? temp.length - 1 : prevIndex - 1
          );
        } else if (currentKey === "arrowdown") {
          setFocusedIndex((prevIndex) =>
            prevIndex === temp.length - 1 ? 0 : prevIndex + 1
          );
        } else if (currentKey !== "enter") {
          handFocus();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [temp.length]);

    useEffect(() => {
      if (buttonRefs.current[focusedIndex]) {
        buttonRefs.current[focusedIndex].focus();
      };
    }, [focusedIndex]);

    const handFocus = () => {
      inputRef.current.focus();
    };

    useEffect(() => {
      const OpenMenu = async (event) => {
        const currentKey = event.key.toLowerCase();
        const closingConditions = [
          (currentKey === "escape"),
          (currentKey === "p" && event.ctrlKey  && event.shiftKey),
          ((currentKey ===  "," || currentKey === ".") && event.altKey),
        ]
        if (currentKey === "p" && event.ctrlKey && !event.shiftKey) {
          event.preventDefault();
          await setFolder();
          if (FolderPath) {
            setOpen(true);
            setTimeout(handFocus,10)
          } else {
            useToast("warning", "No Folder Currently Open");
          }
        }
        else {closingConditions.some((condition) => {
            if (condition) {
              setOpen(false);
              setTemp([]);
              SetParentOpen(false);
              inputRef.current.value = "";
              setFocusedIndex(-1);
              setValue("");
              return true
            };
          });
        }
      }

      document.addEventListener("keydown", OpenMenu);
      return () => document.removeEventListener("keydown", OpenMenu)
    }, [FolderPath]);
    return (
        <dialog className="border-[0.1px] border-zinc-600 bg-black text-white z-50 w-1/3 rounded-md mt-4 " open={isopen}>
          <div className="flex flex-row items-center gap-2 border-zinc-600 border-b-[0.1px] p-2" >
          <Search size={20}/><input ref={inputRef} className="bg-black w-full p-1 outline-0" placeholder="Enter File Name" onInput={handler} onKeyDown={handleReturn}></input>
          </div>
          <div className="p-2 flex flex-col max-h-64 overflow-y-auto CommandMenuScrollBar">
          { ((temp.length === 0) && (inputValue !== "")) ? <p className="px-2 py-1">No Matching Files</p>
          :
            temp.map((item, index) => (
              <button key={index} ref={(ref) => (buttonRefs.current[index] = ref)} className="hover:bg-zinc-800 w-full text-left px-2 py-1 rounded-md flex flex-row  justify-between items-center focus:outline focus:outline-pink-400 hover:outline-1 hover:outline hover:outline-pink-400"
              onClick={() => {
                openFile(item);
                setOpen(false);
                setTemp([]);
                SetParentOpen(false);
                inputRef.current.value = "";
                setFocusedIndex(-1);
                setValue("");
              }}
              >{item.replace(FolderPath, "")}</button>
            ))
          }
          </div>
        </dialog>
    )
}