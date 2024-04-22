import { MessageCircleWarning } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export function ConfirmDialog({Open, FileName, handleConfirm}) {
  const [isopen, setOpen] = useState(false);

  const [focusedIndex, setFocusedIndex] = useState(0);
  const SaveButton = useRef(null);
  const DontSaveButton = useRef(null);
  const CancelButton = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const currentKey = event.key.toLowerCase();
      if (currentKey === "arrowleft") {
        setFocusedIndex((prevIndex) =>
          prevIndex === 0 ? 3 - 1 : prevIndex - 1
        );
      } else if (currentKey === "arrowright") {
        setFocusedIndex((prevIndex) =>
          prevIndex === 3 - 1 ? 0 : prevIndex + 1
        );
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isopen]);

  useEffect(() => {
    if ((focusedIndex === 0) && (SaveButton)) {
      SaveButton.current.focus();
    } else if ((focusedIndex === 1) && DontSaveButton) {
      DontSaveButton.current.focus();
    } else if ((focusedIndex === 2) && CancelButton) {
      CancelButton.current.focus();
    };
  }, [focusedIndex]);

  const handlefocus = () => {
    SaveButton.current.focus();
  };

  useEffect(() => {
    setOpen(Open);
    setTimeout(handlefocus, 10);
    ;
  }, [Open]);

  const handleSave = () => {
    handleConfirm("save");
  };
  const handleDontSave = () => {
    handleConfirm("dontsave");
  };
  const handleCancel = () => {
    handleConfirm("cancel");
  };

  return (
    <dialog open={isopen} className="text-white bg-black border border-zinc-600 rounded-xl w-[30%] z-50 top-1/4">
        <div className="py-3 flex flex-row justify-around w-full">
        <div className="flex items-center w-max">
          <MessageCircleWarning size={60} color="#fde047"/>
        </div>
        <div className="flex flex-col items-center gap-2 text-xl">
          <p>Would You Like to Save <span className="text-pink-400">{FileName}</span></p>
          <div className="flex flex-row gap-4">
            <button onClick={handleSave} ref={SaveButton} className="border border-zinc-600 py-1 px-3 rounded-lg hover:bg-zinc-500">Save</button>
            <button onClick={handleDontSave} ref={DontSaveButton} className="border border-zinc-600 py-1 px-3 rounded-lg hover:bg-zinc-500">Don't Save</button>
            <button onClick={handleCancel} ref={CancelButton} className="border border-zinc-600 py-1 px-3 rounded-lg hover:bg-zinc-500">Cancel</button>
          </div>
        </div>
        </div>
    </dialog>
  )
}