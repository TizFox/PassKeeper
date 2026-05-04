let globalData = {};
let modIndex = null;
let delIndex = null;
let key = "";

window.onload = (event) => {};

// ---- TODO ----
//  => Fix the position of the alerts when not full screen (not fixed at the bottom)
// --------------

// DEBUG FUNCTIONS
function clearStorage() {
    localStorage.clear();
    updateAndFind();
}
function fillData() {
    document.getElementById("name").value = "test";
    document.getElementById("user").value = "test";
    document.getElementById("email").value = "test";
    document.getElementById("password").value = "test";
    document.getElementById("other").value = "test";
}

// CRYPT FUNCTIONS
const crypt = (text, pass) => {
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
    const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = (code) =>
        textToChars(pass).reduce((a, b) => a ^ b, code);

    return text // encoded
        .split("")
        .map(textToChars)
        .map(applySaltToChar)
        .map(byteHex)
        .join("");
};
const uncrypt = (encoded, pass) => {
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
    const applySaltToChar = (code) =>
        textToChars(pass).reduce((a, b) => a ^ b, code);
    return encoded // text
        .match(/.{1,2}/g)
        .map((hex) => parseInt(hex, 16))
        .map(applySaltToChar)
        .map((charCode) => String.fromCharCode(charCode))
        .join("");
};
function encrypt(obj) {
    // Return a "string"
    return crypt(JSON.stringify(obj), key);
}
function decrypt(string) {
    // Return a "object"
    try {
        return JSON.parse(uncrypt(string, key));
    } catch (e) {
        return null;
    }
}
function setKey() {
    let keyInput = document.getElementById("key");
    key = keyInput.value;
    if (key == "") {
        openAlert("dangerAlert", "ERROR => Missing Key", "", "SET IT");
        return;
    }
    keyInput.type = "password";
    keyInput.disabled = true;
    clearFind();
}
function resetKey() {
    let keyInput = document.getElementById("key");
    key = "";
    keyInput.value = "";
    keyInput.type = "text";
    keyInput.disabled = false;
    clearFind();
    clearData();
}

// UTILITY
function showDiv(id) {
    document.getElementById(id).style.display = "block";
}
function hideDiv(id) {
    document.getElementById(id).style.display = "none";
}
function generate(id) {
    let input = document.getElementById(id);
    let password = [];
    let letters = [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
    ];
    let numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let symbols = ["!", "#", "$", "%", "&", "(", ")", "*", "+"];

    // Add Letters
    for (let i = 0; i < 6; i++) {
        password.push(letters[Math.floor(Math.random() * letters.length)]);
    }
    // Add Numbers
    for (let i = 0; i < 4; i++) {
        password.push(numbers[Math.floor(Math.random() * numbers.length)]);
    }
    // Add Symbols
    for (let i = 0; i < 2; i++) {
        password.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }
    // Shuffle
    for (let i = 12 - 1; i >= 0; i--) {
        let j = Math.floor(Math.random() * 12);
        [password[i], password[j]] = [password[j], password[i]];
    }
    password = password.join("");
    input.value = password;
}
function objToString(data) {
    let string = "";
    for (let key of Object.keys(data)) {
        let info = data[key];
        if (info != "") {
            if (key == "other") {
                info = "<br>" + info.replace(/(?:\r\n|\r|\n)/g, "<br>");
            }
            string += `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${info}<br>`;
        }
    }
    return string;
}

// ALERTS FUNCTIONS
function openAlert(id, title, message, btn, funcName = null) {
    //closeAlert("successAlert");
    //closeAlert("warningAlert");
    //closeAlert("dangerAlert");
    closeAlert(id); // Non posso avere più di 1 alert per tipo
    let alert = document.getElementById(id);
    let func = `closeAlert('${id}')` + (funcName ? `;${funcName}()` : "");
    alert.innerHTML = `<h3>${title}</h3><p class"alertMessage">${message}</p><button type="button" class="btn btn-block btn-${id.replace("Alert", "")}" onclick="${func}">${btn}</button>`;
    if (funcName) {
        alert.innerHTML += `<button type="button" class="btn btn-block btn-dark" onclick="closeAlert('${id}')">Cancel</button>`;
    }
    showDiv(id);
}
function closeAlert(id) {
    let alert = document.getElementById(id);
    alert.innerHTML = "";
    hideDiv(id);
}

// INSERT FUNCTIONS
function getData() {
    if (key == "") {
        openAlert("dangerAlert", "ERROR => Missing Key", "", "SET IT");
        return;
    }

    let data = {
        name: document.getElementById("name").value,
        user: document.getElementById("user").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        other: document.getElementById("other").value,
    };
    if (
        data.name == "" ||
        (data.user == "" && data.email == "") ||
        data.password == ""
    ) {
        let string = `Insert:<br>`;
        string += data.name == "" ? `- Name<br>` : ``;
        string +=
            data.user == "" && data.email == "" ? `- User / Email<br>` : ``;
        string += data.password == "" ? `- Password<br>` : ``;
        openAlert("warningAlert", "Error => Empty Fields", string, "OK");
        return;
    }

    let string = "Account:<br>" + objToString(data) + "<br>Confirm?<br>";
    globalData = data;
    openAlert("successAlert", "Inserting", string, "Confirm", "add");
}
function clearData() {
    document.getElementById("name").value = "";
    document.getElementById("user").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    document.getElementById("other").value = "";
    globalData = {};
}
function add() {
    let data = globalData;
    clearData();

    let encryptedString = encrypt(data);
    let itemsArray = localStorage.getItem("data")
        ? JSON.parse(localStorage.getItem("data"))
        : [];
    itemsArray.push(encryptedString);
    localStorage.setItem("data", JSON.stringify(itemsArray));

    updateAndFind();
}

// FIND FUNCIONS
function updateAndFind(searching = false) {
    if (searching && key == "") {
        openAlert("dangerAlert", "ERROR => Missing Key", "", "SET IT");
        return;
    }
    let listHTML = document.getElementById("findList");
    listHTML.innerHTML = `<ul class="list-group list-group-horizontal">
                                <li class="list-group-item listItem main"><b>Name</b></li>
                                <li class="list-group-item listItem main"><b>User / Email</b></li>
                                <li class="list-group-item listItem main"><b>Actions</b></li>
                            </ul>`;
    let target = searching ? document.getElementById("searchName").value : "";

    let list = [];
    let completeList = localStorage.getItem("data")
        ? JSON.parse(localStorage.getItem("data"))
        : [];

    for (let i in completeList) {
        let obj = decrypt(completeList[i]);
        if (obj != null) {
            if (obj.name.toUpperCase().includes(target.toUpperCase())) {
                // If target == "" => true
                list.push([obj, i]);
            }
        }
    }

    if (key != "" && list.length == 0) {
        openAlert(
            "warningAlert",
            "Warn => No Account Found",
            "Try another Name",
            "Ok :(",
        );
        return;
    }

    for (let i in list) {
        let obj = list[i];
        listHTML.innerHTML += `<ul class="list-group list-group-horizontal">
                                  <li class="list-group-item listItem">${obj[0].name}</li>
                                  <li class="list-group-item listItem">${obj[0].user ? obj[0].user : obj[0].email}</li>
                                  <li class="list-group-item listItem">
                                    <button class="btn btn-info btn-sm" onclick="see('${obj[1]}')"><i class="fa-solid fa-eye"></i></button>
                                    <button class="btn btn-warning btn-sm" onclick="mod('${obj[1]}')"><i class="fa-solid fa-pen"></i></button>
                                    <button class="btn btn-danger btn-sm" onclick="del('${obj[1]}')"><i class="fa-solid fa-trash"></i></button>
                                  </li>
                                </ul>`;
    }
}
function clearFind() {
    document.getElementById("searchName").value = "";
    updateAndFind();
}
function see(index) {
    let list = localStorage.getItem("data")
        ? JSON.parse(localStorage.getItem("data"))
        : [];
    console.log(list[index]);
    let data = decrypt(list[index]);
    let string = "Account:<br>" + objToString(data);
    openAlert("successAlert", data.name, string, "OK");
}
function mod(index) {
    modIndex = index;
    let list = localStorage.getItem("data")
        ? JSON.parse(localStorage.getItem("data"))
        : [];
    let account = decrypt(list[index]);

    showDiv("modTableDiv");

    document.getElementById("newName").value = account.name;
    document.getElementById("newUser").value = account.user;
    document.getElementById("newEmail").value = account.email;
    document.getElementById("newPassword").value = account.password;
    document.getElementById("newOther").value = account.other;
}
function modifyData(confirm) {
    let list = localStorage.getItem("data")
        ? JSON.parse(localStorage.getItem("data"))
        : [];
    if (confirm && modIndex) {
        let newAccount = {
            name: document.getElementById("newName").value,
            user: document.getElementById("newUser").value,
            email: document.getElementById("newEmail").value,
            password: document.getElementById("newPassword").value,
            other: document.getElementById("newOther").value,
        };

        list[modIndex] = encrypt(newAccount);
        localStorage.setItem("data", JSON.stringify(list));
        updateAndFind();
    }
    modIndex = null;
    hideDiv("modTableDiv");
}
function del(index) {
    delIndex = index;
    let list = localStorage.getItem("data")
        ? JSON.parse(localStorage.getItem("data"))
        : [];
    let data = decrypt(list[index]);

    hideDiv("modTableDiv"); // If i delete an account, remove the modification table (if visible)

    let string = "Account:<br>" + objToString(data) + "<br>Confirm?<br>";
    openAlert("dangerAlert", "Deleting", string, "Confirm", "deleteData");
}
function deleteData() {
    if (delIndex) {
        let list = localStorage.getItem("data")
            ? JSON.parse(localStorage.getItem("data"))
            : [];
        list.splice(delIndex, 1);
        localStorage.setItem("data", JSON.stringify(list));
        updateAndFind();
    }
    modIndex = null;
}
