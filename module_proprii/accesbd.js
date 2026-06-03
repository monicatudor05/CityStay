const { Client, Pool } = require("pg");

/**
 * Clasa Singleton pentru gestionarea accesului la baza de date PostgreSQL.
 * Asigura ca exista o singura conexiune la baza de date in toata aplicatia.
 * Nu poate fi instantiata direct folositi getInstanta() in schimb.
 */

class AccesBD {
    static #instanta = null;
    static #initializat = false;
    /**
    * Constructor privat  arunca o eroare daca este apelat direct din exterior.
    * Poate fi apelat doar din getInstanta().
    * @throws {Error} daca clasa a fost deja instantiata sau apelata din afara getInstanta()
    */
    constructor() {
        if (AccesBD.#instanta) {
            throw new Error("Deja a fost instantiat!");
        }
        else if (!AccesBD.#initializat) {
            throw new Error("Trebuie apalet doar din getInstanta");

        }
    }
    /**
  * Initializeaza o conexiune locala la PostgreSQL folosind credentialele hardcodate.
  * Salveaza conexiunea in this.client si se conecteaza imediat.
  * @returns {void}
  */

    initLocal() {
        this.client = new Client({
            database: "citystay",
            user: "monica",
            password: "parola123",
            host: "localhost",
            port: 5432
        });
        this.client.connect();
    }
    /**
    * Returneaza obiectul client PostgreSQL activ.
    * @throws {Error} daca clasa nu a fost inca instantiata
    * @returns {Client} obiectul pg Client activ
    */




    getClient() {
        if (!AccesBD.#instanta) {
            throw new Error("Nu a fost inca insstantiat");
        }
        return this.client;
    }
    /**
    * Returneaza obiectul client PostgreSQL activ.
    * @throws {Error} daca clasa nu a fost inca instantiata
    * @returns {Client} obiectul pg Client activ
    */




    static getInstanta({ init = "local" } = {}) {
        console.log(this);
        if (!this.#instanta) {
            this.#initializat = true;
            this.#instanta = new AccesBD();

            try {
                switch (init) {
                    case "local": this.#instanta.initLocal();
                }
            }
            catch (e) {
                console.log("Eroare la initializarea bazei de date");
            }
        }
        return this.#instanta;
    }
    /**
        * Executa un query SELECT in baza de date folosind un callback.
        * @param {Object} obj - parametrii query-ului
        * @param {string} obj.tabel - numele tabelului
        * @param {string[]} obj.campuri - vector cu numele coloanelor de selectat (ex: ["*"] sau ["id", "nume"])
        * @param {string[]} obj.conditiiAnd - vector cu conditiile WHERE unite cu AND (ex: ["rol='admin'"])
        * @param {function} callback - functie(err, rez) apelata cand query-ul se termina
        * @param {Array} [parametriQuery=[]] - valori optionale pentru query parametrizat
        * @returns {void}
        */
    select({ tabel = "", campuri = [], conditiiAnd = [] } = {}, callback, parametriQuery = []) {
        let conditieWhere = "";
        if (conditiiAnd.length > 0) {
            conditieWhere = `where ${conditiiAnd.join(" and ")} `;
        }

        let comanda = `select ${campuri.join(", ")} from ${tabel} ${conditieWhere}`;
        console.group(comanda);

        this.client.query(comanda, parametriQuery, callback);

    }
    /**
    * Executa un query SELECT in baza de date folosind un callback.
    * @param {Object} obj - parametrii query-ului
    * @param {string} obj.tabel - numele tabelului
    * @param {string[]} obj.campuri - vector cu numele coloanelor de selectat (ex: ["*"] sau ["id", "nume"])
    * @param {string[]} obj.conditiiAnd - vector cu conditiile WHERE unite cu AND (ex: ["rol='admin'"])
    * @param {function} callback - functie(err, rez) apelata cand query-ul se termina
    * @param {Array} [parametriQuery=[]] - valori optionale pentru query parametrizat
    * @returns {void}
    */
    async selectAsync({ tabel = "", campuri = [], conditiiAnd = [] } = {}) {
        let conditieWhere = "";
        if (conditiiAnd.length > 0) {
            conditieWhere = `where ${conditiiAnd.join(" and ")}`;
        }

        let comanda = `select ${campuri.join(",")} from ${tabel} ${conditieWhere}`;
        console.error("selectAsync: ", comanda);

        try {
            let rez = await this.client.query(comanda);
            console.log("selectAsync: ", rez);
            return rez;
        }
        catch (e) {
            console.log(e);;
            return null;
        }
    }

    /**
         * Insereaza o inregistrare noua in tabelul specificat.
         * @param {Object} obj - parametrii inserarii
         * @param {string} obj.tabel - numele tabelului
         * @param {Object} obj.campuri - obiect unde cheile sunt numele coloanelor si valorile sunt datele de inserat
         * @param {function} callback - functie(err, rez) apelata cand query-ul se termina
         * @returns {void}
         */
    insert({ tabel = "", campuri = {} } = {}, callback) {
        // exemplu:
        //campuri={
        //nume:"savarina",
        //pret:10,
        //calorii:500
        //  }
        console.log("-------------------------------------------")

        console.log(Object.keys(campuri).join(","));


        console.log(Object.values(campuri).join(","));


        let comanda = `insert into ${tabel} (${Object.keys(campuri).join(",")}) values (${Object.values(campuri).map((x) => x === null ? 'NULL' : `'${x}'`).join(", ")})`
        console.log(comanda);
        this.client.query(comanda, callback);
    }
    /**
    * Actualizeaza inregistrari in tabelul specificat.
    * Atentie: valorile sunt inserate direct in sirul SQL — nu este protejat impotriva SQL injection!
    * @param {Object} obj - parametrii actualizarii
    * @param {string} obj.tabel - numele tabelului
    * @param {Object} obj.campuri - obiect unde cheile sunt numele coloanelor si valorile sunt noile valori
    * @param {string[]} obj.conditiiAnd - vector cu conditiile WHERE unite cu AND
    * @param {function} callback - functie(err, rez) apelata cand query-ul se termina
    * @returns {void}
    */
    update({ tabel = "", campuri = {}, conditiiAnd = [] } = {}, callback, parametriQuery) {
        let campuriActualizate = [];
        for (let prop in campuri)
            campuriActualizate.push(`${prop}='${campuri[prop]}'`);
        let conditieWhere = "";
        if (conditiiAnd.length > 0)
            conditieWhere = `where ${conditiiAnd.join(" and ")}`;
        let comanda = `update ${tabel} set ${campuriActualizate.join(", ")}  ${conditieWhere}`;
        console.log(comanda);
        this.client.query(comanda, callback)

        //update utilizaator
        //set nume='Ana', ani=12
        //where id=5
    }
    /**
        * Actualizeaza inregistrari in tabelul specificat.
        * Atentie: valorile sunt inserate direct in sirul SQL — nu este protejat impotriva SQL injection!
        * @param {Object} obj - parametrii actualizarii
        * @param {string} obj.tabel - numele tabelului
        * @param {Object} obj.campuri - obiect unde cheile sunt numele coloanelor si valorile sunt noile valori
        * @param {string[]} obj.conditiiAnd - vector cu conditiile WHERE unite cu AND
        * @param {function} callback - functie(err, rez) apelata cand query-ul se termina
        * @returns {void}
        */
    updateParametrizat({ tabel = "", campuri = [], valori = [], conditiiAnd = [] } = {}, callback, parametriQuery) {
        if (campuri.length != valori.length) {
            throw new Error("Numarul de campuri difera de cel de valori");
        }

        let campuriActualizate = [];
        for (let i = 0; i < campuri.length; i++) {
            campuriActualizate.push(`${campuri[i]}=$${i + 1}`);
        }
        let conditieWhere = "";
        if (conditiiAnd.length > 0) {
            conditieWhere = `where ${conditiiAnd.join(" and ")}`;

        }
        let comanda = `update ${tabel} set ${campuriActualizate.join(", ")} ${conditieWhere}`;
        console.log("!!!!!!!!!!!!!!!!!", comanda);
        this.client.query(comanda, valori, callback);
    }

    /**
         * Sterge inregistrari din tabelul specificat.
         * Atentie: daca nu se furnizeaza conditii, TOATE inregistrarile din tabel vor fi sterse!
         * @param {Object} obj - parametrii stergerii
         * @param {string} obj.tabel - numele tabelului
         * @param {string[]} obj.conditiiAnd - vector cu conditiile WHERE unite cu AND
         * @param {function} callback - functie(err, rez) apelata cand query-ul se termina
         * @returns {void}
         */
    delete({ tabel = "", conditiiAnd = [] } = {}, callback) {
        let conditieWhere = ""
        if (conditiiAnd.length > 0) {
            conditieWhere = `where ${conditiiAnd.join(" and ")}`
        }
        let comanda = `delete from ${tabel} ${conditieWhere}`;
        console.log(comanda);
        this.client.query(comanda, callback);
    }


}
module.exports = AccesBD;
