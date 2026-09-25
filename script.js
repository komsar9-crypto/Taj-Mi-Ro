const supabaseUrl = "https://naksuazwneyfywkrcnjw.supabase.co";
const supabaseKey = "sb_publishable_LKiNARi0BHwZkM4HofcZnA_IVsxS4Ul";

const supabase1 = window.supabase.createClient(supabaseUrl, supabaseKey);

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
          .single();

    if (error) {
        console.error("Błąd pobierania losowania:", error);
    }
    return data.Wylosowano;
};

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
    const { error } = await supabase1
        .from("Prezenty")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Błąd usuwania prezentu:", error);
        return false;
    }

    return true;
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

    const zapisanaLista = localStorage.getItem(
        "lista_" + zapisanaOsoba
    );

    listaZyczen.innerHTML = "";

    if (zapisanaLista) {

        const prezenty = JSON.parse(zapisanaLista);

     prezenty.forEach(function(prezent) {

        const element = document.createElement("li");

        element.textContent = prezent.nazwa + " "; 
   
        if (prezent.link !== "") {

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
}

} else {

    powitanie.textContent = "Nie znaleziono takiej osoby";
}
});

//===Losowanie===//

przycisklosuj.addEventListener("click", async function() {

    const zapisanaOsoba = localStorage.getItem(
    "wylosowana_" + ZalogowanyUzytkownik
);

     const OsobyDoWylosowania = [...uczestnicy];

    OsobyDoWylosowania.splice(
        OsobyDoWylosowania.indexOf(ZalogowanyUzytkownik),
        1
    );

    
        const indeks = Math.floor(
            Math.random() * OsobyDoWylosowania.length
        );

       const WylosowanaOsoba = OsobyDoWylosowania[indeks];

    const zapisano = await zapiszWylosowanaOsobe(
    ZalogowanyUzytkownik,
    WylosowanaOsoba
);

if (!zapisano) {
    alert("Nie udało się zapisać wyniku losowania.");
    return;
}

 WynikLosowania.textContent = "Twoją osobą jest " + WylosowanaOsoba + " a oto jej lista życzeń:";

const zapisanaLista = localStorage.getItem(
           "lista_" + WylosowanaOsoba
       );

 listaZyczen.innerHTML = "";

 if (zapisanaLista) {

    const prezenty = JSON.parse(zapisanaLista);

    prezenty.forEach(function(prezent) {

        const element = document.createElement("li");

        element.textContent = prezent;

        listaZyczen.appendChild(element);
    });

} else {

    listaZyczen.innerHTML =
        "<li>Ta osoba nie ma jeszcze zapisanej listy.</li>";

}
    
przycisklosuj.style.display="none";
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

            przyciskUsun.addEventListener("click", function() {
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
