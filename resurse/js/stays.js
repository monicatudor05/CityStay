window.onload = function () {

    //cel mai ieftin din fiecare categorie

    let staysAll = document.getElementsByClassName("stay-article")
    let categPret = {}

    for (let stay of staysAll) {
        let categ = stay.getElementsByClassName("val-categ")[0].innerHTML.trim()

        let price = parseFloat(stay.getElementsByClassName("val-price")[0].innerHTML.trim())

        if (!categPret[categ] || categPret[categ] > price) {
            categPret[categ] = {
                "price": price,
                "stay": stay
            }
        }
    }

    for (let categ in categPret) {
        let cheapestStay = categPret[categ].stay
        cheapestStay.classList.add("cheapest-stay")

        let figCaption = cheapestStay.querySelector("figure figcaption")
        if (figCaption) {
            let badge = document.createElement("div")
            figCaption.classList.add("no-counter")
            badge.className = "badge-ieftin"
            badge.innerHTML = "Cheapest " + categ + "!"
            figCaption.appendChild(badge)
        }
    }


    document.getElementById("inp-dim").onchange = function () {
        let val = this.value.trim()
        document.getElementsByClassName("info-range")[0].innerHTML = `(${val})`
    }


    document.getElementById("filtrare").onclick = function () {

        let inputCitynonValue = document.getElementById("inp-city")
        let inputCity = document.getElementById("inp-city").value.trim().toLowerCase()


        if (inputCity != "" && !inputCity.match(/^[a-zA-Z]+$/)) {
            alert("No digits in City")
            inputCitynonValue.value = ""
            return;

        }

        //trim -- pt  a sterge spaatiile din fata, si de dupa input

        let inpCategStay = ""
        let grupRadio = document.getElementsByName("gr_tip")
        let isToate = false;
        for (let rad of grupRadio) {
            if (rad.checked) {
                if (rad.value !== "all") {
                    inpCategStay = rad.value
                }
                else {
                    isToate = true;
                }
                break

            }
        }
        // pentru descriere
        let inpDescriere = document.getElementById("inp-descriere").value.trim().toLowerCase()
        let plusCuv = []
        let minusCuv = []

        if (inpDescriere != "") {
            let cuvinte = inpDescriere.split(" ").filter(c => c != "")

            for (let cuv of cuvinte) {
                if (cuv.startsWith("+")) {
                    plusCuv.push(cuv.substring(1))
                }
                else if (cuv.startsWith("-")) {
                    {
                        minusCuv.push(cuv.substring(1))
                    }
                }
            }
        }

        //bedrooms
        let inpBedrooms = document.getElementById("inp-bedrooms").value.trim()

        //animal friendly
        let inpAnimal = document.getElementById("inp-animal").checked



        //property name
        let inpProperty = document.getElementById("inp-nume").value.trim().toLowerCase()

        //guests
        let inpGuests = document.getElementById("inp-guests").value.trim()

        //price
        let inpPrice = document.getElementById("inp-price")


        let inpDimension = parseInt(document.getElementById("inp-dim").value.trim())

        let stays = document.getElementsByClassName("stay-article")


        let numarAfisate = 0;

        for (let stay of stays) {
            stay.style.display = "none"
            //ascund proprietatile la inceput
            //.style.display="none" accesez stylingul si l manipulez

            let city = stay.getElementsByClassName("city-name")[0].innerHTML.trim().toLowerCase()

            let cond1 = city.includes(inputCity)

            let categorieStay = (stay.getElementsByClassName("val-categ")[0].innerHTML.trim())
            let cond2 = (categorieStay === inpCategStay) || isToate;

            let dimension = parseInt(stay.getElementsByClassName("val-dimensiune")[0].innerHTML.trim())

            //descriere
            let descriere = (stay.getElementsByClassName("val-descriere"))[0].innerHTML.trim().toLowerCase()
            let cond4 = true
            if (plusCuv.length > 0 || minusCuv.length > 0) {
                let hasPlus = plusCuv.length === 0 || plusCuv.some(cuv => descriere.includes(cuv))
                //hasPlus = true mereu
                let hasMinus = minusCuv.some(cuv => descriere.includes(cuv))
                //hasMinus = true cand sunt cuvinte cu -
                //         =false cand nu sunt

                cond4 = hasPlus && !hasMinus

            }

            //price

            let selectedPrice = Array.from(inpPrice.selectedOptions).map(opt => opt.value)
            let price = parseFloat(stay.getElementsByClassName("val-price")[0].innerHTML.trim())

            let cond5 = true;

            if (selectedPrice.length > 0) {

                cond5 = selectedPrice.some(interval => {
                    let [min, max] = interval.split("-").map(Number)
                    return price >= min && price <= max
                })
            }

            //name property
            let numeProp = stay.getElementsByClassName("val-name")[0].innerHTML.trim().toLowerCase()

            let cond7 = numeProp.includes(inpProperty)


            //bedrooms
            let cond9 = true
            if (inpBedrooms != "") {
                let bedrooms = parseInt(stay.getElementsByClassName("val-bedrooms")[0].innerHTML.trim())
                if (inpBedrooms == "4") {
                    cond9 = bedrooms >= 4
                }
                else {
                    cond9 = bedrooms === parseInt(inpBedrooms)
                }

            }

            //animal-friendy
            let cond8 = true
            if (inpAnimal) {
                let pet = stay.getElementsByClassName("val-pet")[0].innerHTML.trim()
                cond8 = pet.includes("✅")
            }

            //guests
            let cond6 = true;
            if (inpGuests != "") {
                let guests = parseInt(stay.getElementsByClassName("val-guests")[0].innerHTML.trim())
                cond6 = parseInt(inpGuests) <= guests
            }




            let cond3 = dimension >= inpDimension



            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8 && cond9) {
                stay.style.display = "block"
                numarAfisate++;
                //acum o afisez
            }

            console.log({
                cond1, cond2, cond3, cond4, cond5, cond6, cond7, cond8, cond9,
                city, inputCity,
                categorieStay, inpCategStay, isToate,
                dimension, inpDimension
            })



        }
        let mesaj = document.getElementsByClassName("mesaj-gol")[0]

        if (numarAfisate == 0) {
            mesaj.style.display = "block"
        }
        else {
            mesaj.style.display = "none"
        }

    }

    document.getElementById("reset").onclick = function () {
        let resp = confirm("Important! If restarted all information is deleted")
        if (resp) {
            document.getElementById("inp-city").value = ""
            document.getElementById("inp-dim").value = "0"
            document.getElementsByClassName("info-range")[0].innerHTML = "(0)"
            document.getElementById("inp-nume").value = ""
            document.querySelector("input[name='gr_tip'][value='all']").checked = true
            document.getElementById("inp-animal").checked = false
            document.getElementById("inp-bedrooms").value = ""
            let price = document.getElementById("inp-price")
            for (let opt of price.options) { opt.selected = false }

            document.getElementsByClassName("mesaj-gol")[0].style.display = "none"
            document.getElementById("inp-guests").value = "1"
            document.getElementById("inp-descriere").value = ""

            let stays = document.getElementsByClassName("stay-article")
            for (let stay of stays) { stay.style.display = "block" }


        }


    }

    function sorteaza(semn) {

        // semn=+1 sortare crecatoare
        // semn =-1 sortare descresc
        //dupa pret si nume
        let stays = document.getElementsByClassName
            ("stay-article")

        let vStays = Array.from(stays)
        console.log(vStays)

        vStays.sort(function (a, b) {
            let pret_A = parseFloat(a.getElementsByClassName("val-price")[0].innerHTML.trim())
            let pret_B = parseFloat(b.getElementsByClassName("val-price")[0].innerHTML.trim())

            if (pret_A == pret_B) {
                let nume_A = a.getElementsByClassName("val-name")[0].innerHTML.trim().toLowerCase()
                let nume_B = b.getElementsByClassName("val-name")[0].innerHTML.trim().toLowerCase()

                return semn * nume_A.localeCompare(nume_B)
                //localeCompare compara pe bazaa alafabetului idn pagina setataa, adica dac pag e in engl se uita la alf en
            }

            return semn * (pret_A - pret_B)

            //innerHTML -> luam continutul lor, adica ce se vede in browser

        })

        for (let stay of vStays) {
            stay.parentElement.appendChild(stay)
        }

    }


    document.getElementById("sortCrescNume").onclick = function () { sorteaza(1) }
    document.getElementById("sortDescrescNume").onclick = function () { sorteaza(-1) }


    window.onkeydown = function (e) {
        if (e.code == "KeyC" && e.altKey) {
            let stays = document.getElementsByClassName
                ("stay-article")

            let suma = 0

            for (let stay of stays) {
                if (stay.style.display != "none") {
                    suma += parseFloat(stay.getElementsByClassName("val-price")[0].innerHTML.trim())
                }
            }

            let p = this.document.getElementById("infoSuma")
            if (!p) {
                p = this.document.createElement("p")
                p.innerHTML = suma
                p.id = "infoSuma"
                let sectiuneFiltre = this.document.getElementsByClassName("content-area")[0]

                sectiuneFiltre.append(p)
                this.setTimeout(function () {
                    let p1 = document.getElementById("infoSuma")
                    p1.remove()

                }, 2000)
            }
            else {
                p.innerHTML = "Total" + suma
            }




        }
    }


}
