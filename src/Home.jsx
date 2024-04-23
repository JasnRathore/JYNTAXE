import { useEffect } from "react"

export default function Home({folderName = ""}) {
    useEffect(() => {
    },[folderName]);
    return (
        <div className="flex flex-col w-full h-full text-zinc-400 items-center justify-center font-Iosevka gap-20 text-lg">
            <p className="text-2xl ">JYNTAXE<span className="ml-2">v0.0.1</span></p>
            { folderName ? <p className="text-lg ">Current Folder:<span className="ml-2">{folderName}</span></p> : "" }
            <div className="flex flex-col gap-4 w-1/4 items-start ">
                <p className="flex flex-row items-center justify-between w-full">
                    <span className="mr-4">All Commands:</span>
                    <span className="flex flex-row gap-1">
                        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">Ctrl</span>+
                        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">Shift</span>+
                        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">p</span>
                    </span>
                </p>
                <p className="flex flex-row items-center justify-between w-full">
                <span className="mr-4">Close Application: </span>
                    <span className="flex flex-row gap-1">
                        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">Ctrl</span>+
                        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">q</span>
                    </span>
                </p>
                <p className="flex flex-row items-center justify-between w-full">
                <span className="mr-4">Open File:</span>
                    <span className="flex flex-row gap-1">
                        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">Ctrl</span>+
                        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">o</span>
                    </span>
                </p>
                <p className="flex flex-row items-center justify-between w-full">
                    <span className="mr-4">Open Folder:</span>
                    <span className="flex flex-row gap-1">
                        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">Ctrl</span>+
                        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">k</span>+
                        <span className="bg-zinc-900 py-[0.5px] px-1 rounded-md border-x border-t border-b-2 border-zinc-700">o</span>
                    </span>
                </p>
            </div>
        </div>
    )
}