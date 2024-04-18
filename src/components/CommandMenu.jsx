import { useState, useEffect, useRef } from "react";
import {Search} from "lucide-react";

export default function CommandMenu({ CommandOptions }) {
    const [isopen, setOpen] = useState(false);

    const main = CommandOptions;
    const [temp, setTemp] = useState(main);
    const inputRef = useRef(null);

    const [focusedIndex, setFocusedIndex] = useState(-1);
    const buttonRefs = useRef([])

    const handler = (event) => {
      const value = event.target.value.toLowerCase();
      setTemp([]);
      for (let i = 0; i < main.length; i++) {
        const CurrentValue = main[i].command;
        if (CurrentValue.toLowerCase().includes(value)) {
          setTemp((temp) => [...temp, main[i]]);
        }
      }
    };

    const handleReturn = (event) => {
      const currentKey = event.key.toLowerCase()
      if (currentKey === "enter" && !(temp.length === 0)) {
        buttonRefs.current[0].focus();
      }
    }

    useEffect(() => {
      const handleKeyDown = (event) => {
        const currentKey = event.key.toLowerCase();
        if (currentKey === "arrowup") {
          setFocusedIndex((prevIndex) =>
            prevIndex === 0 ? temp.length - 1 : prevIndex - 1
          );
        } else if (currentKey === "arrowdown") {
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

    const handFocus = () => {
      inputRef.current.focus();
    };

    useEffect(() => {
      const OpenMenu = (event) => {
        const currentKey = event.key.toLowerCase();
        const closingConditions = [
          (currentKey === "escape"),
          (currentKey === "p" && event.ctrlKey),
          ((currentKey ===  "," || currentKey === ".") && event.altKey),
        ]
        if (currentKey === "p" && (event.metaKey || event.ctrlKey) && event.shiftKey) {
          event.preventDefault();
          setOpen(true);
          setTimeout(handFocus,10)

        } else if (currentKey === "s" && event.shiftKey) {
          setTimeout(handFocus,10)
        } else {
          closingConditions.some((condition) => {
            if (condition) {
              setOpen(false);
              setTemp(main);
              inputRef.current.value = "";
              setFocusedIndex(-1);
              return true
            };
          });
        };
      }

      document.addEventListener("keydown", OpenMenu);
      return () => document.removeEventListener("keydown", OpenMenu)
    }, []);

    return (
        <dialog className="border-[0.1px] border-zinc-600 bg-black text-white z-50 w-1/3 rounded-md mt-4 " open={isopen}>
          <div className="flex flex-row items-center gap-2 border-zinc-600 border-b-[0.1px] p-2" >
          <Search size={20}/><input ref={inputRef} className="bg-black w-full p-1 outline-0" placeholder="Enter Command" onInput={handler} onKeyDown={handleReturn}></input>
          </div>
          <div className="p-2 flex flex-col">
          { (temp.length === 0) ? <p className="px-2 py-1">No Matching Commands</p>
          :
            temp.map((item, index) => (
              <button key={index} ref={(ref) => (buttonRefs.current[index] = ref)} className="hover:bg-zinc-700 w-full text-left px-2 py-1 rounded-md flex flex-row  justify-between items-center focus:outline focus:outline-pink-400"
              onClick={() => {
                item.action();
                setOpen(false);
              }}
              >{item.command} {item.keys}</button>
            ))
          }
          </div>
        </dialog>
    )
  }
