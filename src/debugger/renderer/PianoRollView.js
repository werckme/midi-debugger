import { eventDataToString, eventTypeToString, getNumberOfTracks, getTracks } from "./MidiHelper";
import * as MidiEvents from 'midievents';
import { CheckboxFilterGroup } from './CheckboxFilterGroup';
import * as _ from 'lodash';

const xmlns = "http://www.w3.org/2000/svg";

export class PianoRollView {
    element = null;
    ppq = 0;
    trackFilter = new CheckboxFilterGroup();
    trackFilterElement = null;
    filterItems = null;
    eventList = null;
    constructor(element) {
        this.element = element;
    }

    update(midifile) {
        this.element.innerHTML = '';
        const tracks = getTracks(midifile);
        const filterItems = tracks.map((x, idx) => ({name: `${x}(${idx})`, value: idx, class_: `wm-dbg-track-${idx}`}));
        const filterChanged = _(filterItems).isEqual(this.filterItems) === false;
        let trackFilterElement = null;
        if (filterChanged) {
            this.filterItems = filterItems;
            this.trackFilterElement = this.trackFilter.createElement(this.filterItems);
        }
        this.trackFilter.onSelectionChanged = () => {
            this.render(midifile);
        };
        this.element.appendChild(this.trackFilterElement);
        this.ppq = midifile.header.getTicksPerBeat();
        this.render(midifile);
    }


    renderEvent(track, event) {
        const xscale = 100;
        const yscale = 10;
        const container = track.group;
        const type = eventTypeToString(event);
        const isNoteOn = event.type === MidiEvents.EVENT_MIDI && event.subtype === MidiEvents.EVENT_MIDI_NOTE_ON;
        const isNoteOff = event.type === MidiEvents.EVENT_MIDI && event.subtype === MidiEvents.EVENT_MIDI_NOTE_OFF;
        if (!isNoteOn && !isNoteOff) {
            return;
        }
        const pitch = event.param1;
        if (isNoteOn) {
            track.noteOnEvents[pitch] = event;
            return;
        }
        const noteOn = track.noteOnEvents[pitch];
        if (!noteOn) {
            console.warn(`corresponding midi on note not found`)
            return;
        }
        const duration = event.absPosition - noteOn.absPosition;
        const rect = document.createElementNS(xmlns, 'rect');
        rect.setAttributeNS(null, "x", noteOn.absPosition * xscale);
        rect.setAttributeNS(null, "y", pitch * yscale);
        rect.setAttributeNS(null, "width", duration * xscale);
        rect.setAttributeNS(null, "height", 10);
        rect.setAttributeNS(null, "fill", "red");
        rect.setAttributeNS(null, "stroke", "black");
        container.appendChild(rect);
    }
    quarters = 0;
    render(midifile) {
        
        const tracks = {};
        this.quarters = 0;
        if (!this.eventList) {
            this.eventList = document.createElementNS(xmlns, "svg");
            this.eventList.setAttributeNS(null, "width", "1200");
            this.eventList.setAttributeNS(null, "height", "700");
        } else {
            this.eventList.innerHTML = '';
        }
        for (const event of midifile.getEvents()) {
            this.quarters += event.delta / this.ppq;
            event.absPosition = this.quarters;
            let track = tracks[event.track];
            if (!track) {
                track = { group: document.createElementNS(xmlns, "g"), noteOnEvents: {} };
                tracks[event.track] = track;
                this.eventList.appendChild(track.group);
            }
            this.renderEvent(track, event);
        }
        this.element.appendChild(this.eventList);
    }
}