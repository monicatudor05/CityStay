drop table if exists utilizatori;
drop type if exists roluri;
drop table if exists accesari;


CREATE TYPE roluri as ENUM('admin', 'moderator', 'comun');

CREATE TABLE IF  NOT EXISTS utilizatori(
    id serial PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    nume VARCHAR(100) NOT NULL,
    prenume VARCHAR(100) NOT NULL,
    data_nastere DATE,
    telefon VARCHAR(50) NOT NULL,
    parola VARCHAR(200) NOT NULL,
    rol roluri NOT NULL DEFAULT 'comun',
    email VARCHAR(100) NOT NULL,
    culoare_chat VARCHAR(50) NOT NULL DEFAULT 'black',
    data_adaugare TIMESTAMP DEFAULT current_timestamp,
    cod character varying(200),
    confirmat_mail boolean DEFAULT false,
    imagine_profil VARCHAR(200)
    
);

CREATE TABLE IF NOT EXISTS accesari(
    id serial PRIMARY KEY,
    ip VARCHAR(100) NOT NULL,
    user_id INT NULL REFERENCES utilizatori(id),
    pagina VARCHAR(500) NOT NULL,
    data_accesare TIMESTAMP DEFAULT current_timestamp   
);