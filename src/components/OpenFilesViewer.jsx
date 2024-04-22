import { useState, useEffect, useRef } from "react";
import { getOpenFiles } from "../FileOperations"
import { switchFile } from "../FileOperations";

export default function OpenFilesViewer({setCurrentFile}) {
        const [temp, setTemp] = useState([]);
        const [isOpen, setOpen] = useState(false);

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
          const openMenu = async (event) => {
            const currentKey = event.key.toLowerCase();
            const closingConditions = [
              (currentKey === "escape"),
              (currentKey === "p" && event.ctrlKey),
              (currentKey === "p" && event.ctrlKey && event.shiftKey),
            ]
            if ((currentKey === "," || currentKey === ".") && event.altKey && !isOpen)  {
              const OpenFiles = await getOpenFiles();
              const items = OpenFiles.map((val , index) => {
                const tempPath = (val.path.split("\\"));
                const path = tempPath.slice(0, tempPath.length-1).join("\\");
                const changeFile = () => {
                  switchFile(val.path);
                  setCurrentFile(val.path);
                  setFocusedIndex(0);
                  setOpen(false);
                };

                return (
                  <button key={index} ref={(ref) => (buttonRefs.current[index] = ref)}
                    className="hover:bg-zinc-800 w-full text-left px-2 py-1 rounded-md focus:outline focus:outline-pink-400"
                    onClick={changeFile}
                  >
                  {val.name}
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
          const closeMenu = (event) => {
            const currentKey = event.key.toLowerCase();
            if (currentKey === "alt") {
              buttonRefs.current[focusedIndex].click();
            }
          };

          document.addEventListener("keydown", openMenu);
          document.addEventListener("keyup", closeMenu);
          setTimeout(() => {
            if  (buttonRefs.current[focusedIndex]) {
              buttonRefs.current[focusedIndex].focus()
            }
          },10)

          return () => {
            document.removeEventListener("keydown", openMenu);
            document.removeEventListener("keyup", closeMenu);;
        }
        }, [isOpen]);

        return (
            <dialog className="border-[0.1px] border-zinc-600 bg-black text-white z-50 w-1/3 rounded-md mt-4" open={isOpen}>
              <div className="p-2 flex flex-col">
              {
                temp
              }
              </div>
            </dialog>
        )
      }
