import { invoke } from "@tauri-apps/api/tauri";
import { open, save } from "@tauri-apps/api/dialog"

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

export async function quickOpenFile(path) {
  if (path) {
    let temp = path.split("\\");
    const newFileName = temp[temp.length-1];
    temp = newFileName.split(".");
    const [newFileType, newFileIcon] = getFileTypeIcon(temp[temp.length-1]);
    const content = await invoke("open_file", { path: path, name: newFileName, language: newFileType, icon: newFileIcon });
    return [ path, newFileName, newFileType, newFileIcon ,content ]
  }
  return []
}

export async function newFile() {
  const path = await save({
    filters: [{
      name: 'All Files',
      extensions: ['*']
  }]});
  if (path) {
    let temp = path.split("\\");
    const newFileName = temp[temp.length-1];
    temp = newFileName.split(".");
    const [newFileType, newFileIcon] = getFileTypeIcon(temp[temp.length-1]);
    const content = await invoke("new_file", { path: path, name: newFileName, language: newFileType, icon: newFileIcon });
    return [ path, newFileName, newFileType, newFileIcon ,content ]
  };
  return []
}

export async function openFolder() {
    const selected = await open({
      multiple: false,
      directory: true,
      filters: [{ name: 'All Directories', extensions: ['*'] }]
    });
    if (selected) {
      const status = await invoke("open_folder", { path:selected });
      return {
        status: status,
        folderPath: selected
      }
    }
    return {
      status: false,
      folderPath: selected
    }
}
export async function getFolder() {
  const folder = await invoke("get_folder");
  return folder
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
export async function openNewWindow() {
  const status = await invoke("open_new_window");
  return status
}

export async function switchFile(path) {
  await invoke("switch_file", { path: path });
}

export async function getRecentFile() {
  const path = await invoke("get_recent_file");
  return path
}

export async function quickOpenSearch(query) {
  const results = await invoke("quick_open_search", { query:query });
  return results
}

export async function saveStateToFile() {
  await invoke("save_state_to_file");
}

function getFileTypeIcon(input){
    switch(input){
      case "txt":
        return["plaintext","text"]
      case "c":
        return ["c","c"]
      case "clj":
        return ["clojure","clojure"]
      case "cpp":
        return ["cpp","cpp"]
      case "cs":
        return ["csharp","csharp"]
      case "css":
          return ["css","css"]
      case "html":
          return ["html","html"]
      case "js":
        return ["javascript", "js"]
      case "jsx":
        return ["javascript", "react"]
      case "py":
        return ["python","python"]
      case "rs":
        return ["rust","rust"]
      case "ts":
        return ["typecript", "typecript"]
      case "tsx":
        return ["typescript", "reactts"]
      default:
        return["plaintext","text"]
    }
}