const AccesBD = require('./accesbd.js');
const parole = require('./parole.js');
const { RolFactory } = require('./roluri.js');
const crypto = require("crypto");
const nodemailer = require("nodemailer");


class Utilizator {

    /** @type {string} Tipul conexiunii la baza de date */
    static tipConexiune = "local";

    /** @type {string} Numele tabelului din baza de date */
    static tabel = "utilizatori";

    /** @type {string} Salt-ul folosit la criptarea parolei */
    static parolaCriptare = "tehniciweb";

    /** @type {string} Adresa de email de pe care se trimit mailurile */
    static emailServer = "test.tweb.node@gmail.com";

    /** @type {number} Lungimea hash-ului generat la criptarea parolei (in bytes) */
    static lungimeCod = 64;

    /** @type {string} Domeniul site-ului folosit in link-urile din mailuri */
    static numeDomeniu = "localhost:8080";

    /** @type {string} Camp privat pentru stocarea mesajelor de eroare */
    #eroare;

    /**
     * Creeaza un obiect Utilizator cu datele furnizate.
     * Copiaza toate proprietatile din obiectul primit si initializeaza rolul.
     * @param {Object} [obj={}] - obiectul cu datele utilizatorului
     * @param {number} [obj.id] - id-ul utilizatorului din baza de date
     * @param {string} [obj.username] - username-ul utilizatorului
     * @param {string} [obj.nume] - numele de familie
     * @param {string} [obj.prenume] - prenumele
     * @param {string} [obj.email] - adresa de email
     * @param {string} [obj.parola] - parola (necriptata, doar la inregistrare)
     * @param {string|Object} [obj.rol] - rolul utilizatorului ("admin", "moderator", "comun") sau obiect cu .cod
     * @param {string} [obj.culoare_chat="black"] - culoarea chat-ului
     * @param {string} [obj.imagine_profil] - numele fisierului imagine de profil
     * @param {string} [obj.telefon] - numarul de telefon
     * @param {string} [obj.data_nastere] - data nasterii
     */


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
    /**
     * Verifica daca un nume este valid.
     * Numele trebuie sa inceapa cu litera mare si sa contina doar litere mici dupa.
     * @param {string} nume - numele de verificat
     * @returns {boolean} true daca numele este valid, false altfel
     */

    checkName(nume) {
        return nume != "" && nume.match(new RegExp("^[A-Z][a-z]+$"));
    }
    /**
     * Verifica daca un nume este valid.
     * Numele trebuie sa inceapa cu litera mare si sa contina doar litere mici dupa.
     * @param {string} nume - numele de verificat
     * @returns {boolean} true daca numele este valid, false altfel
     */


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
        let token1 = parole.genereazaTokenMic(50);
        let token2 = Math.floor(Date.now() / 1000);


        AccesBD.getInstanta({ init: Utilizator.tipConexiune }).insert({
            tabel: Utilizator.tabel,
            campuri: {
                username: this.username,
                nume: this.nume,
                prenume: this.prenume,
                parola: parolaCriptata,
                email: this.email,
                culoare_chat: this.culoare_chat,
                cod: `${token1}-${token2}`,
                imagine_profil: this.imagine_profil,
                telefon: this.telefon,
                data_nastere: this.data_nastere
            }
        }, function (err, rez) {
            if (err) {
                console.log(err);
            } else {

                utiliz.trimiteMail(
                    `Salut, stimate ${utiliz.nume}!`,
                    `Username-ul tău este ${utiliz.username} pe site-ul CityStay.`,
                    `<p>Username-ul tău este <b>${utiliz.username}</b> pe site-ul <b><i><u>CityStay</u></i></b>.</p>
 <p><a href='http://${Utilizator.numeDomeniu}/cod_mail/${token1}-${token2}/${utiliz.username.toUpperCase()}'>Click aici pentru confirmare</a></p>`)

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
                conditiiAnd: [`username = '${username}'`]
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
            conditiiAnd: [`username = '${username}'`]
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