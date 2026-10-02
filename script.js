console.log("SCRIPT DZIAŁA");
const supabaseUrl = "https://naksuazwneyfywkrcnjw.supabase.co";
const supabaseKey = "sb_publishable_LKiNARi0BHwZkM4HofcZnA_IVsxS4Ul";

const supabase1 = window.supabase.createClient(supabaseUrl, supabaseKey);

const poleHaslo = document.getElementById("haslo");
const przyciskWejdz = document.getElementById("wejdz");
const bramkaHasla = document.getElementById("bramkaHasla");
const stronaGlowna = document.getElementById("stronaGlowna");
const komunikatHasla = document.getElementById("komunikatHasla");

if (localStorage.getItem("dostepDoStrony") === "true") {

    bramkaHasla.style.display = "none";
    stronaGlowna.style.display = "block";

}

przyciskWejdz.addEventListener("click", async function() {

    const haslo = poleHaslo.value;

    if (haslo === "") {
        komunikatHasla.textContent = "Wpisz hasło.";
        return;
    }

    const { data, error } = await supabase1
        .rpc("sprawdz_haslo", {
            wpisane_haslo: haslo
        });

    if (error) {
        console.error("Błąd sprawdzania hasła:", error);
        komunikatHasla.textContent = "Wystąpił błąd.";
        return;
    }

    if (data === true) {

        localStorage.setItem("dostepDoStrony", "true");
        
        bramkaHasla.style.display = "none";
        stronaGlowna.style.display = "block";
    } else {
        komunikatHasla.textContent = "Nieprawidłowe hasło.";
        poleHaslo.value = "";
    }
});

poleHaslo.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        przyciskWejdz.click();
    }

});

let uczestnicy = [];
async function pobierzUczestnikow() {
    const { data, error } = await supabase1
        .from("Uczestnicy")
        .select("Imiona");

    if (error) {
        console.error("Błąd pobierania uczestników:", error);
        return;
    }

    uczestnicy = data.map(function(osoba) {
        return osoba.Imiona;
    });

    console.log("Pobrani uczestnicy:", uczestnicy);
}

const uczestnicyGotowi = pobierzUczestnikow();

async function pobierzWylosowanaOsobe(imie) {
    const { data, error } = await supabase1
        .from("Losowanie")
        .select("Wylosowano")
        .eq("imię", imie)
        .maybeSingle();

    if (error) {
        console.error("Błąd pobierania losowania:", error);
        return null;
    }

    if (!data) {
        return null;
    }

    return data.Wylosowano;
}
async function pobierzWszystkieWylosowaneOsoby() {

    const { data, error } = await supabase1
        .from("Losowanie")
        .select("Wylosowano")
        .not("Wylosowano", "is", null);

    if (error) {
        console.error("Błąd pobierania wylosowanych osób:", error);
        return [];
    }

    return data.map(function(wiersz) {
        return wiersz.Wylosowano;
    });
}

async function zapiszWylosowanaOsobe(imie, wylosowanaOsoba) {
    const { error } = await supabase1
        .from("Losowanie")
        .update({
            Wylosowano: wylosowanaOsoba
        })
        .eq("imię", imie);

    if (error) {
        console.error("Błąd zapisywania losowania:", error);
        return false;
    }

    return true;
}
async function pobierzListeZyczen(imie) {
    const { data, error } = await supabase1
        .from("Prezenty")
        .select("id, Prezent, link")
        .eq("imię", imie);

    if (error) {
        console.error("Błąd pobierania listy życzeń:", error);
        return [];
    }

    return data;
}
async function zapiszPrezent(imie, nazwa, link) {
    const { data, error } = await supabase1
        .from("Prezenty")
        .insert({
            "imię": imie,
            "Prezent": nazwa,
            "link": link
        })
        .select("id")
        .single();

    if (error) {
        console.error("Błąd zapisywania prezentu:", error);
        return null;
    }
    return data.id;
}
async function usunPrezent(id) {
    const { data, error } = await supabase1
        .from("Prezenty")
        .delete()
        .eq("id", id)
        .select();

    if (error) {
        console.error("Błąd usuwania prezentu:", error);
        return false;
    }

    console.log("Usunięte rekordy:", data);

    return data.length > 0;
}
// Pobieranie elementów strony aby móc nimi sterować w JvaScript //

const poleImie = document.getElementById("imie");
const przycisk = document.getElementById("logowanie");
const przycisklosuj = document.getElementById("losuj");
const powitanie = document.getElementById("powitanie");
const logowanieBox = document.getElementById("logowanieBox");
const WynikLosowania = document.getElementById("WynikLosowania");
const listaZyczen = document.getElementById("listaZyczen");
const listaBox = document.getElementById("listaBox");
const polePrezent = document.getElementById("prezent");
const poleLink = document.getElementById("link");
const przyciskDodaj = document.getElementById("dodaj");
const mojaLista = document.getElementById("mojaLista");
const przyciskZapisz = document.getElementById("zapisz");
const przyciskEdytuj = document.getElementById("edytuj");

let ZalogowanyUzytkownik = "";

przycisk.addEventListener("click", async function() {
    await uczestnicyGotowi;
    const imie = poleImie.value;
if (uczestnicy.includes(imie)) {

    ZalogowanyUzytkownik = imie;

    powitanie.textContent = "Witaj " + imie +"!";

    logowanieBox.style.display = "none";

 listaBox.style.display = "block";

      const mojaZapisanaLista = await pobierzListeZyczen(
    ZalogowanyUzytkownik
);

mojaLista.innerHTML = "";

mojaZapisanaLista.forEach(function(prezent) {

    const element = document.createElement("li");

    element.dataset.id = prezent.id;

    element.textContent = prezent.Prezent + " ";

    if (prezent.link) {

        const linkElement = document.createElement("a");

        linkElement.href = prezent.link;
        linkElement.textContent = "[link]";
        linkElement.target = "_blank";

        element.appendChild(linkElement);
    }

    mojaLista.appendChild(element);
}); 

    przycisklosuj.style.display = "block";

       const zapisanaOsoba = await pobierzWylosowanaOsobe(
        ZalogowanyUzytkownik
    );

    if (zapisanaOsoba) {

        WynikLosowania.textContent =
            "Twoją osobą jest " + zapisanaOsoba +
            " a oto jej lista życzeń:";

        przycisklosuj.style.display = "none";

        const zapisanaLista = await pobierzListeZyczen(
            zapisanaOsoba
        );

        listaZyczen.innerHTML = "";

        if (zapisanaLista.length > 0) {

            zapisanaLista.forEach(function(prezent) {

                const element = document.createElement("li");

                element.textContent = prezent.Prezent + " ";

                if (prezent.link) {

                    const linkElement = document.createElement("a");

                    linkElement.href = prezent.link;
                    linkElement.textContent = "[link]";
                    linkElement.target = "_blank";

                    element.appendChild(linkElement);
                }

                listaZyczen.appendChild(element);

            });

        } else {

            listaZyczen.innerHTML =
                "<li>Ta osoba nie ma jeszcze zapisanej listy.</li>";

        }
       } else {
            // Jeśli zalogowany użytkownik jeszcze nikogo nie wylosował:
            WynikLosowania.textContent = "Jeszcze nikogo nie wylosowano.";
            // Powitanie zostaje nienaruszone, więc "Witaj Radek!" nadal tam będzie!
        }
        
    } else {
        // Jeśli ktoś wpisze imię, którego w ogóle nie ma na liście:
        powitanie.textContent = "Nie ma takiej osoby na liście uczestników.";
    }
});
//===Losowanie===//

przycisklosuj.addEventListener("click", async function() {

    // Sprawdzamy, czy użytkownik już wcześniej wylosował osobę
    const zapisanaOsoba = await pobierzWylosowanaOsobe(
        ZalogowanyUzytkownik
    );

    if (zapisanaOsoba) {

        alert("Masz już wylosowaną osobę: " + zapisanaOsoba);
        return;
    }


    // Pobieramy osoby, które zostały już wylosowane przez innych
    const juzWylosowane = await pobierzWszystkieWylosowaneOsoby();


    // Tworzymy pulę wszystkich uczestników
    const OsobyDoWylosowania = uczestnicy.filter(function(osoba) {

        // Nie można wylosować samego siebie
        if (osoba === ZalogowanyUzytkownik) {
            return false;
        }

        // Nie można wylosować osoby, która już została wylosowana
        if (juzWylosowane.includes(osoba)) {
            return false;
        }

        return true;
    });


    console.log("Zalogowany użytkownik:", ZalogowanyUzytkownik);
    console.log("Już wylosowane:", juzWylosowane);
    console.log("Dostępne osoby:", OsobyDoWylosowania);


    // Jeżeli nie ma już nikogo do wylosowania
    if (OsobyDoWylosowania.length === 0) {

        alert("Nie ma już żadnej osoby, którą można wylosować.");
        return;
    }


    // Losujemy osobę z dostępnej puli
    const indeks = Math.floor(
        Math.random() * OsobyDoWylosowania.length
    );

    const WylosowanaOsoba = OsobyDoWylosowania[indeks];


    // Zapisujemy wynik w Supabase
    const zapisano = await zapiszWylosowanaOsobe(
        ZalogowanyUzytkownik,
        WylosowanaOsoba
    );


    if (!zapisano) {

        alert("Nie udało się zapisać wyniku losowania.");
        return;
    }


    // Wyświetlamy wynik
    WynikLosowania.textContent =
        "Twoją osobą jest " + WylosowanaOsoba +
        " a oto jej lista życzeń:";


    // Pobieramy prawdziwą listę życzeń z Supabase
    const zapisanaLista = await pobierzListeZyczen(
        WylosowanaOsoba
    );


    listaZyczen.innerHTML = "";


    if (zapisanaLista.length > 0) {

        zapisanaLista.forEach(function(prezent) {

            const element = document.createElement("li");

            element.textContent = prezent.Prezent + " ";


            if (prezent.link) {

                const linkElement = document.createElement("a");

                linkElement.href = prezent.link;
                linkElement.textContent = "[link]";
                linkElement.target = "_blank";

                element.appendChild(linkElement);
            }


            listaZyczen.appendChild(element);
        });

    } else {

        listaZyczen.innerHTML =
            "<li>Ta osoba nie ma jeszcze zapisanej listy.</li>";
    }


    // Ukrywamy przycisk po udanym losowaniu
    przycisklosuj.style.display = "none";
});


przyciskDodaj.addEventListener("click", function(){

 const prezent = polePrezent.value;
 const link = poleLink.value;

 if (prezent !== "") {

 const element = document.createElement("li");
 
element.textContent = prezent + " ";

 if (link !== "") { 

const linkElement = document.createElement("a");

 linkElement.href = link;
 linkElement.textContent = "[link]";
 linkElement.target = "_blank";

 element.appendChild(linkElement);

 }

 mojaLista.appendChild(element);

 polePrezent.value = "";
 poleLink.value = "";

 } 

});

przyciskZapisz.addEventListener("click", async function() {

    const elementy = mojaLista.querySelectorAll("li");

    for (const element of elementy) {

        const id = element.dataset.id;

        // Jeżeli prezent nie ma id,
        // oznacza to, że jest nowy
        if (!id) {

            const linkElement = element.querySelector("a");

            const nazwa = linkElement
                ? element.childNodes[0].textContent.trim()
                : element.textContent.trim();

            const link = linkElement
                ? linkElement.href
                : "";

            const noweId = await zapiszPrezent(
                ZalogowanyUzytkownik,
                nazwa,
                link
            );

            if (!noweId) {
                alert("Nie udało się zapisać listy.");
                return;
            }

            element.dataset.id = noweId;
        }
    }

    alert("Twoja lista została zapisana!");
});
let trybEdycji = false;

przyciskEdytuj.addEventListener("click", function() {

    trybEdycji = !trybEdycji;

    const elementy = mojaLista.querySelectorAll("li");

    elementy.forEach(function(element) {

        if (trybEdycji) {

       const przyciskUsun = document.createElement("button");

przyciskUsun.textContent = "Usuń";
przyciskUsun.classList.add("przyciskUsun");

przyciskUsun.addEventListener("click", async function() {

    const id = element.dataset.id;
    console.log("Usuwam prezent o ID:", id);

    if (id) {

        const usunieto = await usunPrezent(id);

        if (!usunieto) {
            alert("Nie udało się usunąć prezentu.");
            return;
        }
    }

    element.remove();
});

element.appendChild(przyciskUsun);

        } else {

            const przyciskUsun = element.querySelector(".przyciskUsun");

            if (przyciskUsun) {
                przyciskUsun.remove();
            }

        }

    });

});

poleImie.addEventListener("keydown", function(event){

    if (event.key === "Enter") {
       przycisk.click();
}
});

polePrezent.addEventListener("keydown", function(event){
     if (event.key === "Enter") {
        przyciskDodaj.click();
}
});

const dataDocelowa = new Date("2026-10-30T18:00:00");

function odliczanie() {
    const teraz = new Date();
    const roznica = dataDocelowa - teraz;

    if (roznica <= 0) {
        document.getElementById("timer").textContent = "🎄 To już ten dzień!";
        return;
    }

    const dni = Math.floor(roznica / (1000 * 60 * 60 * 24));
    const godziny = Math.floor((roznica / (1000 * 60 * 60)) % 24);
    const minuty = Math.floor((roznica / (1000 * 60)) % 60);
    const sekundy = Math.floor((roznica / 1000) % 60);

    document.getElementById("timer").textContent =
        `${dni} dni ${godziny} godz. ${minuty} min. ${sekundy} sek.`;
}

odliczanie();
setInterval(odliczanie, 1000);
