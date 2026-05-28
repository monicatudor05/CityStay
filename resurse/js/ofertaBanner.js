let timerInterval = null

async function incarcaOferta() {
    let resp = await fetch("/oferta-curenta")
    let oferta = await resp.json()

    if (!oferta) return

    let finalizare = new Date(oferta["data-finalizare"])
    let acum = new Date()
    if (acum >= finalizare) return

    let banner = document.getElementById("oferta-banner")
    banner.style.display = "flex"
    document.getElementById("oferta-categ").innerHTML = oferta.categorie
    document.getElementById("oferta-reducere").innerHTML = oferta.reducere

    if (timerInterval) clearInterval(timerInterval)

    timerInterval = setInterval(async function () {
        let acum = new Date()
        let diff = finalizare - acum

        if (diff <= 0) {
            clearInterval(timerInterval)
            banner.style.display = "none"
            await incarcaOferta()
            return
        }

        let ore = Math.floor(diff / 3600000)
        let minute = Math.floor((diff % 3600000) / 60000)
        let secunde = Math.floor((diff % 60000) / 1000)

        let timerEl = document.getElementById("oferta-timer")
        timerEl.innerHTML = `⏱ ${ore}h ${minute}m ${secunde}s`

        if (diff <= 10000) {
            timerEl.classList.add("urgent")
        } else {
            timerEl.classList.remove("urgent")
        }

    }, 1000)
}

incarcaOferta()