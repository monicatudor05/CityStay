const { Client, Pool } = require("pg");


class AccesBD {
    static #instanta = null;
    static #initializat = false;

    constructor() {
        if (AccesBD.#instanta) {
            throw new Error("Deja a fost instantiat!");
        }
        else if (!AccesBD.#initializat) {
            throw new Error("Trebuie apalet doar din getInstanta");

        }
    }

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


    getClient() {
        if (!AccesBD.#instanta) {
            throw new Error("Nu a fost inca insstantiat");
        }
        return this.client;
    }

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

    select({ tabel = "", campuri = [], conditiiAnd = [] } = {}, callback, parametriQuery = []) {
        let conditieWhere = "";
        if (conditiiAnd.length > 0) {
            conditieWhere = `where ${conditiiAnd.join(" and ")} `;
        }

        let comanda = `select ${campuri.join(", ")} from ${tabel} ${conditieWhere}`;
        console.group(comanda);

        this.client.query(comanda, parametriQuery, callback);

    }

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
