import { eventDataToString, eventTypeToString, getNumberOfTracks } from "./MidiHelper";
import { CheckboxFilterGroup } from './CheckboxFilterGroup';
import * as _ from 'lodash';
import { ListView } from "./ListView";

export class DataFlowView extends ListView {
    element = null;
    ppq = 0;
    trackFilter = new CheckboxFilterGroup();
    eventList = null;
    constructor(element) {
        super(element);
        this.element = element;
    }

    addDate(row, val) {
        const td = document.createElement("div");
        td.innerText = `${val}`;
        row.appendChild(td);
    }

    render(midifile) {
        if (!this.eventList) {
            this.eventList = document.createElement("div");
        } else {
            this.eventList.innerHTML = '';
        }
        this.eventList.className = "wm-dbg-dataflowview";
        const eventsContainer = document.createElement("div");
        eventsContainer.className = "events";
        this.eventList.appendChild(eventsContainer);
        for (const event of midifile.getEvents()) {
            const isTrackSelected = this.trackFilter.selected[event.track];
            if (!isTrackSelected) {
                continue;
            }
            const eventDate = document.createElement("div");
            eventDate.className = "event-date";
            eventsContainer.appendChild(eventDate);
            this.renderEvent(eventDate, event);
        }
        this.element.appendChild(this.eventList);
    }
}