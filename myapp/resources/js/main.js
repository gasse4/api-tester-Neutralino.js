// This is just a sample app. You can structure your Neutralinojs app code as you wish.
// This example app is written with vanilla JavaScript and HTML.
// Feel free to use any frontend framework you like :)
// See more details: https://neutralino.js.org/docs/how-to/use-a-frontend-library

/*
    Function to display information about the Neutralino app.
    This function updates the content of the 'info' element in the HTML
    with details regarding the running Neutralino application, including
    its ID, port, operating system, and version information.
*/


/*
    Function to handle click events on the tray menu items.
    This function performs different actions based on the clicked item's ID,
    such as displaying version information or exiting the application.
*/

let lastResponse = null;
let lastTime = null;



function onTrayMenuItemClicked(event) {
    switch (event.detail.id) {
        case "VERSION":
            // Display version information
            Neutralino.os.showMessageBox("Version information",
                `Neutralinojs server: v${NL_VERSION} | Neutralinojs client: v${NL_CVERSION}`);
            break;
        case "QUIT":
            // Exit the application
            Neutralino.app.exit();
            break;
    }
}

/*
    Function to handle the window close event by gracefully exiting the Neutralino application.
*/
function onWindowClose() {
    Neutralino.app.exit();
}

// Initialize Neutralino
Neutralino.init();


async function save() {

    if (!lastResponse) {
        Neutralino.os.showMessageBox(
            "Error",
            "Send a request first"
        );
        return;
    }

    let response = document.getElementById("response").value;

    let content =
        response + "Status: " + lastResponse.status + " | " + lastTime + " ms\n\n" +

        "\n----------------------\n";
    try {

        await Neutralino.filesystem.getStats("response.txt");

        await Neutralino.filesystem.appendFile(
            "response.txt",
            content
        );

    } catch {

        await Neutralino.filesystem.writeFile(
            "response.txt",
            content
        );

    }

    Neutralino.os.showMessageBox(
        "Saved",
        "Response saved successfully"
    );
}

async function sendRequest() {

    let url = document.getElementById("url").value;
    let method = document.getElementById("method").value;
    let body = document.getElementById("body").value;

    try {

        let options = {
            method: method,
            headers: {
                "Content-Type": "application/json"
            }
        };

        if (method === "POST" || method === "PUT" || method === "PATCH") {
            options.body = body;
        }

        let start = performance.now();

        let res = await fetch(url, options);


        let end = performance.now();
        let time = Math.round(end - start);

        lastResponse = res;
        lastTime = time;

        document.getElementById("status").innerText =
            "Status: " + res.status + " | " + time + " ms";

        let text = await res.text();


        try {

            let json = JSON.parse(text);

            document.getElementById("response").value =
                JSON.stringify(json, null, 2);

        }
        catch {

            document.getElementById("response").value = text;

        }

    } catch (e) {

        document.getElementById("response").value =
            "Error: " + e.message;

    }

}


// Register event listeners
Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
Neutralino.events.on("windowClose", onWindowClose);

