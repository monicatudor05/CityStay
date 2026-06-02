//deleteCookie(nume)
//deleteAllCookies()


function setCookie(name, value, zile) {

    let data = new Date();

    data.setTime(data.getTime() + (zile * 24 * 60 * 60 * 1000)); //milisec


    document.cookie = name + "=" + value + ";expires=" + data.toUTCString() + ";path=/";
}

function getCookie(name) {

    let cookies = document.cookie;
    let vCookies = cookies.split(";")
    let goodCookie = vCookies.find((c) => c.trim().split("=")[0] == name)

    if (goodCookie) {
        return goodCookie.split("=")[1];

    }

    return "";
}

function deleteCookie(name) {

    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
}

function deleteAllCookies() {
    let cookies = document.cookie.split(";");

    for (let cookie of cookies) {
        let name = cookie.trim().split("=")[0];
        deleteCookie(name);
    }
}


function acceptCookie() {

    setCookie("cookieAcceptat", "true", 1);
    document.getElementById("banner-div").style.display = "none";
}


window.addEventListener("load", function () {
    let c = getCookie("cookieAcceptat");

    // if (c) {
    //     document.getElementById("banner-div").style.display = "none";
    // }

})

