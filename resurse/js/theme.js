document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("theme") !== "light") {
        document.body.classList.add("dark-theme")
        let sw = document.getElementById("theme-switch")
        if (sw) {
            sw.checked = true
            document.getElementById("theme-icon").className = "bi bi-moon"
        }
    } else {
        document.body.classList.add("light-theme")
    }

    let themeSwitch = document.getElementById("theme-switch")
    if (themeSwitch) {
        themeSwitch.onclick = function () {
            if (this.checked) {
                document.body.classList.remove("light-theme")
                document.body.classList.add("dark-theme")
                document.getElementById("theme-icon").className = "bi bi-sun"
                localStorage.setItem("theme", "dark")
            } else {
                document.body.classList.remove("dark-theme")
                document.body.classList.add("light-theme")
                document.getElementById("theme-icon").className = "bi bi-sun"
                localStorage.setItem("theme", "light")
            }
        }
    }
})