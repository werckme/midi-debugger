import { eventDataToString, eventTypeToString, getNumberOfTracks, getTracks } from "./MidiHelper";
import { CheckboxFilterGroup } from './CheckboxFilterGroup';
import * as _ from 'lodash';
import { AView } from "./AView";

const eventTextChildIndex = 4;
const foundBySearch = 'found-by-search';

export class ListView extends AView {
    element = null;
    ppq = 0;
    eventList = null;
    trackFilter;
    constructor(element, trackFilter) {
        super();
        this.element = element;
        this.trackFilter = trackFilter;
    }

    clearSearch() {
        const rows = document.querySelectorAll(`.${foundBySearch}`);
        for(const row of rows) {
            row.classList.remove(foundBySearch);
        }
    }

    search(term) {
        this.clearSearch();
        term = (term || '').trim();
        if (!term) {
            return;
        }
        const rows = document.querySelectorAll('.wm-dbg-listview tbody tr');
        const results = [];
        // don't know why having two arrays is faster than the previous version 
        // where filter and adding the class was done in one for loop (it crashes with a higher amount of matches)
        for(const row of rows) {
            if (!row.innerText.includes(term)) {
                continue;
            }
            results.push(row);
        }
        for(const row of results) {
            row.classList.add(foundBySearch);
        }
    }

    update(midifile) {
        this.clear();
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
        container.classList.add(`wm-dbg-track-${event.track||0}`);
        container.classList.add(_.kebabCase(type));
        this.addDate(container, event.track||0);
        this.addDate(container, this.quarters.toFixed(6));
        this.addDate(container, event.channel !== undefined ? event.channel : "-");
        this.addDate(container, type);
        this.addDate(container, eventDataToString(event));
    
    }

    updateEventLabelImpl(element, htmlText) {
        element.childNodes[eventTextChildIndex].innerHTML = htmlText;
    }

    getEventLabelImpl(element) {
        return element.childNodes[eventTextChildIndex].innerHTML;
    }

    quarters = 0;
    render(midifile) {
        this.beginRender();
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
            const trackIndex = event.track || 0;
            this.visitTrack(trackIndex);
            this.quarters += event.delta / this.ppq;
            const isTrackSelected = this.trackFilter.selected[trackIndex];
            if (!isTrackSelected && this.trackFilter.initalized) {
                continue;
            }
            const row = document.createElement("tr");
            tbody.appendChild(row);
            this.renderEvent(row, event);
            this.visitEventElement(trackIndex, row);
        }
        this.element.appendChild(this.eventList);
        this.endRender();
    }
}