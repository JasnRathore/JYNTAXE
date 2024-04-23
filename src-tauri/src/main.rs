// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::{collections::{HashMap, VecDeque}, fs, io::{BufReader, Write}};
use std::path::Path;
use std::sync::Mutex;
use serde::{Serialize, Deserialize};
use std::process::Command;
use std::env;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct File {
    name: String,
    content: String,
    modified: bool,
    language: String,
    icon: String,
}

impl File {
    fn new() -> Self {
        Self {
            name:  String::from(""),
            content:  String::from(""),
            modified: false,
            language:  String::from(""),
            icon:  String::from(""),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct TempOpenFile {
    status: bool,
    file: File,
}

#[derive(Serialize, Deserialize, Debug)]
struct OpenFileForMultipleFiles {
    path: String,
    name: String
}

struct GlobalState {
    files: Mutex<HashMap<String, File>>,
    recents: Mutex<VecDeque<String>>,
    folder: Mutex<String>,
    folder_files: Mutex<Vec<String>>
}

#[derive(Serialize, Deserialize, Debug)]
struct StateOpenFile {
    name: String,
    language: String,
    icon: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct StateFile {
    files: HashMap<String, StateOpenFile>,
    recents: VecDeque<String>,
    folder: String
}

fn read_state_file() -> Result<StateFile, String> {
    let file = match fs::File::open("jyntaxe.json") {
        Ok(result) => result,
        Err(err) => return Err(format!("{:?}", err))
    };
    let reader = BufReader::new(file);
    let data: StateFile = match serde_json::from_reader(reader) {
        Ok(result) => result,
        Err(err) => return Err(format!("{:?}", err))
    };
    return Ok(data);
}

fn read_file(path: &str) -> String {
    let content = fs::read_to_string(path).expect("failed to read file");
    return content;
}

fn add_to_recent(item: String, recent_items: &mut VecDeque<String>, item_map: &HashMap<String, File>) {
    if item_map.contains_key(&item) {
        // Find and remove the item from the list
        if let Some(index) = recent_items.iter().position(|x| x == &item) {
            recent_items.remove(index);
        }
    }
    recent_items.push_front(item);
}

fn process_subdirectory(directory: &Path, base_dir: &Path, list: &mut Vec<String>) {
    if let Ok(entries) = fs::read_dir(directory) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_file() {
                    list.push(path.display().to_string());
                } else if path.is_dir() {
                    process_subdirectory(&path, base_dir, list);
                }
            }
        }
    }
}

fn process_directory(directory: &str) -> Result<Vec<String>, ()>{
    let mut list: Vec<String> = Vec::new();
    if let Ok(entries) = fs::read_dir(directory) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_file() {
                     list.push(path.display().to_string());
                } else if path.is_dir() {
                    process_subdirectory(&path, &Path::new(directory), &mut list);
                }
            }
        }
        return Ok(list)
    } else {
        return Err(())
    }
}


fn search_folder_files(list: Vec<String>, item: String) -> Vec<String>{
    use rust_fuzzy_search::fuzzy_search_best_n;
    let n : usize = 20;
    let temp = &list.iter().map(String::as_ref).collect::<Vec<&str>>();
    let result: Vec<(&str, f32)> = fuzzy_search_best_n(&item,temp, n);
    let data: Vec<String> = result.iter().filter(|(_s, v)| *v > 0.0).map(|(s,_)| s.to_string()).collect();
    return data;
}

#[tauri::command]
fn open_file(state: tauri::State<GlobalState>, path: String, name: String, language: String, icon: String) -> String {
    let mut files = state.files.lock().unwrap();

    let _  = match files.get(&path) {
        Some(data) => {
            let mut recents = state.recents.lock().unwrap();
            add_to_recent(path, &mut recents, &files);
            return data.content.clone()
        },
        None => ()
    };

    let content = read_file(&path);

    files.insert(path.clone(), File {
        name: name,
        content: content.clone(),
        modified: false,
        language: language,
        icon: icon,
    });

    let mut recents = state.recents.lock().unwrap();
    add_to_recent(path, &mut recents, &mut files);

    return content
}

#[tauri::command]
fn open_folder(state: tauri::State<GlobalState>, path: String) -> bool {
    let mut folder = state.folder.lock().unwrap();

    if *folder == path {
        return true;
    }

    let result = match process_directory(&path) {
        Ok(data) => data,
        Err(_) => return false
    };

    *folder = path;
    let mut folder_files = state.folder_files.lock().unwrap();
    *folder_files = result;
    return true
}

#[tauri::command]
fn get_folder(state: tauri::State<GlobalState>) -> String {
    let folder = state.folder.lock().unwrap();
    return folder.clone()
}

#[tauri::command]
fn new_file(state: tauri::State<GlobalState>, path: String, name: String, language: String, icon: String) -> String {
    let mut files = state.files.lock().unwrap();
    files.insert(path.clone(), File {
        name: name,
        content: "".to_owned(),
        modified: false,
        language: language,
        icon: icon,
    });
    let mut recents = state.recents.lock().unwrap();
    add_to_recent(path, &mut recents, &mut files);

    return "".to_owned();
}

#[tauri::command]
fn close_file(state: tauri::State<GlobalState>, path: String) -> bool {
    let mut files = state.files.lock().unwrap();
    let _ = match files.remove(&path) {
        Some(data) => data,
        None => return false
    };

    let mut recents = state.recents.lock().unwrap();
    match recents.pop_front() {
        Some(_) => {

            return true
        },
        None => return false
    }

}
#[tauri::command]
fn  switch_file(state: tauri::State<GlobalState>, path: String) {
    let mut files = state.files.lock().unwrap();
    let mut recents = state.recents.lock().unwrap();
    add_to_recent(path, &mut recents, &mut files);
}

#[tauri::command]
fn get_recent_file(state: tauri::State<GlobalState>) -> String {
    let recents = state.recents.lock().unwrap();
    let recent_file = recents.front().unwrap().to_owned();
    return recent_file
}

#[tauri::command]
fn get_open_file(state: tauri::State<GlobalState>, path: String) -> TempOpenFile {
    let files = state.files.lock().unwrap();
    let temp = match files.get(&path) {
        Some(data) => TempOpenFile {
            status: true,
            file: data.clone()
        },
        None => TempOpenFile {
            status: false,
            file: File::new()
        }
    };
    return temp
}

#[tauri::command]
fn is_open_files_empty(state: tauri::State<GlobalState>) -> bool {
    let files = state.files.lock().unwrap();
    let status = files.is_empty();
    return status
}

#[tauri::command]
fn save_file(state: tauri::State<GlobalState>, path: String) -> bool {
    let mut files = state.files.lock().unwrap();
    let file = match files.get_mut(&path) {
        Some(data) => data,
        None => {
            return false
        }
    };
    file.modified = false;
    match fs::write(path, file.content.clone()) {
        Ok(_) => return true,
        Err(_) => return false
    }
}

#[tauri::command]
fn quick_open_search(state: tauri::State<GlobalState>, query: String) -> Vec<String> {
    let folder_files = state.folder_files.lock().unwrap();
    return search_folder_files(folder_files.to_vec(),query);
}

#[tauri::command]
fn update_open_file(state: tauri::State<GlobalState>, path: String, content: String) {
    let mut files = state.files.lock().unwrap();
    match files.get_mut(&path) {
        Some(entry) => {
            entry.content = content;
            entry.modified = true;
        },
        None => {}
    }
}

#[tauri::command]
fn get_open_files(state: tauri::State<GlobalState>) -> Vec<OpenFileForMultipleFiles> {
    let files = state.files.lock().unwrap();
    let recents = state.recents.lock().unwrap();
    let mut data: Vec<OpenFileForMultipleFiles> = Vec::new();
    for file_path in recents.iter() {
        let file = files.get(file_path).unwrap();
        let temp = OpenFileForMultipleFiles {
            path: (file_path.clone()).to_string(),
            name: file.name.clone()
        };
        data.push(temp)
    }
    return data;
}

#[tauri::command]
 fn open_new_window() -> bool {
    let mut command = Command::new(r".\JYNTAXE.exe");
    match command.spawn() {
        Ok(_) => return true,
        Err(_) => return false,
    }
}
#[tauri::command]
fn save_state_to_file(state: tauri::State<GlobalState>) {
    let mut jyantaxe_file = fs::File::create("jyntaxe.json").unwrap();

    let state_files = state.files.lock().unwrap();
    let recent_state_files = state.recents.lock().unwrap();
    let state_folder = state.folder.lock().unwrap();

    let mut temp_open_files: HashMap<String, StateOpenFile>  = HashMap::new();
    for (file_path, file_data) in state_files.iter() {
        temp_open_files.insert(file_path.to_string(), StateOpenFile {
            name: file_data.name.to_string(),
            language: file_data.language.to_string(),
            icon: file_data.icon.to_string()
        });
    }

    let data = StateFile {
        files: temp_open_files,
        recents: recent_state_files.clone(),
        folder: state_folder.clone()
    };

    let json_data = serde_json::to_string_pretty(&data).unwrap();
    jyantaxe_file.write_all(json_data.as_bytes()).unwrap();

}

fn main() {
    let args: Vec<String> = env::args().collect();

    let mut state = GlobalState {
        files: Mutex::new(HashMap::new()),
        recents: Mutex::new(VecDeque::new()),
        folder: Mutex::new(String::new()),
        folder_files: Mutex::new(Vec::new()),
    };

    if let Some(_arg) = args.get(1) {

    } else {
        let _  = match read_state_file() {
            Ok(state_file) => {
                let mut files: HashMap<String, File> = HashMap::new();
                for (filepath , filedata) in state_file.files {
                    let file_content = read_file(&filepath);
                    files.insert(filepath, File { name: filedata.name, content: file_content, modified: false, language: filedata.language, icon: filedata.icon });
                }
                let mut folder_files: Vec<String> = Vec::new();
                if state_file.folder != "".to_owned() {
                    folder_files = process_directory(&state_file.folder).unwrap();
                }

                state = GlobalState {
                    files: Mutex::new(files),
                    recents: Mutex::new(state_file.recents),
                    folder: Mutex::new(state_file.folder),
                    folder_files: Mutex::new(folder_files),
                }
            }
            Err(err) => println!("{}",err)
        };
    }

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            open_file,
            save_file,
            get_open_files,
            update_open_file,
            close_file,
            get_open_file,
            is_open_files_empty,
            new_file,
            open_new_window,
            switch_file,
            get_recent_file,
            open_folder,
            get_folder,
            quick_open_search,
            save_state_to_file
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

