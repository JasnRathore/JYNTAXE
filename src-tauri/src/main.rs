// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::string;
use std::{collections::HashMap, fs};
use std::sync::Mutex;
use serde::{Serialize, Deserialize};

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

//#[derive(Serialize, Deserialize, Debug)]
//struct FileChange {
//    line: usize,
//    content: String
//}
#[derive(Serialize, Deserialize, Debug)]
struct TempOpenFile {
    status: bool,
    file: File,
}


struct GlobalState {
    files: Mutex<HashMap<String, File>>,
    recents: Mutex<Vec<String>>
}

fn read_file(path: &str) -> String {
    let content = fs::read_to_string(path).expect("failed to read file");
    return content;
}

#[tauri::command]
fn open_file(state: tauri::State<GlobalState>, path: String, name: String, language: String, icon: String) -> String {
    let content = read_file(&path);
    //let mut current_state = state;
    let mut files = state.files.lock().unwrap();
    //let parts: Vec<String> = (&content).lines().map(|s| s.to_string()).collect();
    files.insert(path.clone(), File {
        name: name,
        content: content.clone(),
        modified: false,
        language: language,
        icon: icon,
    });

    let mut recents = state.recents.lock().unwrap();
    recents.push(path);
    return content
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
    recents.push(path);
    return "".to_owned();
}

#[tauri::command]
fn close_file(state: tauri::State<GlobalState>, path: String) -> bool {
    let mut files = state.files.lock().unwrap();
    let _ = match files.remove(&path) {
        Some(_) => return true,
        None => return false
    };
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
    //match files.get_mut(&path) {
    //    Some(file) => {
    //        file.modified = false
    //    },
    //    None => {
    //        return false;
    //    }
    //};
    match fs::write(path, file.content.clone()) {
        Ok(_) => return true,
        Err(_) => return false
    }
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
fn get_open_files(state: tauri::State<GlobalState>) -> HashMap<String, String> {
    let files = state.files.lock().unwrap();
    let mut data: HashMap<String, String> = HashMap::new();
    for file in files.keys() {
        let name: String = (files[file].name).clone();
        data.insert(file.to_string(), name);
        //println!("{:?}", files[file].name);
    }
    return data;
}

fn main() {

    let temp_files: HashMap<String, File> = HashMap::new();
    let  state = GlobalState { files: Mutex::new(temp_files), recents: Mutex::new(Vec::new()) };

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
            new_file
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

