import {  useRef } from 'react';
import Editor from '@monaco-editor/react';
import { update_open_file } from './FileOperations';
import "./App.css";
//D:\proj\codeeditor\lsp\rust-analyzer.exe
const ModificationHandler = async (content, path,) => {
    update_open_file(path, content);
}

function CodeEditor({ data, type, path , onChange}) {
    const editorRef = useRef(null);

    const handleChange = (data) => {
        ModificationHandler(data, path);
        onChange(data);
    }

    const handleEditorMount = (editor, monaco) => {
        editorRef.current = editor;
    };
    return (
        <Editor
        language={ type }
        //defaultValue={ value }
        value= {data}
        path={path}
        theme="hc-black"
        options={{
            lineNumbers: "relative",
            fontFamily: "Iosevka",
            letterSpacing: 1,
            fontSize: "20px",
            guides: {
            indentation: false
            },
        }}
        onMount={handleEditorMount}
        onChange={(val) => handleChange(val)}
        />
        )
}

export default CodeEditor