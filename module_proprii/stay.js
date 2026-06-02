class Stay {
    constructor({ id, nume_proprietate, descriere, tip_proprietate, facilitati, nr_dormitoare, nr_persoane, nr_bai, animal_friendly, balcon, dat_creare, imagine, pret_noapte, dimensiune_mp, tara, oras, adresa, rating, disponibil } = {}) {

        for (let prop in argumente[0]) {
            this[prop] = argumente[0][prop];
        }
    }
}