console.log("JS loaded!");
console.log(document.getElementById('aptCard'));


const apartments = [
    { name: "Parisian Apartment", location: "Paris • 2 guests", rating: "★★★★★" },
    { name: "Northern Lights Igloo", location: "Northway • 2 guests", rating: "★★★★★" },
    { name: "Japan Temple", location: "Kyoto • 4 guests", rating: "★★★★★" },
    { name: "Beach Bungalow", location: "Maldives • 2 guests", rating: "★★★★★" },
    { name: "Cozy Cabin", location: "Edinburgh • 4 guests", rating: "★★★★★" },
    { name: "Penthouse - New York", location: "New York • 2 guests", rating: "★★★★★" }
]

const card = document.getElementById('aptCard');
const images = card.querySelectorAll('img');
const aptName = document.getElementById('aptName');
const aptLocation = document.getElementById('aptLocation');
const rating = document.getElementById('aptRating');

let current = 0;

function goTo(index) {
    images[current].classList.remove('active');
    current = (index + apartments.length) % apartments.length;
    images[current].classList.add('active');
    aptName.textContent = apartments[current].name;
    aptLocation.textContent = apartments[current].location;
    rating.textContent = apartments[current].rating;
}

card.addEventListener('mouseenter', () => {
    goTo(current + 1);
});

card.addEventListener('click', () => {
    goTo(current + 1);
});