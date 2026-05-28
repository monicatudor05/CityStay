const fs = require("fs")
const path = require("path")

const T = 2 * 60 * 1000 //2min

const T2 = 5 * 60 * 1000 //5 min

const categorii = ["apartament", "penthouse", "mansion", "house"]
const reduceri = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
const caleJson = path.join(__dirname, "../../resurse/json/oferte.json")
function genereazaOferta() {
    let oferte = JSON.parse(fs.readFileSync(caleJson)).oferte

    let acum = new Date()
    oferte = oferte.filter(o => {
        let finalizare = new Date(o["data-finalizare"])
        return (acum - finalizare) < T2
    })

    let ultimaCateg = oferte.length > 0 ? oferte[0].categorie : ""
    let categDisponibile = categorii.filter(c => c != ultimaCateg)
    let categNoua = categDisponibile[Math.floor(Math.random() * categDisponibile.length
    )]

    let reducere = reduceri[Math.floor(Math.random() * reduceri.length)]

    let incepere = new Date()
    let finalizare = new Date(incepere.getTime() + T)

    let ofertaNoua = {
        "categorie": categNoua,
        "reducere": reducere,
        "data-incepere": incepere.toISOString(),
        "data-finalizare": finalizare.toISOString()
    }
    //o pune laa inceputul arrayului
    oferte.unshift(ofertaNoua)

    fs.writeFileSync(caleJson, JSON.stringify({ oferte }, null, 2))
    console.log("New offer generated")
}
genereazaOferta()
setInterval(genereazaOferta, T)