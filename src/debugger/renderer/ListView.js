import { eventDataToString, eventTypeToString, getNumberOfTracks, getTracks } from "./MidiHelper";
import { CheckboxFilterGroup } from './CheckboxFilterGroup';
import * as _ from 'lodash';

export class ListView {
    element = null;
    ppq = 0;
    eventList = null;
    trackFilter;
    constructor(element, trackFilter) {
        this.element = element;
        this.trackFilter = trackFilter;
    }

    update(midifile) {
        this.element.innerHTML = '';
        this.ppq = midifile.header.getTicksPerBeat();
        this.render(midifile);
    }

    addDate(row, val) {
        const td = document.createElement("td");
        td.innerText = val;
        row.appendChild(td);
    }

    renderEvent(container, event) {
        const type = eventTypeToString(event);
        container.classList.add(`wm-dbg-track-${event.track}`);
        container.classList.add(_.kebabCase(type));
        this.addDate(container, event.track);
        this.addDate(container, this.quarters.toFixed(6));
        this.addDate(container, event.channel !== undefined ? event.channel : "-");
        this.addDate(container, type);
        this.addDate(container, eventDataToString(event));
    }
    quarters = 0;
    render(midifile) {
        this.quarters = 0;
        if (!this.eventList) {
            this.eventList = document.createElement("table");
        } else {
            this.eventList.innerHTML = '';
        }
        this.eventList.className = "wm-dbg-listview";
        const header = document.createElement("thead");
        this.eventList.appendChild(header);
        const row = document.createElement("tr");
        header.appendChild(row);
        this.addDate(row, 'Track')
        this.addDate(row, 'Time (qtrs)')
        this.addDate(row, 'Channel')
        this.addDate(row, 'Type')
        this.addDate(row, 'Data')
        const tbody = document.createElement("tbody");
        this.eventList.appendChild(tbody);
        for (const event of midifile.getEvents()) {
            this.quarters += event.delta / this.ppq;
            const isTrackSelected = this.trackFilter.selected[event.track];
            if (!isTrackSelected && this.trackFilter.initalized) {
                continue;
            }
            const row = document.createElement("tr");
            tbody.appendChild(row);
            this.renderEvent(row, event);
        }
        this.element.appendChild(this.eventList);
    }
}