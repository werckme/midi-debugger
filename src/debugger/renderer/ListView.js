export class ListView {
    element = null;
    constructor(element) {
        this.element = element;
    }

    update(midifile) {
        this.render(midifile);
    }

    addDate(row, val) {
        const td = document.createElement("td");
        td.innerText = val;
        row.appendChild(td);
    }

    renderEvent(row, event) {
        console.log(event)
        this.addDate(row, event.track);
        this.addDate(row, event.playTime);
        this.addDate(row, `${event.index} ${event.param1 || ""} ${event.param2 || ""}`);
    }

    render(midifile) {
        const table = document.createElement("table");
        const header = document.createElement("thead");
        table.appendChild(header);
        const row = document.createElement("tr");
        header.appendChild(row);
        this.addDate(row, 'Track')
        this.addDate(row, 'Ticks')
        this.addDate(row, 'Event')
        const tbody = document.createElement("tbody");
        table.appendChild(tbody);
        for (const event of midifile.getEvents()) {
            const row = document.createElement("tr");
            tbody.appendChild(row);
            this.renderEvent(row, event);
        }
        this.element.appendChild(table);
    }
}