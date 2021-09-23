import { eventDataToString, eventTypeToString } from "./EventHelper";

export class ListView {
    element = null;
    ppq = 0;
    constructor(element) {
        this.element = element;
    }

    update(midifile) {
        this.ppq = midifile.header.getTicksPerBeat();
        this.render(midifile);
    }

    addDate(row, val) {
        const td = document.createElement("td");
        td.innerText = val;
        row.appendChild(td);
    }

    renderEvent(row, event) {
        console.log(event)
        const time = event.playTime / this.ppq;
        this.addDate(row, event.track);
        this.addDate(row, time.toFixed(6));
        this.addDate(row, event.channel !== undefined ? event.channel : "-");
        this.addDate(row, eventTypeToString(event));
        this.addDate(row, eventDataToString(event));
    }

    render(midifile) {
        const table = document.createElement("table");
        table.className = "wm-dbg-listview";
        const header = document.createElement("thead");
        table.appendChild(header);
        const row = document.createElement("tr");
        header.appendChild(row);
        this.addDate(row, 'Track')
        this.addDate(row, 'Time (qtrs)')
        this.addDate(row, 'Channel')
        this.addDate(row, 'Type')
        this.addDate(row, 'Data')
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