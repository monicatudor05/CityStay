const AccesBD = require('./accesbd.js');
const parole = require('./parole.js');
const { RolFactory } = require('./roluri.js');
const crypto = require("crypto");
const nodemailer = require("nodemailer");


class Utilizator {
    static tipConexiune = "local";
    static tabel = "utilizatori";
    static parolaCriptare = "tehniciweb"; // salt
    static emailServer = "test.tweb.node@gmail.com";
    static lungimeCod = 64;
    static numeDomeniu = "localhost:8080";
    #eroare;

    constructor({ id, username, nume, prenume, email, parola, rol, culoare_chat = "black", imagine_profil, telefon, data_nastere } = {}) {
        this.id = id;

        for (let prop in arguments[0]) {
            this[prop] = arguments[0][prop];
        }

        if (this.rol) {
            this.rol = this.rol.cod ? RolFactory.creeazaRol(this.rol.cod) : RolFactory.creeazaRol(this.rol);
            console.log(this.rol);
        }

        this.#eroare = "";
    }

    checkName(nume) {
        return nume != "" && nume.match(new RegExp("^[A-Z][a-z]+$"));
    }

    set setareNume(nume) {
        if (this.checkName(nume)) this.nume = nume;
        else {
            throw new Error("Wrong name");
        }
    }

    // used only at registration and profile editing
    set setareUsername(username) {
        if (this.checkUsername(username)) this.username = username;
        else {
            throw new Error("Wrong username");
        }
    }

    checkUsername(username) {
        return username != "" && username.match(new RegExp("^[A-Za-z0-9#_./]+$"));
    }

    static criptareParola(parola) {
        return crypto.scryptSync(parola, Utilizator.parolaCriptare, Utilizator.lungimeCod).toString("hex");
    }

    salvareUtilizator() {
        let parolaCriptata = Utilizator.criptareParola(this.parola);
        let utiliz = this;
        let token = parole.genereazaToken(100);


        AccesBD.getInstanta({ init: Utilizator.tipConexiune }).insert({
            tabel: Utilizator.tabel,
            campuri: {
                username: this.username,
                nume: this.nume,
                prenume: this.prenume,
                parola: parolaCriptata,
                email: this.email,
                culoare_chat: this.culoare_chat,
                cod: token,
                imagine_profil: this.imagine_profil,
                telefon: this.telefon,
                data_nastere: this.data_nastere
            }
        }, function (err, rez) {
            if (err) {
                console.log(err);
            } else {

                utiliz.trimiteMail(
                    "You have successfully registered",
                    "Your username is " + utiliz.username,
                    `<h1>Welcome!</h1>
                     <p style='color:blue'>Your username: ${utiliz.username}.</p>
                     <p><a href='http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'>Click here for confirmation</a></p>`
                );
            }
        });
    }

    async trimiteMail(subiect, mesajText, mesajHtml, atasamente = []) {
        var transp = nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth: {
                user: Utilizator.emailServer,
                pass: "rwgmgkldxnarxrgu"
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        await transp.sendMail({
            from: Utilizator.emailServer,
            to: this.email,
            subject: subiect,
            text: mesajText,
            html: mesajHtml,
            attachments: atasamente
        });

        console.log("sent mail");
    }

    static async getUtilizDupaUsernameAsync(username) {
        if (!username) return null;
        try {
            let rezSelect = await AccesBD.getInstanta({ init: Utilizator.tipConexiune }).selectAsync({
                tabel: "utilizatori",
                campuri: ['*'],
                conditiiAnd: [`username='${username}'`]
            });

            if (rezSelect.rowCount != 0) {
                return new Utilizator(rezSelect.rows[0]);
            } else {
                console.log("getUtilizDupaUsernameAsync: Didn't find the user");
                return null;
            }
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    static getUtilizDupaUsername(username, obparam, proceseazaUtiliz) {
        if (!username) return null;

        AccesBD.getInstanta({ init: Utilizator.tipConexiune }).select({
            tabel: "utilizatori",
            campuri: ['*'],
            conditiiAnd: [`username='${username}'`]
        }, function (err, rezSelect) {
            let eroare = null;

            if (err) {
                console.log("Utilizator: ", err);
                eroare = -2;
            } else if (rezSelect.rowCount == 0) {
                eroare = -1;
            }

            let u = eroare == null ? new Utilizator(rezSelect.rows[0]) : null;
            proceseazaUtiliz(u, obparam, eroare);
        });
    }

    areDreptul(drept) {
        return this.rol.areDreptul(drept);
    }
}

module.exports = { Utilizator: Utilizator };