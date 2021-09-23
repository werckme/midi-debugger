import { eventDataToString, eventTypeToString, getNumberOfTracks } from "./MidiHelper";
import { CheckboxFilterGroup } from './CheckboxFilterGroup';
import * as _ from 'lodash';

export class ListView {
    element = null;
    ppq = 0;
    trackFilter = new CheckboxFilterGroup();
    eventList = null;
    constructor(element) {
        this.element = element;
    }

    update(midifile) {
        this.element.innerHTML = '';
        const numberOfTracks = getNumberOfTracks(midifile);
        const trackFilterElement = this.trackFilter.createElement(_.range(numberOfTracks));
        this.trackFilter.onSelectionChanged = () => {
            this.render(midifile);
        };
        this.element.appendChild(trackFilterElement);
        this.ppq = midifile.header.getTicksPerBeat();
        this.render(midifile);
    }

    addDate(_title, row, val) {
        const td = document.createElement("td");
        td.innerText = val;
        row.appendChild(td);
    }

    renderEvent(container, event) {
        const time = event.playTime / this.ppq;
        const type = eventTypeToString(event);
        container.classList.add(`track-${event.track}`);
        container.classList.add(_.kebabCase(type));
        this.addDate('tr', container, event.track);
        this.addDate('tm', container, time.toFixed(6));
        this.addDate('ch', container, event.channel !== undefined ? event.channel : "-");
        this.addDate('ty', container, type);
        this.addDate('dt', container, eventDataToString(event));
    }

    render(midifile) {
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
            const isTrackSelected = this.trackFilter.selected[event.track];
            if (!isTrackSelected) {
                continue;
            }
            const row = document.createElement("tr");
            tbody.appendChild(row);
            this.renderEvent(row, event);
        }
        this.element.appendChild(this.eventList);
    }
}