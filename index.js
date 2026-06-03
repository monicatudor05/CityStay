const express = require("express");
const path = require("path");
const fs = require("fs");
const sass = require("sass");
const sharp = require("sharp");
const pg = require("pg");
// const cookieParser = require("cookie-parser");
const formidable = require("formidable");
require(path.join(__dirname, "resurse/js/oferte"))
const session = require("express-session");

const Drepturi = require("./module_proprii/drepturi.js");
const { Utilizator } = require("./module_proprii/utilizator.js");



app = express();
app.use(session({
    secret: "citystay_secret",
    resave: true,
    saveUninitialized: false
}));
app.use(function (req, res, next) {
    if (req.session.utilizator) {
        res.locals.utilizator = new Utilizator(req.session.utilizator);

    }
    res.locals.errLogin = req.session.errLogin;
    req.session.errLogin = null;
    next();
});
// app.use(cookieParser());
app.set("view engine", "ejs")





obGlobal = {
    obErori: null,
    obImagini: null,
    obCategorii: [],
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup")
}

client = new pg.Client({
    database: "citystay",
    user: "monica",
    password: "parola123",
    host: "localhost",
    port: 5432
})

client.connect()

client.query(`select DISTINCT tip_proprietate FROM stays`, function (err, rez) {
    if (err) {
        console.log("Eroare ", err)
    }
    else {
        obGlobal.obCategorii = rez.rows.map(r => r.tip_proprietate)

    }
})

client.query(`select * from stays`, function (err, rez) {
    if (err) {
        console.log("Eroare", err)
    }
    else {
        console.log(rez.rows)
    }
})

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

    //bonus 4 nu exista cale_baza
    const caleFolder = path.join(__dirname, erori.cale_baza);

    if (!fs.existsSync(caleFolder)) {
        console.error(`Nu este specificat nicun folder in cale_baza`);

    }

    //bonus 5 --imaagini
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
    let proprietatiVazute = [];
    for (let i = 0; i < linii.length; i++) {

        if (linii[i].includes('{')) {
            proprietatiVazute = [];
        }
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
        //bonus4-et5
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
        //bonus3-et5
        let numeFisBackup = numeFaraCss + "_" + timestamp + ".css";
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeFisBackup))
    }
    rez = sass.compile(caleScss, { "sourceMap": true });
    fs.writeFileSync(caleCss, rez.css)

}


//la pornirea serverului
vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    //bonus4-et5
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
    let eroare = obGlobal.obErori.info_erori.find((elem) => elem.identificator == identificator)


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

app.use(function (req, res, next) {
    if (obGlobal.obCategorii.length === 0) {
        client.query(`SELECT DISTINCT tip_proprietate FROM stays`, function (err, rez) {
            if (!err) {
                obGlobal.obCategorii = rez.rows.map(r => r.tip_proprietate)
            }
            next()
        })
    } else {
        next()
    }
})

app.use("/resurse", express.static(path.join(__dirname, "/resurse")));
app.use("/dist", express.static(path.join(__dirname, "/node_modules/bootstrap/dist")));

app.use("/poze_uploadate", express.static(path.join(__dirname, "poze_uploadate")));

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

app.get("/oferta-curenta", function (req, res) {
    let oferte = JSON.parse(fs.readFileSync(path.join(__dirname, "resurse/json/oferte.json"))).oferte
    if (oferte.length > 0) {
        res.json(oferte[0])
    } else {
        res.json(null)
    }
})

//bonus etapa 5--verificare erori imagini

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
        imagini: obGlobal.obImagini.imagini,
        categorii: obGlobal.obCategorii

    });
});
//["/", "index", "/home"] - array  of rutes

app.get("/stays", function (req, res) {
    let clauzaWhere = "";
    console.log(req.query);

    if (req.query.tip) {
        clauzaWhere = `where tip_proprietate='${req.query.tip}'`

    }
    client.query(`select * from stays ${clauzaWhere}`, function (err, rez) {


        if (err) {
            console.log("Erore", err)
            afisareEroare(res, 2)
            return;
        }

        let staysData = rez.rows

        client.query("select dimensiune_mp from stays", function (err, rez2) {
            if (err) {
                afisareEroare(res, 2); return;
            }
            let dimensiuni = rez2.rows.map(row => parseFloat(row.dimensiune_mp))
            let dimMin = Math.min(...dimensiuni)
            let dimMax = Math.max(...dimensiuni)
            console.log(dimMax)
            console.log(dimMin)

            res.render("pagini/stays", {

                stays: staysData,
                dimMin: dimMin,
                dimMax: dimMax,
                optiuni: [],
                categorii: obGlobal.obCategorii
            });

        });

    });
});


app.get("/stay/:id", function (req, res) {
    client.query(`select * from stays where id=${req.params.id}`, function (err, rez) {
        if (err) { afisareEroare(res, 2); return; }
        if (rez.rowCount == 0) { afisareEroare(res, 404); return; }

        let stay = rez.rows[0]

        const folderPath = `resurse/imagini/stays/folder${req.params.id}`;
        let imagini = []
        try {
            imagini = fs.readdirSync(folderPath).filter(f => f.endsWith(".jpg")).map(f => `/resurse/imagini/stays/folder${req.params.id}/${f}`)
        }
        catch (e) {
            //nothing happens, imaagini remain empty
        }

        client.query(`select * from stays where oras='${stay.oras}' and id!=${stay.id} limit 4`, function (err, rez2) {
            if (err) { afisareEroare(res, 2); return; }
            res.render("pagini/stay", {
                stay: stay,
                categorii: obGlobal.obCategorii,
                similare: rez2.rows,
                imagini: imagini
            });
        });
    });
});

app.get("/stays-random", function (req, res) {
    client.query("SELECT * FROM stays ORDER BY RANDOM() LIMIT 5", function (err, rez) {
        if (err) { res.json([]); return; }
        res.json(rez.rows);
    });
});

app.get("/profil", function (req, res) {
    res.render("pagini/profil", {

    })
})

app.get("/inregistrare", function (req, res) {
    res.render("pagini/inregistrare");

});


app.post("/inregistrare", function (req, res) {
    var form = new formidable.IncomingForm();
    var imagine_profil = null;
    var username_temp = "";


    // form.on("field", function (nume, fisier) {
    //     if (fisier.originalFilename) {
    //         var folder = path.join(__dirname, "poze_uploadate", username_temp);
    //         if (!fs.existsSync(folder))
    //             fs.mkdirSync(folder, { recursive: true });
    //         fisier.filepath = path.join(folder, fisier.originalFilename);
    //         imagine_profil = fisier.originalFilename;
    //     }
    // })

    form.on("field", function (nume, val) {
        if (nume == "username") username_temp = val;
    });

    form.on("fileBegin", function (nume, fisier) {
        if (fisier.originalFilename) {
            var folder = path.join(__dirname, "poze_uploadate", username_temp);
            if (!fs.existsSync(folder))
                fs.mkdirSync(folder, { recursive: true });
            fisier.filepath = path.join(folder, fisier.originalFilename);
            imagine_profil = fisier.originalFilename;
        }
    });

    form.parse(req, function (err, campuriText, campuriFisier) {
        console.log("Text fields:", campuriText);
        console.log("Files:", campuriFisier);

        if (!campuriText.nume[0] || !campuriText.prenume[0] || !campuriText.email[0] || !campuriText.password[0] ||
            !campuriText.username[0]
        ) {
            res.render("pagini/inregistrare", {
                err: "Required fields missing"
            });
            return;

        }

        // check passwordd match
        if (campuriText.password[0] != campuriText.password2[0]) {
            res.render("pagini/inregistrare", { err: "Passwords don't match" })
            return;
        }

        //create new user
        let utilizNou = new Utilizator({
            username: campuriText.username[0],
            nume: campuriText.nume[0],
            prenume: campuriText.prenume[0],
            parola: campuriText.password[0],
            email: campuriText.email[0],
            data_nastere: campuriText.birthdate[0],
            culoare_chat: campuriText.chatcolor[0],
            telefon: campuriText.phone[0],
            imagine_profil: imagine_profil

        });

        Utilizator.getUtilizDupaUsername(campuriText.username[0], {}, function (u, obparam, eroare) {
            if (eroare != -1) {
                res.render("pagini/inregistrare", { err: "Username already exists" });
                return;
            }
            //username free--> save
            utilizNou.salvareUtilizator();
            res.render("pagini/inregistrare", {
                raspuns: "Registration successful. Check your email."
            });


        });


    });
});

app.get("/cod_mail/:token/:username", function (req, res) {
    let tokenPrimit = req.params.token;
    let usernamePrimit = req.params.username.toLowerCase();

    Utilizator.getUtilizDupaUsername(usernamePrimit, {}, function (u, obparam, eroare) {
        if (eroare == -1 || eroare == -2) {
            afisareEroare(res, 404);
            return;
        }


        if (u.cod != tokenPrimit) {
            afisareEroare(res, 403);
            return;
        }


        AccesBD.getInstanta({ init: "local" }).update({
            tabel: "utilizatori",
            campuri: { confirmat_mail: true },
            conditiiAnd: [`username='${usernamePrimit}'`]
        }, function (err, rez) {
            if (err) {
                afisareEroare(res, 2);
            } else {
                res.render("pagini/confirmare");
            }
        });
    });
});
app.get("/test-confirmare", function (req, res) {
    res.render("pagini/confirmare");
});

app.post("/login", function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, campuriText) {
        Utilizator.getUtilizDupaUsername(campuriText.username[0], {},
            function (u, obparam, eroare) {
                if (eroare == -1 || !u) {
                    req.session.errLogin = "Username inexistent!";
                    res.redirect("/");
                    return;
                }
                let parolaCriptata = Utilizator.criptareParola(campuriText.password[0]);
                if (u.parola != parolaCriptata) {
                    req.session.errLogin = "Parola gresita!";
                    res.redirect("/");
                    return;
                }
                if (!u.confirmat_mail) {
                    req.session.errLogin = "Nu ai confirmat emailul!";
                    res.redirect("/");
                    return;
                }

                req.session.utilizator = u;
                res.redirect("/");
            }
        );
    });
});

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/");
});

app.get("/profil", function (req, res) {
    if (!req.session.utilizator) {
        afisareEroare(res, 403);
        return;
    }
    res.render("pagini/profil", {
        utilizator: req.session.utilizator
    });
});

// profil page
app.post("/profil", function (req, res) {
    if (!req.session.utilizator) {
        afisareEroare(res, 403);
        return;
    }

    var form = new formidable.IncomingForm();
    var poza_noua = null;

    form.on("fileBegin", function (nume, fisier) {
        if (fisier.originalFilename) {
            var folder = path.join(__dirname, "poze_uploadate", req.session.utilizator.username);
            if (!fs.existsSync(folder))
                fs.mkdirSync(folder, { recursive: true });
            fisier.filepath = path.join(folder, "poza.png");
            poza_noua = "poza.png";
        }
    });

    form.parse(req, function (err, campuriText) {
        let parolaCriptata = Utilizator.criptareParola(campuriText.parola[0]);

        if (parolaCriptata != req.session.utilizator.parola) {
            res.render("pagini/profil", {
                utilizator: req.session.utilizator,
                err: "Wrong password!"
            });
            return;
        }

        let campuriUpdate = {
            nume: campuriText.nume[0],
            prenume: campuriText.prenume[0],
            email: campuriText.email[0],
            telefon: campuriText.telefon[0] || null,
            culoare_chat: campuriText.culoare_chat[0],
            data_nastere: campuriText.data_nastere[0] || null
        };

        if (poza_noua) campuriUpdate.imagine_profil = poza_noua;
        if (campuriText.parola_noua[0]) {
            campuriUpdate.parola = Utilizator.criptareParola(campuriText.parola_noua[0]);
        }

        AccesBD.getInstanta({ init: "local" }).update({
            tabel: "utilizatori",
            campuri: campuriUpdate,
            conditiiAnd: [`username='${req.session.utilizator.username}'`]
        }, function (err, rez) {
            if (err) {
                afisareEroare(res, 2);
                return;
            }
            // update session
            req.session.utilizator = { ...req.session.utilizator, ...campuriUpdate };

            res.render("pagini/profil", {
                utilizator: req.session.utilizator,
                mesaj: "Profile updated successfully!"
            });
        });
    });
});
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