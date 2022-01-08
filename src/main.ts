
// on paste: detect clipboard file type. if image -> set img src, match canvas dimensions
// on inputs: re-render canvas grid

const img = document.getElementsByTagName("img")[0];
const canvas = document.getElementsByTagName("canvas")[0];
const ctx = canvas.getContext("2d");

const upload = <HTMLInputElement>document.getElementById("upload");
upload.addEventListener("change", function() {
    if (this.files) {
        const file = this.files[0];
        if (file) {
            imageFromFile(file);
        }
    }
})


img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;

    const width = <HTMLInputElement>document.querySelector(`#controls div[data-prop='image'] input[data-field='width']`);
    const height = <HTMLInputElement>document.querySelector(`#controls div[data-prop='image'] input[data-field='height']`);

    width.value = img.width.toString();
    height.value = img.height.toString();

    settings.count.columns = canvas.width / settings.size.x;
    settings.count.rows = canvas.height / settings.size.y;

    syncInputs();
    render();
}


const settings = {
    offset: {
        x: 0,
        y: 0
    },
    size: {
        x: 32,
        y: 32
    },
    count: {
        rows: 0,
        columns: 0
    },
    style: {
        stroke: "#00FFFF"
    }
}



function syncInputs() {
    for (let prop in settings) {
        // @ts-ignore
        let p = settings[prop];
        for (let field in p) {
            const input = <HTMLInputElement>document.querySelector(`#controls div[data-prop='${prop}'] input[data-field='${field}']`);
            input.value = p[field];
        }
    }
}

const inputs = (<NodeListOf<HTMLInputElement>>document.querySelectorAll("#controls input:not(readonly):not([type='file'])"));
inputs.forEach(input => {
    const prop = input.parentElement.getAttribute("data-prop");
    const field = input.getAttribute("data-field");

    input.oninput = function() {

        let val = input.value;
        
        if (prop == "offset" || prop == "size" || prop == "count") {
            // @ts-ignore
            val = Number(input.value);

            // margin can be 0, size cannot
            if (prop == "size" && !val) {
                // @ts-ignore
                val = 1;
            }
        }



        // @ts-ignore
        settings[prop][field] = val;

        if (prop == "count") {
            if (field == "rows") {
                settings.size.y = canvas.height / settings.count.rows;
            }
            else if (field == "columns") {
                settings.size.x = canvas.width / settings.count.columns;
            }
        }
        else if (prop == "size") {
            if (field == "x") {
                settings.count.columns = canvas.width / settings.size.x;
            }
            else if (field == "columns") {
                settings.count.rows = canvas.height / settings.size.y;
            }
        }

        syncInputs();

        render();
    }

})

/** read file using file reader. when finished, set img src to reader result */
function imageFromFile(file:File) {
    var reader = new FileReader();
    reader.onload = function (event) {
        img.src = event.target.result.toString();
    };
    reader.readAsDataURL(file);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = settings.style.stroke;


    for (let x = settings.offset.x; x < canvas.width; x += settings.size.x) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        ctx.closePath();
    }

    for (let y = settings.offset.y; y < canvas.height;  y += settings.size.y) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        ctx.closePath();
    }


    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = settings.style.stroke;
    let i=0;
    for (let y = settings.offset.y; y < canvas.height;  y += settings.size.y) {
         for (let x = settings.offset.x; x < canvas.width; x += settings.size.x) {
            ctx.fillText((i++).toString(), x + settings.size.x / 2, y + settings.size.y / 2);
        }
    }


}

document.onpaste = function (event) {
    console.log("---- PASTE ----");

    var items = event.clipboardData.items;
    //console.log(JSON.stringify(items)); // might give you mime types
    for (var index in items) {
        var item = items[index];

        if (item.kind === 'file' && item.type.indexOf("image") == 0) {
            imageFromFile(item.getAsFile());
            return;
        }
        if (item.kind == "string") {
            item.getAsString(val => img.src = val);
            return;
        }
    }
}