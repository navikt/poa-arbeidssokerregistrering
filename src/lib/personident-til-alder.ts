/* 
Kopiert fra https://github.com/navikt/familie-ef-soknad/blob/master/src/overgangsst%C3%B8nad/utils.ts
og bearbeidet litt
*/

export const personidentTilAlder = (fnrEllerDnr: string, dato?: string): number => {
    const førsteSiffer = parseInt(fnrEllerDnr[0], 10);

    let fnr = '';

    if (førsteSiffer > 3) {
        fnr = (førsteSiffer - 4).toString() + fnrEllerDnr.substring(1, fnrEllerDnr.length);
    } else {
        fnr = fnrEllerDnr;
    }

    const nå = dato ? new Date(dato) : new Date();

    const årNå = nå.getFullYear();
    const årNåKortform = parseInt(årNå.toString().substring(2, 4), 10);
    const detteÅrhundre = parseInt(årNå.toString().substring(0, 2), 10);
    const forrigeÅrhundre = detteÅrhundre - 1;
    const månedNå = nå.getMonth() + 1;
    const dagNå = nå.getDate();

    const dag = parseInt(fnr.substring(0, 2), 10);
    const måned = parseInt(fnr.substring(2, 4), 10);
    const stringÅr = fnr.substring(4, 6);

    let år =
        parseInt(stringÅr) < årNåKortform
            ? parseInt(`${detteÅrhundre}${stringÅr}`, 10)
            : parseInt(`${forrigeÅrhundre}${stringÅr}`, 10);

    let alder = årNå - år;

    if (månedNå < måned) {
        alder--;
    }

    if (måned === månedNå && dagNå < dag) {
        alder--;
    }

    return alder;
};
