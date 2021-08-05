const toolbarOptions = [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction

    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [
        {
            color: [
                "#000000",
                "#e60000",
                "#ff9900",
                "#ffff00",
                "#008a00",
                "#0066cc",
                "#9933ff",
                "#ffffff",
                "#facccc",
                "#ffebcc",
                "#ffffcc",
                "#cce8cc",
                "#cce0f5",
                "#ebd6ff",
                "#bbbbbb",
                "#f06666",
                "#ffc266",
                "#ffff66",
                "#66b966",
                "#66a3e0",
                "#c285ff",
                "#888888",
                "#a10000",
                "#b26b00",
                "#b2b200",
                "#006100",
                "#0047b2",
                "#6b24b2",
                "#444444",
                "#5c0000",
                "#663d00",
                "#666600",
                "#003700",
                "#002966",
                "#3d1466",
                "color-picker",
            ],
        },
        {
            background: [
                "#000000",
                "#e60000",
                "#ff9900",
                "#ffff00",
                "#008a00",
                "#0066cc",
                "#9933ff",
                "#ffffff",
                "#facccc",
                "#ffebcc",
                "#ffffcc",
                "#cce8cc",
                "#cce0f5",
                "#ebd6ff",
                "#bbbbbb",
                "#f06666",
                "#ffc266",
                "#ffff66",
                "#66b966",
                "#66a3e0",
                "#c285ff",
                "#888888",
                "#a10000",
                "#b26b00",
                "#b2b200",
                "#006100",
                "#0047b2",
                "#6b24b2",
                "#444444",
                "#5c0000",
                "#663d00",
                "#666600",
                "#003700",
                "#002966",
                "#3d1466",
                "color-picker-bg",
            ],
        },
    ],
    [{ font: [] }],
    [{ align: [] }],

    ["image", "video"],

    ["clean"], // remove formatting button
];

function showColorPicker(value, editor) {
    if (value === 'color-picker') {
        let picker = document.getElementById('color-picker');
        if (!picker) {
            picker = document.createElement('input');
            picker.id = 'color-picker';
            picker.type = 'color';
            picker.style.display = 'none';
            picker.value = '#FF0000';
            document.body.appendChild(picker);
            picker.addEventListener('change', function () {
                editor.format('color', picker.value);
            }, false);
        }
        picker.click();
    }
    else if (value === 'color-picker-bg') {
        let bgPicker = document.getElementById('color-picker-bg');
        if (!bgPicker) {
            bgPicker = document.createElement('input');
            bgPicker.id = 'color-picker-bg';
            bgPicker.type = 'color';
            bgPicker.style.display = 'none';
            bgPicker.value = '#FF0000';
            document.body.appendChild(bgPicker);
            bgPicker.addEventListener('change', function () {
                editor.format('background', bgPicker.value);
            }, false);
        }
        bgPicker.click();
    }
    else {
        editor.format('color', value);
    }
}

module.exports = {toolbarOptions, showColorPicker}