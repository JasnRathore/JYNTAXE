import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog"

export async function openFile() {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [{ name: 'All Files', extensions: ['*'] }]
    });
    if (selected) {
      let temp = selected.split("\\");
      const newFileName = temp[temp.length-1];
      temp = newFileName.split(".");
      const [newFileType, newFileIcon] = getFileTypeIcon(temp[temp.length-1]);
      const content = await invoke("open_file", { path: selected, name: newFileName, language: newFileType, icon: newFileIcon });
      return [ selected, newFileName, newFileType, newFileIcon ,content ]
    }
    return []
  }

export async function openFolder() {
    const selected = await open({
      multiple: false,
      directory: true,
      filters: [{ name: 'All Directories', extensions: ['*'] }]
    });
    if (selected) {
      console.log(selected)
    }
}

export async function update_open_file(path, changes) {
  await invoke("update_open_file", { path: path, content: changes });
}

export async function saveFile(path) {
  const status = await invoke("save_file", { path: path });
  return status
}

export async function getOpenFiles() {
  const data = await invoke("get_open_files");
  return data
}

export async function getOpenFile(path) {
  const data = await invoke("get_open_file", { path: path });
  return data
}

export async function closeFile(path) {
  const status = await invoke("close_file", { path: path });
  return status
}

export async function isOpenFilesEmpty() {
  const status = await invoke("is_open_files_empty");
  return status
}

function getFileTypeIcon(input){
    switch(input){
      case "rs":
        return ["rust","rust"];
      case "js":
        return ["javascript", "js"];
      case "jsx":
        return ["javascript", "react"];
      case "ts":
        return ["typecript", "typecript"];
      case "tsx":
        return ["typescript", "reactts"];
      case "py":
        return ["python","python"]
    }
}