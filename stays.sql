DROP TYPE IF EXISTS stays_type;


CREATE TYPE stays_type AS ENUM('penthouse', 'house', 'mansion', 'apartment');
-- CREATE TYPE facilities AS ENUM('wi-fi', 'cosmetics', 'towels', 'parking spot', 'terasse', 'mini fridge', 'gym', 'jacuzzy', 'pool', 'garden', 'air conditioner', 'smart tv', 'washing machine');


CREATE TABLE IF NOT EXISTS stays(
    id serial PRIMARY KEY,
    nume_proprietate VARCHAR(100),
    descriere TEXT,
    tip_proprietate stays_type DEFAULT 'apartment',
    facilitati TEXT[] DEFAULT '{wi-fi}',
    nr_dormitoare INT NOT NULL CHECK (nr_dormitoare>=1),
    nr_persoane INT NOT NULL CHECK (nr_persoane>=1),
    nr_bai INT NOT NULL CHECK(nr_bai>=1),
    animal_friendly BOOLEAN NOT NULL DEFAULT FALSE,
    balcon BOOLEAN NOT NULL DEFAULT FALSE,
    data_creare TIMESTAMP DEFAULT current_timestamp,
    imagine VARCHAR(255),
    pret_noapte DECIMAL(10,2) NOT NULL CHECK(pret_noapte>0),
    dimensiune_mp FLOAT NOT NULL CHECK(dimensiune_mp>0),
    tara VARCHAR(50) NOT NULL,
    oras VARCHAR(50) NOT NULL,
    adresa VARCHAR(100) NOT NULL,
    rating DECIMAL(3,2) CHECK(rating>=0 AND rating<=5),
    disponibil BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT into stays(nume_proprietate, descriere, tip_proprietate, facilitati, nr_dormitoare, nr_persoane, nr_bai, animal_friendly, balcon, imagine, pret_noapte, dimensiune_mp, tara, oras, adresa, rating, disponibil) VALUES
('New York Penthouse', 'Modern flat near Central Park with stunning city view in the heart of Manhattan', 'penthouse', ARRAY['wi-fi', 'cosmetics', 'parking spot', 'towels','air conditioner','smart tv'], 2, 4, 1, false, true, '/resurse/imagini/stays/nypenthouse.jpg', 370.00, 120.00, 'USA','New York','1 Times Square, Manhattan', 4.95, true),
('New York Apartment','Modern apartment with spectaculos view in the Times Square','apartment',ARRAY['wi-fi','cosmetics','parking spot', 'smart tv', 'gym'], 4, 6, 2, true, true, '/resurse/imagini/stays/nypenthouse.jpg', 570.00, 250.00, 'USA','New York', '7 Times Square, Manhattan', 5.00, true),
('Penthouse Bali', 'Perfect view in the heart of Bali', 'penthouse',ARRAY['wi-fi', 'cosmetics', 'parking spot', 'towels','air conditioner','smart tv'],4,4,2,true, true, 'resurse/imagini/stays/penthouse4.jpg', 700.00, 300.00, 'Indonesia', 'Bali', 'Cubic Street 78', 5.00, true );

INSERT INTO stays(nume_proprietate, descriere, tip_proprietate, facilitati, nr_dormitoare, nr_persoane, nr_bai, animal_friendly, balcon, imagine, pret_noapte, dimensiune_mp, tara, oras, adresa, rating, disponibil) VALUES

('Apartment Paris', 'Cozy apartment in the heart of Paris', 'apartment', ARRAY['wi-fi', 'cosmetics', 'parking spot', 'towels', 'air conditioner', 'smart tv'], 2, 4, 1, true, true, 'resurse/imagini/stays/apartment1.jpg', 250.00, 80.00, 'France', 'Paris', 'Rue de Rivoli 12', 4.80, true),

('Apartment Los Angeles', 'Modern apartment with city views in LA', 'apartment', ARRAY['wi-fi', 'cosmetics', 'parking spot', 'towels', 'air conditioner', 'smart tv'], 2, 4, 1, true, false, 'resurse/imagini/stays/apartment2.jpg', 300.00, 90.00, 'USA', 'Los Angeles', 'Sunset Boulevard 45', 4.70, true),

('Apartment Dubai', 'Luxury apartment in the heart of Dubai', 'apartment', ARRAY['wi-fi', 'cosmetics', 'parking spot', 'towels', 'air conditioner', 'smart tv'], 3, 6, 2, false, true, 'resurse/imagini/stays/apartment3.jpg', 450.00, 120.00, 'UAE', 'Dubai', 'Sheikh Zayed Road 88', 4.90, true),

('Apartment Grand Canyon', 'Stunning apartment near the Grand Canyon', 'apartment', ARRAY['wi-fi', 'towels', 'air conditioner', 'smart tv'], 2, 4, 1, true, true, 'resurse/imagini/stays/apartment4.jpg', 200.00, 75.00, 'USA', 'Grand Canyon', 'Canyon View Road 5', 4.60, true),

('Apartment Japan', 'Traditional apartment in the heart of Tokyo', 'apartment', ARRAY['wi-fi', 'cosmetics', 'towels', 'air conditioner', 'smart tv'], 2, 3, 1, false, true, 'resurse/imagini/stays/apartment5.jpg', 280.00, 65.00, 'Japan', 'Tokyo', 'Shinjuku Street 22', 4.75, true);


INSERT INTO stays(nume_proprietate, descriere, tip_proprietate, facilitati, nr_dormitoare, nr_persoane, nr_bai, animal_friendly, balcon, imagine, pret_noapte, dimensiune_mp, tara, oras, adresa, rating, disponibil) VALUES

('Mansion Hawaii', 'Luxurious mansion with ocean views in Hawaii', 'mansion', ARRAY['wi-fi', 'cosmetics', 'parking spot', 'towels', 'air conditioner', 'smart tv', 'pool', 'gym'], 5, 10, 3, true, true, 'resurse/imagini/stays/mansion1.jpg', 1200.00, 500.00, 'USA', 'Hawaii', 'Aloha Drive 1', 5.00, true),

('Mansion Chicago', 'Grand mansion in the heart of Chicago', 'mansion', ARRAY['wi-fi', 'cosmetics', 'parking spot', 'towels', 'air conditioner', 'smart tv', 'gym'], 6, 12, 4, false, true, 'resurse/imagini/stays/mansion2.jpg', 1500.00, 650.00, 'USA', 'Chicago', 'Lake Shore Drive 99', 4.90, true),

('Mansion Sydney', 'Stunning mansion with harbour views in Sydney', 'mansion', ARRAY['wi-fi', 'cosmetics', 'parking spot', 'towels', 'air conditioner', 'smart tv', 'pool'], 5, 10, 3, true, true, 'resurse/imagini/stays/mansion3.jpg', 1300.00, 580.00, 'Australia', 'Sydney', 'Harbour Bridge Road 7', 4.95, true);


INSERT INTO stays(nume_proprietate, descriere, tip_proprietate, facilitati, nr_dormitoare, nr_persoane, nr_bai, animal_friendly, balcon, imagine, pret_noapte, dimensiune_mp, tara, oras, adresa, rating, disponibil) VALUES

('House Maldives', 'Beautiful house with stunning ocean views in the Maldives', 'house', ARRAY['wi-fi', 'cosmetics', 'towels', 'air conditioner', 'smart tv', 'pool'], 3, 6, 2, false, true, 'resurse/imagini/stays/house1.jpg', 800.00, 200.00, 'Maldives', 'Male', 'Coral Beach Road 3', 5.00, true),

('House Malaysia', 'Tropical house surrounded by nature in Malaysia', 'house', ARRAY['wi-fi', 'towels', 'air conditioner', 'smart tv', 'parking spot'], 3, 5, 2, true, true, 'resurse/imagini/stays/house2.jpg', 350.00, 180.00, 'Malaysia', 'Kuala Lumpur', 'Jungle View Street 14', 4.70, true),

('House China', 'Traditional house in the heart of China', 'house', ARRAY['wi-fi', 'cosmetics', 'towels', 'air conditioner', 'smart tv'], 4, 7, 2, false, false, 'resurse/imagini/stays/house3.jpg', 400.00, 220.00, 'China', 'Beijing', 'Great Wall Avenue 8', 4.80, true),

('House Greece', 'Classic white house with sea views in Greece', 'house', ARRAY['wi-fi', 'cosmetics', 'towels', 'air conditioner', 'smart tv', 'pool'], 3, 6, 2, true, true, 'resurse/imagini/stays/house4.jpg', 550.00, 160.00, 'Greece', 'Santorini', 'Blue Dome Street 21', 4.95, true),

('House Manhattan', 'Modern house in the heart of Manhattan New York', 'house', ARRAY['wi-fi', 'cosmetics', 'parking spot', 'towels', 'air conditioner', 'smart tv'], 4, 8, 3, false, true, 'resurse/imagini/stays/house5.jpg', 900.00, 250.00, 'USA', 'New York', 'Manhattan Avenue 57', 4.85, true);
