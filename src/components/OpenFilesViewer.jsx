import { useState, useEffect, useRef } from "react";
import { getOpenFiles } from "../FileOperations"


export default function OpenFilesViewer() {
        const [temp, setTemp] = useState([]);
        const [isopen, setOpen] = useState(false);

        const [focusedIndex, setFocusedIndex] = useState(0);
        const buttonRefs = useRef([])

        useEffect(() => {
          const handleKeyDown = (event) => {
            const currentKey = event.key.toLowerCase();
            if ((currentKey === "," && event.altKey) || currentKey === "arrowup") {
              setFocusedIndex((prevIndex) =>
                prevIndex === 0 ? temp.length - 1 : prevIndex - 1
              );
            } else if ((currentKey === "." && event.altKey)  || currentKey === "arrowdown") {
              setFocusedIndex((prevIndex) =>
                prevIndex === temp.length - 1 ? 0 : prevIndex + 1
              );
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

        useEffect(() => {
          const OpenMenu = async (event) => {
            const currentKey = event.key.toLowerCase();
            const closingConditions = [
              (currentKey === "escape"),
              (currentKey === "p" && event.ctrlKey),
              (currentKey === "p" && event.ctrlKey && event.shiftKey),
            ]
            if ((currentKey === "," || currentKey === ".") && event.altKey && !isopen)  {
              const OpenFiles = await getOpenFiles();
              const items = Object.entries(OpenFiles).map((val , index) => {
                const tempPath = (val[0].split("\\"));
                const path = tempPath.slice(0, tempPath.length-1).join("\\");
                const changeFile = () => {
                  setOpen(false);

                };
                return (
                  <button key={index} ref={(ref) => (buttonRefs.current[index] = ref)}
                    className="hover:bg-zinc-800 w-full text-left px-2 py-1 rounded-md focus:outline focus:outline-pink-400"
                    onClick={changeFile}
                  >
                  {val[1]}
                  <span className="ml-2 text-zinc-400 text-xs">{path}</span>
                  </button>
                )
              })
              setTemp(items);
              event.preventDefault();
              setOpen(true);

            } else {
              closingConditions.some((condition) => {
                if (condition) {
                  setOpen(false);
                  setFocusedIndex(0);
                  return true
                };
              });
            };
          }

          document.addEventListener("keydown", OpenMenu);
          return () => document.removeEventListener("keydown", OpenMenu)
        }, [isopen]);

        return (
            <dialog className="border-[0.1px] border-zinc-600 bg-black text-white z-50 w-1/3 rounded-md mt-4" open={isopen}>
              <div className="p-2 flex flex-col">
              {
                temp
              }
              </div>
            </dialog>
        )
      }
