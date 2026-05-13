const express = require("express");
const path = require("path");
const fs = require("fs");
const sass = require("sass");
const sharp = require("sharp");

app = express();
app.set("view engine", "ejs")

obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup")
}


function initErori() {
    let continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");
    let erori = obGlobal.obErori = JSON.parse(continut)
    let err_default = erori.eroare_default
    err_default.imagine = path.join(erori.cale_baza, err_default.imagine)
    for (let eroare of erori.info_erori) {
        eroare.imagine = path.join(erori.cale_baza, eroare.imagine)
    }

}


function verificareErori() {
    const caleJson = path.join(__dirname, "resurse/json/erori.json");
    //bonus 1
    if (!fs.existsSync(caleJson)) {
        console.error(`Fisierul erori.json nu exista!`);
        process.exit();
    }

    //bonus 2
    const continutString = fs.readFileSync(caleJson).toString("utf-8");
    let erori = JSON.parse(continutString);
    if (!erori.info_erori) {
        console.error(`Proprietatea 'info_erori' nu exista in fisierul erori.json!`);
    }

    if (!erori.eroare_default) {
        console.error(`Proprietatea 'eroare_default'nu exista in fisierul erori.json!`);
    }

    if (!erori.cale_baza) {
        console.error(`Proprietatea 'cale_baza' nu exista in fisierul erori.json!`);
    }

    //bonus 3

    if (!erori.eroare_default.titlu) {
        console.error(`Proprietatea 'titlu' nu exista in obiectul 'eroare_default' din fisierul erori.json!`);
    }

    if (!erori.eroare_default.text) {
        console.error(`Proprietatea 'text' nu exista in obiectul 'eroare_default' din fisierul erori.json!`);
    }

    if (!erori.eroare_default.imagine) {
        console.error(`Proprietatea 'imagine' nu exista in obiectul 'eroare_default' din fisierul erori.json!`);
    }

    //bonus 4
    const caleFolder = path.join(__dirname, erori.cale_baza);

    if (!fs.existsSync(caleFolder)) {
        console.error(`Nu este specificat nicun folder in cale_baza`);

    }

    //bonus 5
    const caleImgDefault = path.join(__dirname, erori.cale_baza, erori.eroare_default.imagine);
    if (!fs.existsSync(caleImgDefault)) {
        console.error(`Imaginea pentru eroare_default nu exita`);
    }

    for (let eroare of erori.info_erori) {
        if (eroare.imagine) {
            const caleImg = path.join(__dirname, erori.cale_baza, eroare.imagine);
            if (!fs.existsSync(caleImg)) {
                console.error(`Imaginea pentru eroarea '${eroare.identificator}' nu exista!`)
            }
        }
    }

    //bonus 6 - fara duplicate

    const linii = continutString.split('\n');
    const proprietatiVazute = [];
    for (let i = 0; i < linii.length; i++) {
        const match = linii[i].match(/^\s*"(\w+)"\s*:/);
        if (match) {
            const prop = match[1];

            if (proprietatiVazute.includes(prop)) {
                console.error(`Proprietatea '${prop}' este duplicata!`);
            }
            proprietatiVazute.push(prop);
        }

    }

    //bonus 7 

    for (let i = 0; i < erori.info_erori.length; i++) {
        const duplicates = erori.info_erori.filter(e => e.identificator === erori.info_erori[i].identificator);

        if (duplicates.length > 1) {
            duplicates.forEach(d => {
                const { identificator, ...restProps } = d;
                console.error(`Eroarea cu identificatorul '${identificator}' este duplicata! Restul proprietatilor sunt: `, restProps);
            });
        }

    }
}

verificareErori();
initErori();

function compileazaScss(caleScss, caleCss) {
    if (!caleCss) {

        let numeFisExt = path.basename(caleScss); // "folder1/folder2/a.scss" -> "a.scss"
        // let numeFis = numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        let numeFis = numeFisExt.substring(0, numeFisExt.lastIndexOf("."));
        caleCss = numeFis + ".css"; // output: a.css
    }

    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss)
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss)

    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true })
    }

    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss = path.basename(caleCss);
    if (fs.existsSync(caleCss)) {
        // fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeFisCss))// +(new Date()).getTime()
        let numeFaraCss = numeFisCss.split(".")[0];
        let timestamp = (new Date()).getTime();
        let numeFisBackup = numeFaraCss + "_" + timestamp + ".css";
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeFisBackup))
    }
    rez = sass.compile(caleScss, { "sourceMap": true });
    fs.writeFileSync(caleCss, rez.css)

}


//la pornirea serverului
vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) == ".scss") {
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
    if (eveniment == "change" || eveniment == "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta);
        }
    }
})




function afisareEroare(res, identificator, titlu, text, imagine) {
    //TO DO cautam eroarea dupa identificator


    // let eroare = obGlobal.obErori.info_erori.find(function (elem) {
    //     return elem.identificator = identificator
    // })
    //sau o scriem ca arrow function
    let eroare = obGlobal.obErori.info_erori.find((elem) => elem.identificator = identificator)


    //daca sunt setate titlu, text, imagine, le folosim, 
    //altfel folosim cele din fisierul json pentru eroarea gasita
    //daca nu o gasim, afisam eroarea default

    let errDefault = obGlobal.obErori.eroare_default;
    if (eroare?.status) {
        res.status(eroare.identificator);
    }
    res.render("pagini/eroare", {
        imagine: imagine || eroare?.imagine || errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare?.titlu || errDefault.text
    });

}



// app.get("/eroare", function (req, res) {
//     afisareEroare(res, 404, "Titlu!@!!")
// });

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

let vect_foldere = ["temp", "backup", "logs", "fisiere_uploadate"];
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(path.join(caleFolder), {
            recursive: true
        });
    }
}

// app.get("/:a/:b", function (req, res) {
//     res.sendFile(path.join(__dirname, "index.html"));
// });


app.use("/resurse", express.static(path.join(__dirname, "/resurse")));
app.use("/dist", express.static(path.join(__dirname, "/node_modules/bootstrap/dist")));

app.get("/favicon.ico", function (req, res) {
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"));
});

// app.get("/", function (req, res) {
//     // res.sendFile(path.join(__dirname, "index.html"));
//     res.render("pagini/index");
// });



// app.get("/despre", function (req, res) {
//     res.render("pagini/despre");
// });

app.get("/cale", function (req, res) {
    console.log("Am primit o cerere GET pe /cale");
    res.send("Raspuns la cererea GET pe /cale");
});

app.get("/cale2", function (req, res) {
    res.write("ceva");
    res.write("altceva");
    res.end();
});

app.get("/cale2/:a/:b", function (req, res) {
    res.send(parseInt(req.params.a) + parseInt(req.params.b));
});

//bonus etapaa 5--verificare erori imagini

function verificareImagini(obImagini) {
    let caleGalerie = path.join(__dirname, obImagini.cale_galerie);
    if (!fs.existsSync(caleGalerie)) {
        console.error(`Eroare: Folderul galerie "${caleGalerie}" nu exista inca in sistem`);
    }
    else {
        console.log(`Folderul galerie a fost gasit: "${caleGalerie}"`);
    }
    for (let imagine of obImagini.imagini) {
        let caleFisier = path.join(caleGalerie, imagine.cale_fisier);
        if (!fs.existsSync(caleFisier)) {
            console.error(`Fisierul "${imagine.cale_fisier}" nu exista`);
        }
    }

}

function initImagini() {
    var continut = fs.readFileSync(path.join(__dirname, "resurse/json/galerie.json")).toString("utf-8");
    //citeste json

    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;
    //vector 
    let caleGalerie = obGlobal.obImagini.cale_galerie

    let caleAbs = path.join(__dirname, caleGalerie);
    let caleAbsMediu = path.join(caleAbs, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    for (let imag of vImagini) {
        [numeFis, ext] = imag.cale_fisier.split("."); //"ceva.png" -> ["ceva", "png"]
        let caleFisAbs = path.join(caleAbs, imag.cale_fisier);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu = path.join("/", caleGalerie, "mediu", numeFis + ".webp")
        imag.fisier = path.join("/", caleGalerie, imag.cale_fisier)

    }
    // console.log(obGlobal.obImagini)
}
initImagini();
verificareImagini(obGlobal.obImagini);

app.get(["/", "/index", "/home"], function (req, res) {
    res.render("pagini/index", {
        ip: req.ip,
        imagini: obGlobal.obImagini.imagini
    });
});
//["/", "index", "/home"] - array  of rutes



app.get("/*pagina", function (req, res) {
    console.log("Cale pagina", req.url);
    if (req.url.startsWith("/resurse") && path.extname(req.url) == "") {
        afisareEroare(res, 403);
        return;
    }
    if (path.extname(req.url) == ".ejs") {
        afisareEroare(res, 400);
        return;
    }
    try {
        res.render("pagini" + req.url, function (err, rezRandare) {
            if (err) {
                if (err.message.includes("Failed to lookup view")) {
                    afisareEroare(res, 404)
                }
                else {
                    afisareEroare(res);
                }
            }
            else {
                res.send(rezRandare);
                //console.log("Rezultat randare", rezRandare);
            }
        });
    }
    catch (err) {
        if (err.message.includes("Cannot find module")) {
            afisareEroare(res, 404)
        }
        else {
            afisareEroare(res);
        }
    }
});




app.listen(8080);
console.log("Serverul a pornit!");