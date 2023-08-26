// ==UserScript==
// @name         LSS Krankenhausbesitzer
// @namespace    www.leitstellenspiel.de
// @version      1.0
// @description  Zeigt den Namen des Besitzers eines Krankenhauses im Sprechwunsch an.
// @author       MissSobol
// @match        https://www.leitstellenspiel.de/vehicles/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Funktion zum Pausieren (Warten) für eine gegebene Anzahl von Millisekunden
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Hauptfunktion, die die Tabelle bearbeitet
    async function processTable() {
        // Alle Zeilen in der Tabelle auswählen
        const rows = document.querySelectorAll('#alliance-hospitals tbody tr');
        for (const row of rows) {
            // Das Element mit der Gebäude-ID finden
            const hospitalIdElement = row.querySelector('[id^="div_free_beds_"]');
            if (hospitalIdElement) {
                // Die Gebäude-ID aus dem Element extrahieren
                const hospitalId = hospitalIdElement.id.replace('div_free_beds_', '');
                // Eine Anfrage an die Gebäude-URL senden, um den Besitzer zu finden
                const response = await fetch(`https://www.leitstellenspiel.de/buildings/${hospitalId}`);
                const responseText = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(responseText, 'text/html');
                // Den Namen des Besitzers auswählen, wenn vorhanden
                const ownerNameElement = doc.querySelector('a[href^="/profile/"]');
                if (ownerNameElement) {
                    // Den Namen des Besitzers extrahieren und das Gebäudenamen-Element in der Zeile auswählen
                    const ownerName = ownerNameElement.textContent.trim();
                    const buildingNameElement = row.querySelector('td:first-child');
                    // Den Besitzernamen als Tooltip setzen
                    buildingNameElement.title = `Besitzer: ${ownerName}`;
                }
            }
            // Eine kurze Pause von 100 ms einlegen, bevor die nächste Anfrage gesendet wird
            await sleep(100);
        }
    }

    // Beobachter erstellen, um auf Änderungen im DOM zu reagieren
    const observer = new MutationObserver(() => {
        // Die Zieltabelle auswählen
        const targetTable = document.getElementById('alliance-hospitals');
        if (targetTable) {
            // Die Tabelle bearbeiten
            processTable();
            // Den Beobachter deaktivieren, nachdem die Tabelle bearbeitet wurde
            observer.disconnect();
        }
    });

    // Den Beobachter starten, um Änderungen im DOM zu überwachen
    observer.observe(document, { childList: true, subtree: true });
})();
